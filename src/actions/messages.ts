"use server";

import { db } from "@/lib/db";
import { messages, conversations, client_companies, client_spaces, flows, users, message_reads } from "@/lib/db/schema";
import { getOrCreateWorkspace } from "./workspace";
import { getSession } from "@/lib/get-session";
import { eq, and, desc, or, asc, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";

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
        const lastMsg = await db.select({
            id: messages.id,
            content: messages.content,
            user_id: messages.user_id,
            created_at: messages.created_at,
        })
            .from(messages)
            .where(eq(messages.conversation_id, conv.id))
            .orderBy(desc(messages.created_at))
            .limit(1);
        
        const lastMessage = lastMsg[0];
        let lastMessageSenderName = null;
        if (lastMessage) {
            const sender = await db.query.users.findFirst({
                where: eq(users.id, lastMessage.user_id)
            });
            lastMessageSenderName = sender?.name || null;
        }

        // Get unread count
        const allMessages = await db.select({ id: messages.id })
            .from(messages)
            .where(eq(messages.conversation_id, conv.id));
        
        const readMessageIds = await db.select({ message_id: message_reads.message_id })
            .from(message_reads)
            .where(eq(message_reads.user_id, session.user.id));
        
        const readIds = new Set(readMessageIds.map(r => r.message_id));
        const unreadCount = allMessages.filter(m => !readIds.has(m.id)).length;

        return {
            ...conv,
            lastMessage: lastMessage?.content || null,
            lastMessageTime: lastMessage?.created_at || null,
            last_message_sender_name: lastMessageSenderName || null,
            unreadCount: unreadCount.length || 0,
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
        const lastMsg = await db.select({
            id: messages.id,
            content: messages.content,
            user_id: messages.user_id,
            created_at: messages.created_at,
        })
            .from(messages)
            .where(eq(messages.conversation_id, conv.id))
            .orderBy(desc(messages.created_at))
            .limit(1);
        
        const lastMessage = lastMsg[0];
        let lastMessageSenderName = null;
        if (lastMessage) {
            const sender = await db.query.users.findFirst({
                where: eq(users.id, lastMessage.user_id)
            });
            lastMessageSenderName = sender?.name || null;
        }

        // Get unread count (messages not read by current user)
        const allMessages = await db.select({ id: messages.id })
            .from(messages)
            .where(eq(messages.conversation_id, conv.id));
        
        const readMessageIds = await db.select({ message_id: message_reads.message_id })
            .from(message_reads)
            .where(eq(message_reads.user_id, session.user.id));
        
        const readIds = new Set(readMessageIds.map(r => r.message_id));
        const unreadCount = allMessages.filter(m => !readIds.has(m.id)).length;

        return {
            ...conv,
            lastMessage: lastMessage?.content || null,
            lastMessageTime: lastMessage?.created_at || null,
            last_message_sender_name: lastMessageSenderName || null,
            unreadCount: unreadCount.length || 0,
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
        delivery_status: messages.delivery_status,
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
export async function sendMessage(clientId: string, content: string, chatType?: "client_internal" | "client_external") {
    const session = await getSession();
    const workspace = await getOrCreateWorkspace();

    if (!session?.user?.id) {
        return { success: false, error: "Not authenticated" };
    }

    if (!content.trim()) {
        return { success: false, error: "Message cannot be empty" };
    }

    // Default to client_external for backward compatibility
    const targetChatType = chatType || "client_external";

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

    // Get or create conversation based on chatType
    let conversation = await db.select()
        .from(conversations)
        .where(and(
            eq(conversations.client_space_id, clientSpace[0].id),
            eq(conversations.chat_type, targetChatType)
        ))
        .limit(1);

    if (!conversation[0]) {
        const newConv = await db.insert(conversations).values({
            workspace_id: workspace.id,
            client_space_id: clientSpace[0].id,
            chat_type: targetChatType,
            title: clientSpace[0].id,
        }).returning();

        conversation = newConv;
        logger.debug(`Created new ${targetChatType} conversation`, { conversationId: newConv[0].id, clientId, chatType: targetChatType });
    } else {
        logger.debug(`Using existing ${targetChatType} conversation`, { conversationId: conversation[0].id, clientId, chatType: targetChatType });
    }

        // Insert message
        try {
        const insertResult = await db.insert(messages).values({
            conversation_id: conversation[0].id,
            user_id: session.user.id,
            content: content.trim(),
            delivery_status: "sent", // Message is sent to server
        }).returning();

        const newMessage = (Array.isArray(insertResult) ? insertResult[0] : insertResult) as typeof messages.$inferSelect | undefined;

        if (!newMessage) {
            logger.error("Failed to insert message - no message returned", undefined, { clientId, conversationId: conversation[0].id });
            return { success: false, error: "Failed to save message" };
        }

        logger.logMessageSent(newMessage.id, conversation[0].id, session.user.id);

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

        // Broadcast message via socket.io for real-time updates
        // Since we're using server.js, we need to use a client-side socket to broadcast
        // OR we can make an API call that triggers the broadcast
        // For now, we'll try to use getIO if available, otherwise the message is saved
        // and clients can poll or use socket events
        try {
            const { getIO } = await import("@/lib/socket");
            const io = getIO();
            
            if (io) {
                const roomName = `conversation-${conversation[0].id}`;
                const messagePayload = {
                    id: messageWithUser.id,
                    content: messageWithUser.content,
                    user_id: messageWithUser.user_id,
                    delivery_status: "sent",
                    user_name: messageWithUser.user_name,
                    created_at: messageWithUser.created_at,
                    conversation_id: conversation[0].id,
                };
                
                console.log("Broadcasting message to room:", roomName, messagePayload);
                io.to(roomName).emit("new-message", messagePayload);
                
                // Also try to get socket count for debugging
                const room = io.sockets.adapter.rooms.get(roomName);
                const socketCount = room ? room.size : 0;
                console.log(`Room ${roomName} has ${socketCount} connected clients`);
            } else {
                // Socket server is in server.js
                // We can't directly access it from server actions
                // The message is saved to database, and clients should receive it via:
                // 1. Socket events (if they're connected and in the room)
                // 2. Polling (if socket is not available)
                logger.info("Message saved to database, broadcasting via socket", { conversationId: conversation[0].id });
            }
        } catch (socketError) {
            // Socket not available - that's okay, message is still saved
            console.error("Socket not available for broadcast:", socketError);
        }

        // Only revalidate once, not for every message
        // The socket broadcast will handle real-time updates
        // revalidatePath("/dashboard/chat");

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

        console.log("getMessagesByConversationId: Starting", { conversationId, workspaceId: workspace.id });

        // Verify conversation belongs to workspace
        const conversation = await db.select()
            .from(conversations)
            .where(and(
                eq(conversations.id, conversationId),
                eq(conversations.workspace_id, workspace.id)
            ))
            .limit(1);

        if (!conversation[0]) {
            // Check if conversation exists at all (for debugging)
            const anyConversation = await db.select()
                .from(conversations)
                .where(eq(conversations.id, conversationId))
                .limit(1);
            
            if (anyConversation[0]) {
                console.error("getMessagesByConversationId: Conversation exists but belongs to different workspace", {
                    conversationId,
                    conversationWorkspaceId: anyConversation[0].workspace_id,
                    currentWorkspaceId: workspace.id,
                    conversationData: {
                        id: anyConversation[0].id,
                        chat_type: anyConversation[0].chat_type,
                        client_space_id: anyConversation[0].client_space_id,
                        title: anyConversation[0].title
                    }
                });
            } else {
                console.error("getMessagesByConversationId: Conversation not found in database", { conversationId });
            }
            
            logger.error("getMessagesByConversationId: Conversation not found", undefined, { conversationId, workspaceId: workspace.id });
            return [];
        }
        
        console.log("getMessagesByConversationId: Found conversation", { 
            conversationId, 
            chatType: conversation[0].chat_type,
            workspaceId: workspace.id,
            clientSpaceId: conversation[0].client_space_id,
            title: conversation[0].title
        });

        // Get messages with user info
        // Order by ASC so oldest messages appear first, newest at bottom
        console.log("getMessagesByConversationId: Querying messages for conversation", { conversationId });
        
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
            delivery_status: messages.delivery_status,
            user_name: users.name,
        })
        .from(messages)
        .leftJoin(users, eq(messages.user_id, users.id))
        .where(and(
            eq(messages.conversation_id, conversationId),
            isNull(messages.deleted_at) // Exclude deleted messages - use isNull instead of eq for better null handling
        ))
        .orderBy(asc(messages.created_at));
        // Note: Removed limit for now to load all messages
        // TODO: Implement proper pagination with offset/limit for better performance
        
        console.log("getMessagesByConversationId: Raw messages from database", { 
            conversationId, 
            rawCount: msgs.length,
            firstMessage: msgs[0] ? {
                id: msgs[0].id,
                content: msgs[0].content?.substring(0, 50),
                created_at: msgs[0].created_at
            } : null
        });

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

        console.log("getMessagesByConversationId: Loaded messages", { 
            conversationId, 
            count: messagesWithDetails.length,
            messageIds: messagesWithDetails.map(m => m.id).slice(0, 5) // Log first 5 message IDs
        });
        return messagesWithDetails;
    } catch (error: any) {
        console.error("getMessagesByConversationId: Error loading messages", {
            conversationId,
            error: error?.message,
            stack: error?.stack
        });
        return [];
    }
}

// Send message to conversation by ID
export async function sendMessageToConversation(
    conversationId: string, 
    content: string, 
    replyToMessageId?: string,
    attachments?: any[]
) {
    // Ensure content is not empty if no attachments
    if (!content.trim() && (!attachments || attachments.length === 0)) {
        return { success: false, error: "Message cannot be empty" };
    }

    // Validate message length (server-side)
    if (content.length > 10000) {
        return { success: false, error: "Message is too long. Maximum 10,000 characters allowed." };
    }
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

        logger.debug("sendMessageToConversation: Using conversation", {
            id: conversation[0].id,
            chat_type: conversation[0].chat_type,
            client_space_id: conversation[0].client_space_id,
            title: conversation[0].title
        });

        // Note: We don't change the chat_type of existing conversation
        // The conversation type is determined when it's created
        // This ensures internal/external separation is maintained

        // Insert message
        console.log("sendMessageToConversation: Inserting message", {
            conversationId,
            userId: session.user.id,
            contentLength: content.trim().length,
            hasAttachments: !!(attachments && attachments.length > 0),
            replyToMessageId: replyToMessageId || null
        });
        
        const insertResult = await db.insert(messages).values({
            conversation_id: conversationId,
            user_id: session.user.id,
            content: content.trim() || "", // Allow empty if has attachments
            reply_to_message_id: replyToMessageId || null,
            attachments: attachments || null,
            delivery_status: "sent", // Message is sent to server
        }).returning();
        
        console.log("sendMessageToConversation: Message inserted", {
            messageId: Array.isArray(insertResult) ? insertResult[0]?.id : insertResult?.id,
            conversationId: Array.isArray(insertResult) ? insertResult[0]?.conversation_id : insertResult?.conversation_id,
            success: !!(Array.isArray(insertResult) ? insertResult[0] : insertResult)
        });

        const newMessage = (Array.isArray(insertResult) ? insertResult[0] : insertResult) as typeof messages.$inferSelect | undefined;

        if (!newMessage) {
            console.error("sendMessageToConversation: Failed to insert message - no message returned", { conversationId, userId: session.user.id });
            return { success: false, error: "Failed to save message" };
        }

        logger.logMessageSent(newMessage.id, conversationId, session.user.id);

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

        // Process mentions if any
        try {
            const { processMentions } = await import("./chat-mentions");
            await processMentions(newMessage.id, content);
        } catch (mentionError) {
            console.error("Error processing mentions:", mentionError);
            // Don't fail message send if mentions fail
        }

        // Process attachments if any
        if (attachments && attachments.length > 0) {
            try {
                const { processAttachments } = await import("./chat-attachments");
                await processAttachments(newMessage.id, attachments);
            } catch (attachmentError) {
                console.error("Error processing attachments:", attachmentError);
                // Don't fail message send if attachments fail
            }
        }

        // Broadcast message via socket.io for real-time updates
        // Note: If using server.js, the socket server is initialized there
        // and will automatically broadcast messages sent via socket events
        // This direct broadcast is for when using initSocketServer
        try {
            const { getIO } = await import("@/lib/socket");
            const io = getIO();
            
            if (io) {
                const roomName = `conversation-${conversationId}`;
                const messagePayload = {
                    id: messageWithUser.id,
                    content: messageWithUser.content,
                    user_id: messageWithUser.user_id,
                    user_name: messageWithUser.user_name,
                    created_at: messageWithUser.created_at,
                    conversation_id: conversationId,
                    reply_to_message_id: replyToMessageId || null,
                    attachments: attachments || null,
                };
                
                console.log("Broadcasting message to room:", roomName, messagePayload);
                io.to(roomName).emit("new-message", messagePayload);
                
                // Also try to get socket count for debugging
                const room = io.sockets.adapter.rooms.get(roomName);
                const socketCount = room ? room.size : 0;
                console.log(`Room ${roomName} has ${socketCount} connected clients`);
            } else {
                // Socket server is in server.js, which will handle broadcasting
                // when clients send messages via socket events
                console.log("Socket server is in server.js, broadcast will happen via socket events");
            }
        } catch (socketError) {
            // Socket not available - that's okay, message is still saved
            console.error("Socket not available for broadcast:", socketError);
        }

        // Only revalidate once, not for every message
        // The socket broadcast will handle real-time updates
        // revalidatePath("/dashboard/chat");
        return { success: true, message: messageWithUser };
    } catch (error: any) {
        console.error("sendMessageToConversation: Error saving message", error);
        return { success: false, error: error?.message || "Failed to save message" };
    }
}

