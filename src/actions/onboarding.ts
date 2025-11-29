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
  funnels
} from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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
    data,
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

  // 5. Create Invoice if invoice step exists
  const invoiceStep = progressData.step_2;
  if (invoiceStep?.data?.amount) {
    const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;
    
    const [newInvoice] = await db.insert(invoices).values({
      workspace_id: funnel.workspace_id,
      client_id: newClient.id,
      invoice_number: invoiceNumber,
      amount_subtotal: invoiceStep.data.amount.toString(),
      total_amount: invoiceStep.data.amount.toString(),
      tax_rate: "0",
      tax_amount: "0",
      status: "sent",
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      issued_date: new Date().toISOString()
    }).returning();

    await db.insert(invoice_items).values({
      invoice_id: newInvoice.id,
      name: "Onboarding Package",
      quantity: 1,
      unit_price: invoiceStep.data.amount.toString()
    });
  }

  // Mark session as completed
  await db.update(client_onboarding_sessions)
    .set({
      completed_at: new Date()
    })
    .where(eq(client_onboarding_sessions.id, sessionId));

  revalidatePath("/dashboard/clients");
  
  return {
    success: true,
    client: newClient,
    portalUrl: `/portal/${slug}`
  };
}
