"use server";

import { db } from "@/lib/db";
import { messages, conversations, client_companies, client_spaces, flows, users, message_reads } from "@/lib/db/schema";
import { getOrCreateWorkspace } from "./workspace";
import { getSession } from "@/lib/get-session";
import { eq, and, desc, or, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Get all conversations grouped by type (Flows, Clients Internal/External, Direct)
export async function getConversations() {
    const session = await getSession();
    if (!session) return { flows: [], clientsInternal: [], clientsExternal: [], direct: [] };

    const workspace = await getOrCreateWorkspace();
    if (!workspace) return { flows: [], clientsInternal: [], clientsExternal: [], direct: [] };

    // Get Flow conversations - need to get last message separately
    const flowConvs = await db.select({
        id: conversations.id,
        title: conversations.title,
        flow_id: conversations.flow_id,
        flow_name: flows.name,
        updated_at: conversations.updated_at,
    })
    .from(conversations)
    .leftJoin(flows, eq(conversations.flow_id, flows.id))
    .where(and(
        eq(conversations.workspace_id, workspace.id),
        eq(conversations.chat_type, "flow")
    ))
    .orderBy(desc(conversations.updated_at));

    const flowConversations = await Promise.all(flowConvs.map(async (conv) => {
        const lastMsg = await db.select()
            .from(messages)
            .where(eq(messages.conversation_id, conv.id))
            .orderBy(desc(messages.created_at))
            .limit(1);
        return {
            ...conv,
            lastMessage: lastMsg[0]?.content || null,
            lastMessageTime: lastMsg[0]?.created_at || null,
        };
    }));

    // Get Client Internal conversations (team only, no client)
    const clientInternalConvs = await db.select({
        id: conversations.id,
        title: conversations.title,
        client_space_id: conversations.client_space_id,
        client_id: client_companies.id,
        client_name: client_companies.name,
        client_company_name: client_companies.company_name,
        client_logo: client_companies.logo_url,
        updated_at: conversations.updated_at,
    })
    .from(conversations)
    .leftJoin(client_spaces, eq(conversations.client_space_id, client_spaces.id))
    .leftJoin(client_companies, eq(client_spaces.client_id, client_companies.id))
    .where(and(
        eq(conversations.workspace_id, workspace.id),
        eq(conversations.chat_type, "client_internal")
    ))
    .orderBy(desc(conversations.updated_at));

    const clientInternalConversations = await Promise.all(clientInternalConvs.map(async (conv) => {
        const lastMsg = await db.select()
            .from(messages)
            .where(eq(messages.conversation_id, conv.id))
            .orderBy(desc(messages.created_at))
            .limit(1);
        return {
            ...conv,
            lastMessage: lastMsg[0]?.content || null,
            lastMessageTime: lastMsg[0]?.created_at || null,
        };
    }));

    // Get Client External conversations (with client)
    const clientExternalConvs = await db.select({
        id: conversations.id,
        title: conversations.title,
        client_space_id: conversations.client_space_id,
        client_id: client_companies.id,
        client_name: client_companies.name,
        client_company_name: client_companies.company_name,
        client_logo: client_companies.logo_url,
        updated_at: conversations.updated_at,
    })
    .from(conversations)
    .leftJoin(client_spaces, eq(conversations.client_space_id, client_spaces.id))
    .leftJoin(client_companies, eq(client_spaces.client_id, client_companies.id))
    .where(and(
        eq(conversations.workspace_id, workspace.id),
        eq(conversations.chat_type, "client_external")
    ))
    .orderBy(desc(conversations.updated_at));

    const clientExternalConversations = await Promise.all(clientExternalConvs.map(async (conv) => {
        const lastMsg = await db.select()
            .from(messages)
            .where(eq(messages.conversation_id, conv.id))
            .orderBy(desc(messages.created_at))
            .limit(1);
        return {
            ...conv,
            lastMessage: lastMsg[0]?.content || null,
            lastMessageTime: lastMsg[0]?.created_at || null,
        };
    }));

    // Get Direct Message conversations
    const directConvs = await db.select({
        id: conversations.id,
        title: conversations.title,
        user_id_1: conversations.user_id_1,
        user_id_2: conversations.user_id_2,
        updated_at: conversations.updated_at,
    })
    .from(conversations)
    .where(and(
        eq(conversations.workspace_id, workspace.id),
        eq(conversations.chat_type, "direct"),
        or(
            eq(conversations.user_id_1, session.user.id),
            eq(conversations.user_id_2, session.user.id)
        )
    ))
    .orderBy(desc(conversations.updated_at));

    const directConversations = await Promise.all(directConvs.map(async (conv) => {
        const otherUserId = conv.user_id_1 === session.user.id ? conv.user_id_2 : conv.user_id_1;
        const otherUser = otherUserId ? await db.query.users.findFirst({
            where: eq(users.id, otherUserId)
        }) : null;
        const lastMsg = await db.select()
            .from(messages)
            .where(eq(messages.conversation_id, conv.id))
            .orderBy(desc(messages.created_at))
            .limit(1);
        return {
            ...conv,
            other_user_id: otherUserId,
            other_user_name: otherUser?.name || null,
            lastMessage: lastMsg[0]?.content || null,
            lastMessageTime: lastMsg[0]?.created_at || null,
        };
    }));

                return {
        flows: flowConversations,
        clientsInternal: clientInternalConversations,
        clientsExternal: clientExternalConversations,
        direct: directConversations,
    };
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
            chat_type: "client_external",
            title: clientSpace[0].id,
        }).returning();

        conversation = newConv;
    }

    // Get all messages for this conversation with user info
    const msgs = await db.select({
        id: messages.id,
        conversation_id: messages.conversation_id,
        user_id: messages.user_id,
        content: messages.content,
        reply_to_message_id: messages.reply_to_message_id,
        is_starred: messages.is_starred,
        is_pinned: messages.is_pinned,
        attachments: messages.attachments,
        scheduled_for: messages.scheduled_for,
        created_at: messages.created_at,
        updated_at: messages.updated_at,
        deleted_at: messages.deleted_at,
        user_name: users.name,
    })
    .from(messages)
    .leftJoin(users, eq(messages.user_id, users.id))
    .where(eq(messages.conversation_id, conversation[0].id))
    .orderBy(asc(messages.created_at));

    // Get reply messages and read status for each message
    const messagesWithDetails = await Promise.all(msgs.map(async (msg) => {
        let replyToMessage = null;
        if (msg.reply_to_message_id) {
            const replyMsg = await db.query.messages.findFirst({
                where: eq(messages.id, msg.reply_to_message_id),
            });
            const replyUser = replyMsg ? await db.query.users.findFirst({
                where: eq(users.id, replyMsg.user_id)
            }) : null;
            if (replyMsg) {
                replyToMessage = {
                    content: replyMsg.content,
                    user_name: replyUser?.name || "User",
                };
            }
        }

        // Get read status
        const reads = await db.select()
            .from(message_reads)
            .where(eq(message_reads.message_id, msg.id));
        const readBy = reads.map(r => r.user_id);

        return {
            ...msg,
            reply_to_message: replyToMessage,
            read_by: readBy,
        };
    }));

    return messagesWithDetails;
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
            chat_type: "client_external",
            title: clientSpace[0].id,
        }).returning();

        conversation = newConv;
    }

    // Insert message
    try {
        const insertResult = await db.insert(messages).values({
            conversation_id: conversation[0].id,
            user_id: session.user.id,
            content: content.trim(),
        }).returning();

        const newMessage = (Array.isArray(insertResult) ? insertResult[0] : insertResult) as typeof messages.$inferSelect | undefined;

        if (!newMessage) {
            console.error("sendMessage: Failed to insert message - no message returned", { clientId, conversationId: conversation[0].id });
            return { success: false, error: "Failed to save message" };
        }

        console.log("sendMessage: Message saved successfully", { messageId: newMessage.id, conversationId: conversation[0].id });

        // Get user info for the message
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.user.id),
        });

        // Return message with user_name
        const messageWithUser = {
            ...newMessage,
            user_name: user?.name || "User",
            reply_to_message: null,
            read_by: [],
            is_read: false,
        };

        revalidatePath("/dashboard/chat");

        return { success: true, message: messageWithUser };
    } catch (error: any) {
        console.error("sendMessage: Error saving message", error);
        return { success: false, error: error?.message || "Failed to save message" };
    }
}

