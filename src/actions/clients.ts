"use server";

import { db } from "@/lib/db";
import { client_companies, client_spaces, conversations, workspaces, tasks, invoices, cards } from "@/lib/db/schema";
import { proposals, contracts } from "@/lib/db/schema-proposals";
import { files, file_shares } from "@/lib/db/schema-files";
import { desc, eq, and, sql, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/get-session";
import { sendEmail } from "@/lib/email";

export async function getClients(page: number = 1, limit: number = 12) {
  try {
    const session = await getSession();
    if (!session) return { clients: [], total: 0, totalPages: 0 };
    
    // Get user's workspace
    const workspace = await db.query.workspaces.findFirst({
      where: eq(workspaces.created_by_user_id, session.user.id)
    });
    
    if (!workspace) return { clients: [], total: 0, totalPages: 0 };
    
    // Get total count
    const totalResult = await db.select({ count: sql<number>`count(*)` })
      .from(client_companies)
      .where(eq(client_companies.workspace_id, workspace.id));
    const total = Number(totalResult[0]?.count || 0);
    const totalPages = Math.ceil(total / limit);
    
    // Get clients with pagination
    const offset = (page - 1) * limit;
    const clients = await db.select()
      .from(client_companies)
      .where(eq(client_companies.workspace_id, workspace.id))
      .orderBy(desc(client_companies.created_at))
      .limit(limit)
      .offset(offset);

    // Enrich with client space and additional data
    const enrichedClients = await Promise.all(
      clients.map(async (client) => {
        // Get client space for portal link
        const space = await db.query.client_spaces.findFirst({
          where: eq(client_spaces.client_id, client.id)
        });

        // Get task and invoice counts for engagement
        const taskCount = await db.select({ count: sql<number>`count(*)` })
          .from(tasks)
          .where(eq(tasks.client_id, client.id));
        const invoiceCount = await db.select({ count: sql<number>`count(*)` })
          .from(invoices)
          .where(eq(invoices.client_id, client.id));

        return {
          ...client,
          space_public_url: space?.public_url || null,
          task_count: Number(taskCount[0]?.count || 0),
          invoice_count: Number(invoiceCount[0]?.count || 0),
        };
      })
    );

    return { clients: enrichedClients, total, totalPages };
  } catch (error) {
    console.error("Failed to fetch clients:", error);
    return { clients: [], total: 0, totalPages: 0 };
  }
}

export async function updateClient(clientId: string, data: {
  name?: string;
  email?: string;
  company_name?: string;
  status?: string;
}) {
  try {
    const session = await getSession();
    if (!session) throw new Error("Not authenticated");
    
    const workspace = await db.query.workspaces.findFirst({
      where: eq(workspaces.created_by_user_id, session.user.id)
    });
    
    if (!workspace) throw new Error("No workspace found");
    
    const [updatedClient] = await db.update(client_companies)
      .set({
        ...data,
        updated_at: new Date()
      })
      .where(
        and(
          eq(client_companies.id, clientId),
          eq(client_companies.workspace_id, workspace.id)
        )
      )
      .returning();

    revalidatePath("/dashboard/clients");
    return { success: true, client: updatedClient };
  } catch (error) {
    console.error("Failed to update client:", error);
    return { success: false, error: "Failed to update client" };
  }
}

export async function deleteClient(clientId: string) {
  try {
    const session = await getSession();
    if (!session) throw new Error("Not authenticated");
    
    const workspace = await db.query.workspaces.findFirst({
      where: eq(workspaces.created_by_user_id, session.user.id)
    });
    
    if (!workspace) throw new Error("No workspace found");
    
    // Get client space IDs first (needed for conversations)
    const clientSpaces = await db.select({ id: client_spaces.id })
      .from(client_spaces)
      .where(eq(client_spaces.client_id, clientId));
    const spaceIds = clientSpaces.map(space => space.id);
    
    // Delete related records in correct order (respecting foreign key constraints)
    
    // 1. Delete conversations (via client_space_id)
    if (spaceIds.length > 0) {
      await db.delete(conversations)
        .where(inArray(conversations.client_space_id, spaceIds));
    }
    
    // 2. Delete tasks (onDelete: set null, so we need to delete manually)
    await db.delete(tasks)
      .where(eq(tasks.client_id, clientId));
    
    // 3. Delete cards (onDelete: set null, so we need to delete manually)
    await db.delete(cards)
      .where(eq(cards.client_id, clientId));
    
    // 4. Delete proposals
    await db.delete(proposals)
      .where(eq(proposals.client_id, clientId));
    
    // 5. Delete contracts
    await db.delete(contracts)
      .where(eq(contracts.client_id, clientId));
    
    // 6. Delete file shares that reference this client
    await db.delete(file_shares)
      .where(
        and(
          eq(file_shares.share_type, "client"),
          eq(file_shares.shared_with, clientId)
        )
      );
    
    // 7. Delete files associated with this client
    await db.delete(files)
      .where(eq(files.client_id, clientId));
    
    // 8. Delete client spaces (this will cascade delete conversations via FK)
    await db.delete(client_spaces)
      .where(eq(client_spaces.client_id, clientId));
    
    // 9. Delete invoices (onDelete: cascade, but we'll delete explicitly for clarity)
    // Note: invoice_items and payments will cascade delete automatically
    await db.delete(invoices)
      .where(eq(invoices.client_id, clientId));
    
    // 10. Finally, delete the client company
    await db.delete(client_companies)
      .where(
        and(
          eq(client_companies.id, clientId),
          eq(client_companies.workspace_id, workspace.id)
        )
      );

    revalidatePath("/dashboard/clients");
    revalidatePath("/dashboard/tasks");
    revalidatePath("/dashboard/invoices");
    revalidatePath("/dashboard/proposals");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete client:", error);
    return { success: false, error: "Failed to delete client" };
  }
}

export async function createClient(data: {
  name: string;
  email: string;
  company_name: string;
  status: string;
}) {
  try {
    const session = await getSession();
    if (!session) throw new Error("Not authenticated");
    
    // Get user's workspace
    const workspace = await db.query.workspaces.findFirst({
      where: eq(workspaces.created_by_user_id, session.user.id)
    });
    
    if (!workspace) throw new Error("No workspace found");
    
    const [newClient] = await db.insert(client_companies).values({
        name: data.name,
        email: data.email,
        company_name: data.company_name,
        status: data.status,
        workspace_id: workspace.id,
    }).returning();

    // Generate a unique public slug
    const slug = data.company_name.toLowerCase().replace(/[^a-z0-9]/g, '-') + "-" + Math.random().toString(36).substring(2, 7);

    // Auto-create Client Space (Portal)
    const [newSpace] = await db.insert(client_spaces).values({
        workspace_id: workspace.id,
        client_id: newClient.id,
        public_url: slug,
        branding: {
            primary_color: "#000000",
            accent_color: "#ffffff",
            font_family: "Inter"
        }
    }).returning();

    // Auto-create Conversation
    await db.insert(conversations).values({
        workspace_id: workspace.id,
        client_space_id: newSpace.id,
        title: "General Chat"
    });

    // Send welcome email to client (non-blocking - if email fails, client is still created)
    const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/portal/${slug}`;
    const tempPassword = Math.random().toString(36).substring(2, 10); // Generate temp password
    
    try {
      const emailResult = await sendEmail(data.email, 'clientInvite', {
          clientName: data.name,
          portalUrl: portalUrl,
          password: tempPassword
      });
      if (!emailResult.success) {
        console.warn('Email sending failed (non-critical):', emailResult.error);
      }
    } catch (emailError) {
      // Email sending is optional - don't fail client creation if email fails
      console.warn('Email sending error (non-critical):', emailError);
    }

    // Trigger workflow "new_client_created"
    const { triggerWorkflows } = await import("@/lib/workflows/engine");
    await triggerWorkflows("new_client_created", {
        client_id: newClient.id,
        workspace_id: workspace.id,
        client_name: data.name,
        client_email: data.email,
        company_name: data.company_name,
    });

    revalidatePath("/dashboard/clients");
    return { success: true, client: newClient };
  } catch (error) {
    console.error("Failed to create client:", error);
    return { success: false, error: "Failed to create client" };
  }
}
