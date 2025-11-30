"use server";

import { db } from "@/lib/db";
import { conversations, messages, client_spaces, client_companies, users } from "@/lib/db/schema";
import { eq, asc, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getOrCreateWorkspace } from "@/actions/workspace";
import { getSession } from "@/lib/get-session";

export async function getConversation(clientSpaceId: string) {
    try {
        const session = await getSession();
        if (!session) return null;

        const workspace = await getOrCreateWorkspace();
        if (!workspace) return null;

        // Verify that the client space belongs to the user's workspace
        const clientSpace = await db.query.client_spaces.findFirst({
            where: eq(client_spaces.id, clientSpaceId)
        });

        if (!clientSpace || clientSpace.workspace_id !== workspace.id) {
            return null;
        }

        let conversation = await db.query.conversations.findFirst({
            where: and(
                eq(conversations.client_space_id, clientSpaceId),
                eq(conversations.workspace_id, workspace.id)
            )
        });

        if (!conversation) {
             // Auto-create conversation if it doesn't exist
             const [newConv] = await db.insert(conversations).values({
                 workspace_id: workspace.id,
                 client_space_id: clientSpaceId,
                 title: "General Chat"
             }).returning();
             conversation = newConv;
        }

        const msgs = await db.select({
            id: messages.id,
            content: messages.content,
            created_at: messages.created_at,
            user_id: messages.user_id,
            user_name: users.name
        })
        .from(messages)
        .leftJoin(users, eq(messages.user_id, users.id))
        .where(eq(messages.conversation_id, conversation.id))
        .orderBy(asc(messages.created_at));

        return { conversation, messages: msgs };
    } catch (error) {
        console.error("Error fetching conversation:", error);
        return null;
    }
}

export async function sendMessage(conversationId: string, content: string, userId?: string) {
    try {
        // Get user ID from session if not provided
        let messageUserId = userId;
        const session = await getSession();
        if (!session) throw new Error("Not authenticated");
        if (!messageUserId) {
            messageUserId = session.user.id;
        }

        const workspace = await getOrCreateWorkspace();
        if (!workspace) {
            return { success: false, error: "Workspace not found" };
        }

        // Verify that the conversation belongs to the user's workspace
        const conversation = await db.query.conversations.findFirst({
            where: and(
                eq(conversations.id, conversationId),
                eq(conversations.workspace_id, workspace.id)
            )
        });

        if (!conversation) {
            return { success: false, error: "Conversation not found or access denied" };
        }
        
        await db.insert(messages).values({
            conversation_id: conversationId,
            user_id: messageUserId,
            content: content
        });
        
        // Revalidate both dashboard and portal paths potentially
        revalidatePath("/dashboard/clients"); 
        revalidatePath("/portal");
        return { success: true };
    } catch (error) {
         console.error("Error sending message:", error);
        return { success: false };
    }
}

export async function getClientSpaceId(clientId: string) {
    try {
        const session = await getSession();
        if (!session) return null;

        const workspace = await getOrCreateWorkspace();
        if (!workspace) return null;

        // Verify that the client belongs to the user's workspace
        const client = await db.query.client_companies.findFirst({
            where: and(
                eq(client_companies.id, clientId),
                eq(client_companies.workspace_id, workspace.id)
            )
        });

        if (!client) {
            return null;
        }

        const space = await db.query.client_spaces.findFirst({
            where: eq(client_spaces.client_id, clientId)
        });
        return space ? space.id : null;
    } catch (error) {
        console.error("Error getting client space ID:", error);
        return null;
    }
}