// Get messages by conversation ID
export async function getMessagesByConversationId(conversationId: string) {
    try {
        const workspace = await getOrCreateWorkspace();
        if (!workspace) {
            console.error("getMessagesByConversationId: Workspace not found");
            return [];
        }

        // Verify conversation belongs to workspace
        const conversation = await db.select()
            .from(conversations)
            .where(and(
                eq(conversations.id, conversationId),
                eq(conversations.workspace_id, workspace.id)
            ))
            .limit(1);

        if (!conversation[0]) {
            console.error("getMessagesByConversationId: Conversation not found", { conversationId, workspaceId: workspace.id });
            return [];
        }

        // Get messages with user info
        const msgs = await db.select({
            id: messages.id,
            conversation_id: messages.conversation_id,
            user_id: messages.user_id,
            content: messages.content,
            reply_to_message_id: messages.reply_to_message_id,
            is_starred: messages.is_starred,
            is_pinned: messages.is_pinned,
            attachments: messages.attachments,
            scheduled_for: messages.scheduled_for,
            created_at: messages.created_at,
            updated_at: messages.updated_at,
            deleted_at: messages.deleted_at,
            user_name: users.name,
        })
        .from(messages)
        .leftJoin(users, eq(messages.user_id, users.id))
        .where(eq(messages.conversation_id, conversationId))
        .orderBy(asc(messages.created_at));

        // Get reply messages and read status for each message
        const messagesWithDetails = await Promise.all(msgs.map(async (msg) => {
            let replyToMessage = null;
            if (msg.reply_to_message_id) {
                const replyMsg = await db.query.messages.findFirst({
                    where: eq(messages.id, msg.reply_to_message_id),
                });
                const replyUser = replyMsg ? await db.query.users.findFirst({
                    where: eq(users.id, replyMsg.user_id)
                }) : null;
                if (replyMsg) {
                    replyToMessage = {
                        content: replyMsg.content,
                        user_name: replyUser?.name || "User",
                    };
                }
            }

            // Get read status
            const reads = await db.select()
                .from(message_reads)
                .where(eq(message_reads.message_id, msg.id));
            const readBy = reads.map(r => r.user_id);

            return {
                ...msg,
                reply_to_message: replyToMessage,
                read_by: readBy,
            };
        }));

        console.log("getMessagesByConversationId: Loaded messages", { conversationId, count: messagesWithDetails.length });
        return messagesWithDetails;
    } catch (error: any) {
        console.error("getMessagesByConversationId: Error loading messages", error);
        return [];
    }
}

