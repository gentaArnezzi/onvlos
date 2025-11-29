"use server";

import { db } from "@/lib/db";
import { conversations, messages, client_spaces, users } from "@/lib/db/schema";
import { eq, asc, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Mock user for MVP if auth not fully passed
const MOCK_USER_ID = "00000000-0000-0000-0000-000000000000"; 

export async function getConversation(clientSpaceId: string) {
    try {
        let conversation = await db.query.conversations.findFirst({
            where: eq(conversations.client_space_id, clientSpaceId)
        });

        if (!conversation) {
             // Auto-create conversation if it doesn't exist
             const workspaceId = "00000000-0000-0000-0000-000000000000"; // Mock
             const [newConv] = await db.insert(conversations).values({
                 workspace_id: workspaceId,
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

export async function sendMessage(conversationId: string, content: string, userId: string = MOCK_USER_ID) {
    try {
        await db.insert(messages).values({
            conversation_id: conversationId,
            user_id: userId,
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
    const space = await db.query.client_spaces.findFirst({
        where: eq(client_spaces.client_id, clientId)
    });
    return space ? space.id : null;
}
