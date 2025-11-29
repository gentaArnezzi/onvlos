"use server";

import { db } from "@/lib/db";
import { messages, conversations, client_companies, client_spaces } from "@/lib/db/schema";
import { getOrCreateWorkspace } from "./workspace";
import { getSession } from "@/lib/get-session";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Get all clients with their last message for the conversation list
export async function getConversations() {
    const workspace = await getOrCreateWorkspace();

    // Get all clients for this workspace
    const clients = await db.select({
        id: client_companies.id,
        name: client_companies.name,
        company_name: client_companies.company_name,
        logo_url: client_companies.logo_url,
        email: client_companies.email,
    }).from(client_companies)
        .where(eq(client_companies.workspace_id, workspace.id))
        .orderBy(desc(client_companies.created_at));

    // For each client, get their client_space and last message
    const conversationsData = await Promise.all(
        clients.map(async (client) => {
            // Get client space
            const clientSpace = await db.select()
                .from(client_spaces)
                .where(eq(client_spaces.client_id, client.id))
                .limit(1);

            if (!clientSpace[0]) {
                return {
                    clientId: client.id,
                    clientName: client.company_name || client.name,
                    clientLogo: client.logo_url,
                    clientEmail: client.email,
                    conversationId: null,
                    lastMessage: null,
                    lastMessageTime: null,
                    unreadCount: 0,
                };
            }

            // Get conversation for this client space
            const conversation = await db.select()
                .from(conversations)
                .where(eq(conversations.client_space_id, clientSpace[0].id))
                .limit(1);

            if (!conversation[0]) {
                return {
                    clientId: client.id,
                    clientName: client.company_name || client.name,
                    clientLogo: client.logo_url,
                    clientEmail: client.email,
                    conversationId: null,
                    lastMessage: null,
                    lastMessageTime: null,
                    unreadCount: 0,
                };
            }

            // Get last message
            const lastMsg = await db.select()
                .from(messages)
                .where(eq(messages.conversation_id, conversation[0].id))
                .orderBy(desc(messages.created_at))
                .limit(1);

            return {
                clientId: client.id,
                clientName: client.company_name || client.name,
                clientLogo: client.logo_url,
                clientEmail: client.email,
                conversationId: conversation[0].id,
                lastMessage: lastMsg[0]?.content || null,
                lastMessageTime: lastMsg[0]?.created_at || null,
                unreadCount: 0, // TODO: Implement read tracking
            };
        })
    );

    return conversationsData;
}

// Get all messages for a specific client
export async function getMessages(clientId: string) {
    const workspace = await getOrCreateWorkspace();

    // Get client space
    const clientSpace = await db.select()
        .from(client_spaces)
        .where(and(
            eq(client_spaces.client_id, clientId),
            eq(client_spaces.workspace_id, workspace.id)
        ))
        .limit(1);

    if (!clientSpace[0]) {
        return [];
    }

    // Get or create conversation
    let conversation = await db.select()
        .from(conversations)
        .where(eq(conversations.client_space_id, clientSpace[0].id))
        .limit(1);

    if (!conversation[0]) {
        // Create conversation if it doesn't exist
        const newConv = await db.insert(conversations).values({
            workspace_id: workspace.id,
            client_space_id: clientSpace[0].id,
            title: clientSpace[0].id,
        }).returning();

        conversation = newConv;
    }

    // Get all messages for this conversation
    const msgs = await db.select()
        .from(messages)
        .where(eq(messages.conversation_id, conversation[0].id))
        .orderBy(messages.created_at);

    return msgs;
}

// Send a new message
export async function sendMessage(clientId: string, content: string) {
    const session = await getSession();
    const workspace = await getOrCreateWorkspace();

    if (!session?.user?.id) {
        return { success: false, error: "Not authenticated" };
    }

    if (!content.trim()) {
        return { success: false, error: "Message cannot be empty" };
    }

    // Get client space
    const clientSpace = await db.select()
        .from(client_spaces)
        .where(and(
            eq(client_spaces.client_id, clientId),
            eq(client_spaces.workspace_id, workspace.id)
        ))
        .limit(1);

    if (!clientSpace[0]) {
        return { success: false, error: "Client space not found" };
    }

    // Get or create conversation
    let conversation = await db.select()
        .from(conversations)
        .where(eq(conversations.client_space_id, clientSpace[0].id))
        .limit(1);

    if (!conversation[0]) {
        const newConv = await db.insert(conversations).values({
            workspace_id: workspace.id,
            client_space_id: clientSpace[0].id,
            title: clientSpace[0].id,
        }).returning();

        conversation = newConv;
    }

    // Insert message
    const message = await db.insert(messages).values({
        conversation_id: conversation[0].id,
        user_id: session.user.id,
        content: content.trim(),
    }).returning();

    revalidatePath("/dashboard/chat");

    return { success: true, message: message[0] };
}
