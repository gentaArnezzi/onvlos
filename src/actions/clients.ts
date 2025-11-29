"use server";

import { db } from "@/lib/db";
import { client_companies, client_spaces, conversations, workspaces } from "@/lib/db/schema";
import { desc, eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/get-session";
import { sendEmail } from "@/lib/email";

export async function getClients() {
  try {
    const session = await getSession();
    if (!session) return [];
    
    // Get user's workspace
    const workspace = await db.query.workspaces.findFirst({
      where: eq(workspaces.created_by_user_id, session.user.id)
    });
    
    if (!workspace) return [];
    
    const clients = await db.select()
      .from(client_companies)
      .where(eq(client_companies.workspace_id, workspace.id))
      .orderBy(desc(client_companies.created_at));
    return clients;
  } catch (error) {
    console.error("Failed to fetch clients:", error);
    return [];
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
    
    // Delete related records first
    await db.delete(conversations)
      .where(eq(conversations.client_space_id, clientId));
      
    await db.delete(client_spaces)
      .where(eq(client_spaces.client_id, clientId));
    
    await db.delete(client_companies)
      .where(
        and(
          eq(client_companies.id, clientId),
          eq(client_companies.workspace_id, workspace.id)
        )
      );

    revalidatePath("/dashboard/clients");
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

    // Send welcome email to client
    const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/portal/${slug}`;
    const tempPassword = Math.random().toString(36).substring(2, 10); // Generate temp password
    
    await sendEmail(data.email, 'clientInvite', {
        clientName: data.name,
        portalUrl: portalUrl,
        password: tempPassword
    });

    revalidatePath("/dashboard/clients");
    return { success: true, client: newClient };
  } catch (error) {
    console.error("Failed to create client:", error);
    return { success: false, error: "Failed to create client" };
  }
}
