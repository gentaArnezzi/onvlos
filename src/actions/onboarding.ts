"use server";

import { db } from "@/lib/db";
import { 
  client_onboarding_sessions, 
  client_companies, 
  client_spaces,
  conversations,
  cards,
  board_columns,
  boards,
  invoices,
  invoice_items,
  funnels,
  payments,
  tasks,
  documents,
  document_folders
} from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";

export async function startOnboarding(funnelId: string, email: string) {
  // Create or find onboarding session
  const existingSession = await db.query.client_onboarding_sessions.findFirst({
    where: and(
      eq(client_onboarding_sessions.funnel_id, funnelId),
      eq(client_onboarding_sessions.client_email, email),
      isNull(client_onboarding_sessions.completed_at)
    )
  });

  if (existingSession) {
    return existingSession;
  }

  const [newSession] = await db.insert(client_onboarding_sessions).values({
    funnel_id: funnelId,
    client_email: email,
    current_step: 0,
    progress_data: {},
    magic_link_token: crypto.randomUUID()
  }).returning();

  return newSession;
}

export async function completeOnboardingStep(
  sessionId: string, 
  stepIndex: number, 
  stepType: string,
  data: any
) {
  const session = await db.query.client_onboarding_sessions.findFirst({
    where: eq(client_onboarding_sessions.id, sessionId)
  });

  if (!session) throw new Error("Session not found");

  // Update progress data
  const progressData = (session.progress_data || {}) as any;
  progressData[`step_${stepIndex}`] = {
    completed: true,
    data: {
      ...data,
      // Store signature data if contract step
      signature_data: stepType === 'contract' && data.signature_data ? data.signature_data : undefined,
      signer_name: stepType === 'contract' && data.signer_name ? data.signer_name : undefined,
      signer_email: stepType === 'contract' && data.signer_email ? data.signer_email : undefined,
      contract_signed: stepType === 'contract' ? true : undefined,
      signed_at: stepType === 'contract' ? new Date().toISOString() : undefined
    },
    completedAt: new Date().toISOString()
  };

  // Update session
  await db.update(client_onboarding_sessions)
    .set({
      current_step: stepIndex + 1,
      progress_data: progressData
    })
    .where(eq(client_onboarding_sessions.id, sessionId));

  // Get funnel for workspace_id
  const funnel = await db.query.funnels.findFirst({
    where: eq(funnels.id, session.funnel_id)
  });

  // Trigger workflow "funnel_step_completed"
  if (funnel) {
    const { triggerWorkflows } = await import("@/lib/workflows/engine");
    await triggerWorkflows("funnel_step_completed", {
      funnel_id: session.funnel_id,
      step_type: stepType,
      step_index: stepIndex,
      client_onboarding_session_id: sessionId,
      workspace_id: funnel.workspace_id,
      client_email: session.client_email,
    });
  }

  return { success: true };
}