// Get pinned messages for a conversation
export async function getPinnedMessages(conversationId: string) {
    try {
        const session = await getSession();
        if (!session) return [];

        const workspace = await getOrCreateWorkspace();
        if (!workspace) return [];

        // Verify conversation belongs to workspace
        const conversation = await db.select()
            .from(conversations)
            .where(and(
                eq(conversations.id, conversationId),
                eq(conversations.workspace_id, workspace.id)
            ))
            .limit(1);

        if (!conversation[0]) {
            return [];
        }

        // Get pinned messages with user info
        const pinnedMsgs = await db.select({
            id: messages.id,
            conversation_id: messages.conversation_id,
            user_id: messages.user_id,
            content: messages.content,
            reply_to_message_id: messages.reply_to_message_id,
            is_starred: messages.is_starred,
            is_pinned: messages.is_pinned,
            attachments: messages.attachments,
            created_at: messages.created_at,
            updated_at: messages.updated_at,
            user_name: users.name,
        })
        .from(messages)
        .leftJoin(users, eq(messages.user_id, users.id))
        .where(and(
            eq(messages.conversation_id, conversationId),
            eq(messages.is_pinned, true),
            eq(messages.deleted_at, null)
        ))
        .orderBy(desc(messages.created_at));

        // Get reply messages for pinned messages
        const messagesWithDetails = await Promise.all(pinnedMsgs.map(async (msg) => {
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

            return {
                ...msg,
                reply_to_message: replyToMessage,
            };
        }));

        return messagesWithDetails;
    } catch (error: any) {
        console.error("getPinnedMessages: Error loading pinned messages", error);
        return [];
    }
}