// Send message to conversation by ID
export async function sendMessageToConversation(conversationId: string, content: string, replyToMessageId?: string) {
    try {
        const session = await getSession();
        if (!session) {
            console.error("sendMessageToConversation: Not authenticated");
            return { success: false, error: "Not authenticated" };
        }

        const workspace = await getOrCreateWorkspace();
        if (!workspace) {
            console.error("sendMessageToConversation: Workspace not found");
            return { success: false, error: "Workspace not found" };
        }

        // Verify conversation belongs to workspace
        const conversation = await db.select()
            .from(conversations)
            .where(and(
                eq(conversations.id, conversationId),
                eq(conversations.workspace_id, workspace.id)
            ))
            .limit(1);

        if (!conversation[0]) {
            console.error("sendMessageToConversation: Conversation not found", { conversationId, workspaceId: workspace.id });
            return { success: false, error: "Conversation not found" };
        }

        // Insert message
        const insertResult = await db.insert(messages).values({
            conversation_id: conversationId,
            user_id: session.user.id,
            content: content.trim(),
            reply_to_message_id: replyToMessageId || null,
        }).returning();

        const newMessage = (Array.isArray(insertResult) ? insertResult[0] : insertResult) as typeof messages.$inferSelect | undefined;

        if (!newMessage) {
            console.error("sendMessageToConversation: Failed to insert message - no message returned", { conversationId, userId: session.user.id });
            return { success: false, error: "Failed to save message" };
        }

        console.log("sendMessageToConversation: Message saved successfully", { messageId: newMessage.id, conversationId });

        // Get user info for the message
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.user.id),
        });

        // Update conversation updated_at
        await db.update(conversations)
            .set({ updated_at: new Date() })
            .where(eq(conversations.id, conversationId));

        // Return message with user_name and proper format
        const messageWithUser = {
            ...newMessage,
            user_name: user?.name || "User",
            reply_to_message: null,
            read_by: [],
            is_read: false,
        };

        revalidatePath("/dashboard/chat");
        revalidatePath(`/dashboard/chat?conversation=${conversationId}`);
        return { success: true, message: messageWithUser };
    } catch (error: any) {
        console.error("sendMessageToConversation: Error saving message", error);
        return { success: false, error: error?.message || "Failed to save message" };
    }
}