export async function completeOnboarding(sessionId: string) {
  const session = await db.query.client_onboarding_sessions.findFirst({
    where: eq(client_onboarding_sessions.id, sessionId)
  });

  if (!session) throw new Error("Session not found");

  // Get funnel details
  const funnel = await db.query.funnels.findFirst({
    where: eq(funnels.id, session.funnel_id)
  });

  if (!funnel) throw new Error("Funnel not found");

  const progressData = (session.progress_data || {}) as any;
  const formData = progressData.step_0?.data || {};

  // 1. Create Client
  const [newClient] = await db.insert(client_companies).values({
    workspace_id: funnel.workspace_id,
    name: formData.name || session.client_email,
    email: session.client_email,
    company_name: formData.company || "New Client",
    status: "active",
    description: formData.description
  }).returning();

  // Trigger workflow "new_client_created" (from funnel completion)
  const { triggerWorkflows } = await import("@/lib/workflows/engine");
  await triggerWorkflows("new_client_created", {
    client_id: newClient.id,
    workspace_id: funnel.workspace_id,
    client_name: newClient.name,
    client_email: newClient.email,
    company_name: newClient.company_name,
    source: "funnel",
    funnel_id: funnel.id,
  });

  // 2. Create Client Space
  const slug = (newClient.company_name || "client").toLowerCase().replace(/[^a-z0-9]/g, '-') + "-" + Math.random().toString(36).substring(2, 7);
  const [newSpace] = await db.insert(client_spaces).values({
    workspace_id: funnel.workspace_id,
    client_id: newClient.id,
    public_url: slug,
    branding: {
      primary_color: "#000000",
      accent_color: "#ffffff",
      font_family: "Inter"
    }
  }).returning();

  // 3. Create Conversation
  await db.insert(conversations).values({
    workspace_id: funnel.workspace_id,
    client_space_id: newSpace.id,
    chat_type: "client_external",
    title: "General Chat"
  });

  // 4. Create Board Card (if board exists)
  const board = await db.query.boards.findFirst({
    where: and(
      eq(boards.workspace_id, funnel.workspace_id),
      eq(boards.board_type, "sales")
    )
  });

  if (board) {
    const firstColumn = await db.query.board_columns.findFirst({
      where: eq(board_columns.board_id, board.id),
      orderBy: (columns, { asc }) => [asc(columns.order)]
    });

    if (firstColumn) {
      await db.insert(cards).values({
        column_id: firstColumn.id,
        client_id: newClient.id,
        title: newClient.company_name || "New Client",
        description: `New client from ${funnel.name}`,
        order: 0
      });
    }
  }

  // 5. Check payment status and create invoice if invoice step exists
  const invoiceStep = Object.values(progressData).find((step: any) => step?.data?.amount) as any;
  let paymentCompleted = false;
  
  if (invoiceStep?.data?.amount) {
    const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;
    
    // Check if payment was completed
    if (invoiceStep.data.paid && invoiceStep.data.transaction_id) {
      paymentCompleted = true;
    }
    
    const [newInvoice] = await db.insert(invoices).values({
      workspace_id: funnel.workspace_id,
      client_id: newClient.id,
      invoice_number: invoiceNumber,
      amount_subtotal: invoiceStep.data.amount.toString(),
      total_amount: invoiceStep.data.amount.toString(),
      tax_rate: "0",
      tax_amount: "0",
      status: paymentCompleted ? "paid" : "sent",
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      issued_date: new Date().toISOString(),
      paid_date: paymentCompleted ? new Date().toISOString() : null,
    }).returning();

    await db.insert(invoice_items).values({
      invoice_id: newInvoice.id,
      name: "Onboarding Package",
      quantity: 1,
      unit_price: invoiceStep.data.amount.toString()
    });

    // If payment completed, record payment
    if (paymentCompleted && invoiceStep.data.transaction_id) {
      await db.insert(payments).values({
        invoice_id: newInvoice.id,
        gateway: "midtrans",
        gateway_payment_id: invoiceStep.data.transaction_id,
        amount: invoiceStep.data.amount.toString(),
        currency: invoiceStep.data.currency || "IDR",
        status: "completed",
        paid_at: new Date(),
        metadata: {
          payment_method: "qris",
          source: "funnel",
        },
      });
    }
  }

  // 6. Auto-duplicate client space template if payment completed or no payment required
  if (paymentCompleted || !invoiceStep) {
    // Check if funnel has a template client space to duplicate
    const templateSpaceId = funnel.client_space_template_id;
    if (templateSpaceId) {
      const templateSpace = await db.query.client_spaces.findFirst({
        where: eq(client_spaces.id, templateSpaceId)
      });

      if (templateSpace) {
        // Duplicate template space content
        // Update the new space with template branding and settings
        await db.update(client_spaces)
          .set({
            branding: templateSpace.branding,
            banner_url: templateSpace.banner_url,
            welcome_video_url: templateSpace.welcome_video_url,
            logo_url: templateSpace.logo_url,
          })
          .where(eq(client_spaces.id, newSpace.id));

        // Duplicate template tasks
        const templateTasks = await db.query.tasks.findMany({
          where: eq(tasks.client_id, templateSpace.client_id)
        });

        for (const templateTask of templateTasks) {
          await db.insert(tasks).values({
            workspace_id: funnel.workspace_id,
            client_id: newClient.id,
            title: templateTask.title,
            description: templateTask.description,
            priority: templateTask.priority,
            status: "todo",
            due_date: templateTask.due_date,
          });
        }

        // Duplicate template documents (Brain)
        const templateFoldersList = await db.query.document_folders.findMany({
          where: and(
            eq(document_folders.workspace_id, funnel.workspace_id),
            eq(document_folders.folder_type, "client_external"),
            eq(document_folders.client_id, templateSpace.client_id)
          )
        });

        for (const templateFolder of templateFoldersList) {
          const newFolderResult = await db.insert(document_folders).values({
            workspace_id: funnel.workspace_id,
            name: templateFolder.name,
            parent_folder_id: null, // Simplified - can be enhanced
            folder_type: "client_external",
            client_id: newClient.id,
            created_by_user_id: null,
          }).returning();
          
          const newFolder = Array.isArray(newFolderResult) ? newFolderResult[0] : newFolderResult;

          // Duplicate documents in this folder
          const templateDocsList = await db.query.documents.findMany({
            where: eq(documents.folder_id, templateFolder.id)
          });

          for (const templateDoc of templateDocsList) {
            await db.insert(documents).values({
              workspace_id: funnel.workspace_id,
              folder_id: newFolder?.id || null,
              title: templateDoc.title,
              content: templateDoc.content,
              file_type: templateDoc.file_type,
              file_url: templateDoc.file_url,
              file_size: templateDoc.file_size,
              mime_type: templateDoc.mime_type,
              created_by_user_id: null,
            });
          }
        }
      }
    }
  }

  // Mark session as completed
  await db.update(client_onboarding_sessions)
    .set({
      completed_at: new Date()
    })
    .where(eq(client_onboarding_sessions.id, sessionId));

  // Send funnel completion email
  try {
    if (newClient.email) {
      const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/portal/${slug}`;
      await sendEmail(newClient.email, 'funnelCompletion', {
        clientName: newClient.name || newClient.company_name || 'Client',
        funnelName: funnel.name,
        portalUrl,
      });
    }
  } catch (emailError) {
    console.error("Failed to send funnel completion email:", emailError);
    // Don't fail the whole operation if email fails
  }

  // Send payment confirmation email if payment was completed
  if (paymentCompleted && invoiceStep?.data) {
    try {
      if (newClient.email) {
        await sendEmail(newClient.email, 'paymentReceived', {
          clientName: newClient.name || newClient.company_name || 'Client',
          invoiceNumber: `FUNNEL-${funnel.id.substring(0, 8)}`,
          amount: `${invoiceStep.data.currency || 'IDR'} ${invoiceStep.data.amount.toLocaleString('id-ID')}`,
        });
      }
    } catch (emailError) {
      console.error("Failed to send payment confirmation email:", emailError);
    }
  }

  revalidatePath("/dashboard/clients");
  
  return {
    success: true,
    client: newClient,
    portalUrl: `/portal/${slug}`
  };
}