// Get starred messages across all conversations or for a specific conversation
export async function getStarredMessages(conversationId?: string) {
    try {
        const session = await getSession();
        if (!session) return [];

        const workspace = await getOrCreateWorkspace();
        if (!workspace) return [];

        // Build where conditions
        const conditions = [
            eq(messages.is_starred, true),
            eq(messages.deleted_at, null),
        ];

        // If conversationId provided, filter by it
        if (conversationId) {
            // Verify conversation belongs to workspace
            const conversation = await db.select()
                .from(conversations)
                .where(and(
                    eq(conversations.id, conversationId),
                    eq(conversations.workspace_id, workspace.id)
                ))
                .limit(1);

            if (!conversation[0]) {
                return [];
            }

            conditions.push(eq(messages.conversation_id, conversationId));
        } else {
            // Only get messages from conversations in this workspace
            const workspaceConvs = await db.select({ id: conversations.id })
                .from(conversations)
                .where(eq(conversations.workspace_id, workspace.id));
            
            const convIds = workspaceConvs.map(c => c.id);
            if (convIds.length === 0) return [];

            // Note: Drizzle doesn't have a direct IN operator, so we'll use a different approach
            // For now, we'll fetch all and filter in memory (not ideal but works)
        }

        // Get starred messages with user info
        let starredMsgs;
        if (conversationId) {
            starredMsgs = await db.select({
                id: messages.id,
                conversation_id: messages.conversation_id,
                user_id: messages.user_id,
                content: messages.content,
                reply_to_message_id: messages.reply_to_message_id,
                is_starred: messages.is_starred,
                is_pinned: messages.is_pinned,
                attachments: messages.attachments,
                created_at: messages.created_at,
                updated_at: messages.updated_at,
                user_name: users.name,
            })
            .from(messages)
            .leftJoin(users, eq(messages.user_id, users.id))
            .where(and(...conditions))
            .orderBy(desc(messages.created_at));
        } else {
            // Get all workspace conversations first
            const workspaceConvs = await db.select({ id: conversations.id })
                .from(conversations)
                .where(eq(conversations.workspace_id, workspace.id));
            
            const convIds = workspaceConvs.map(c => c.id);
            if (convIds.length === 0) return [];

            // Fetch starred messages and filter by conversation IDs
            const allStarred = await db.select({
                id: messages.id,
                conversation_id: messages.conversation_id,
                user_id: messages.user_id,
                content: messages.content,
                reply_to_message_id: messages.reply_to_message_id,
                is_starred: messages.is_starred,
                is_pinned: messages.is_pinned,
                attachments: messages.attachments,
                created_at: messages.created_at,
                updated_at: messages.updated_at,
                user_name: users.name,
            })
            .from(messages)
            .leftJoin(users, eq(messages.user_id, users.id))
            .where(and(
                eq(messages.is_starred, true),
                eq(messages.deleted_at, null)
            ))
            .orderBy(desc(messages.created_at));

            // Filter by workspace conversations
            starredMsgs = allStarred.filter(msg => convIds.includes(msg.conversation_id));
        }

        // Get conversation info and reply messages
        const messagesWithDetails = await Promise.all(starredMsgs.map(async (msg) => {
            // Get conversation info
            const conv = await db.query.conversations.findFirst({
                where: eq(conversations.id, msg.conversation_id),
            });

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

            return {
                ...msg,
                conversation_title: conv?.title || "Chat",
                conversation_type: conv?.chat_type || "direct",
                reply_to_message: replyToMessage,
            };
        }));

        return messagesWithDetails;
    } catch (error: any) {
        console.error("getStarredMessages: Error loading starred messages", error);
        return [];
    }
}
