"use server";

import { db } from "@/lib/db";
import { conversations, messages, client_spaces, client_companies, users, flows, message_reads, conversation_settings, message_reactions } from "@/lib/db/schema";
import { eq, asc, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getOrCreateWorkspace } from "@/actions/workspace";
import { getSession } from "@/lib/get-session";

export async function getConversation(clientSpaceId: string, chatType?: "client_internal" | "client_external") {
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

        // Build where conditions
        const whereConditions = [
            eq(conversations.client_space_id, clientSpaceId),
            eq(conversations.workspace_id, workspace.id)
        ];

        // Filter by chat_type if provided
        if (chatType) {
            whereConditions.push(eq(conversations.chat_type, chatType));
        }

        let conversation = await db.query.conversations.findFirst({
            where: and(...whereConditions)
        });

        if (!conversation) {
            // Auto-create conversation if it doesn't exist
            // Default to client_external if chatType not specified (for backward compatibility)
            const defaultChatType = chatType || "client_external";
            const [newConv] = await db.insert(conversations).values({
                workspace_id: workspace.id,
                client_space_id: clientSpaceId,
                chat_type: defaultChatType,
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

/**
 * Get conversation for portal client (no authentication required)
 * Verifies access based on client_space_id only
 */
export async function getConversationForPortal(clientSpaceId: string) {
    try {
        // Verify client space exists
        const clientSpace = await db.query.client_spaces.findFirst({
            where: eq(client_spaces.id, clientSpaceId)
        });

        if (!clientSpace) {
            return null;
        }

        // Get or create conversation for this client space
        // IMPORTANT: Portal should only access client_external conversations
        let conversation = await db.query.conversations.findFirst({
            where: and(
                eq(conversations.client_space_id, clientSpaceId),
                eq(conversations.chat_type, "client_external")
            )
        });

        if (!conversation) {
            // Auto-create conversation if it doesn't exist
            const [newConv] = await db.insert(conversations).values({
                workspace_id: clientSpace.workspace_id,
                client_space_id: clientSpaceId,
                chat_type: "client_external",
                title: "General Chat"
            }).returning();
            conversation = newConv;
            console.log("getConversationForPortal: Created new client_external conversation:", newConv.id);
        } else {
            console.log("getConversationForPortal: Found existing client_external conversation:", conversation.id);
        }

        // Get client info for portal user name
        const client = await db.query.client_companies.findFirst({
            where: eq(client_companies.id, clientSpace.client_id)
        });

        // Get messages with user names
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

        // Map messages to add client name for portal users
        const messagesWithNames = msgs.map(msg => {
            // If user_id starts with "portal-user-", use client name
            if (msg.user_id?.startsWith('portal-user-') && client) {
                return {
                    ...msg,
                    user_name: client.name || client.company_name || 'Client'
                };
            }
            return msg;
        });

        return { conversation, messages: messagesWithNames };
    } catch (error) {
        console.error("Error fetching conversation for portal:", error);
        return null;
    }
}

/**
 * Send message from portal client (no authentication required)
 * Verifies access based on conversation_id and client_space relationship
 */
export async function sendMessageFromPortal(conversationId: string, content: string, clientName?: string) {
    try {
        if (!content.trim()) {
            return { success: false, error: "Message cannot be empty" };
        }

        // Validate message length (server-side)
        if (content.length > 10000) {
            return { success: false, error: "Message is too long. Maximum 10,000 characters allowed." };
        }

        // Verify conversation exists and get client space
        // IMPORTANT: Portal can only access client_external conversations
        const conversation = await db.query.conversations.findFirst({
            where: and(
                eq(conversations.id, conversationId),
                eq(conversations.chat_type, "client_external")
            )
        });

        if (!conversation) {
            return { success: false, error: "Conversation not found or access denied" };
        }

        // Verify client space exists and get client info
        if (!conversation.client_space_id) {
            return { success: false, error: "Conversation has no client space" };
        }

        const clientSpace = await db.query.client_spaces.findFirst({
            where: eq(client_spaces.id, conversation.client_space_id)
        });

        if (!clientSpace) {
            return { success: false, error: "Client space not found" };
        }

        // Get client info for user name
        const client = await db.query.client_companies.findFirst({
            where: eq(client_companies.id, clientSpace.client_id)
        });

        if (!client) {
            return { success: false, error: "Client not found" };
        }

        // For portal clients, we need to use a valid user_id from users table
        // Strategy: 
        // 1. First, try to find user by client email (if client email matches an existing user)
        // 2. If not found, try to find portal user by ID (portal-user-{clientSpaceId})
        // 3. If still not found, create a new portal user
        const portalUserEmail = client.email || `portal-${clientSpace.id}@portal.local`;
        const portalUserId = `portal-user-${clientSpace.id}`;

        // First, try to find user by email (in case client email matches an existing user)
        let portalUser = await db.query.users.findFirst({
            where: eq(users.email, portalUserEmail)
        });

        if (portalUser) {
            console.log("sendMessageFromPortal: Found existing user by email:", portalUser.id);
        } else {
            // Try to find portal user by ID
            portalUser = await db.query.users.findFirst({
                where: eq(users.id, portalUserId)
            });

            if (portalUser) {
                console.log("sendMessageFromPortal: Found existing portal user by ID:", portalUser.id);
            } else {
                // Create new portal user
                try {
                    console.log("sendMessageFromPortal: Creating new portal user:", {
                        id: portalUserId,
                        email: portalUserEmail,
                        name: client.name || client.company_name || "Portal Client"
                    });
                    
                    const [newUser] = await db.insert(users).values({
                        id: portalUserId,
                        name: client.name || client.company_name || "Portal Client",
                        email: portalUserEmail,
                        emailVerified: false,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }).returning();
                    
                    portalUser = newUser;
                    console.log("sendMessageFromPortal: Portal user created successfully:", portalUser.id);
                } catch (insertError: any) {
                    console.error("sendMessageFromPortal: Error creating portal user:", {
                        error: insertError,
                        message: insertError?.message,
                        code: insertError?.code,
                        detail: insertError?.detail,
                        cause: insertError?.cause
                    });
                    
                    // If insert fails due to unique constraint (email or id), try to find again
                    if (insertError?.code === '23505' || insertError?.message?.includes('unique') || insertError?.cause?.code === '23505') {
                        console.log("sendMessageFromPortal: Unique constraint violation, trying to find user again");
                        
                        // Try to find by email first
                        portalUser = await db.query.users.findFirst({
                            where: eq(users.email, portalUserEmail)
                        });
                        
                        // If still not found, try by ID
                        if (!portalUser) {
                            portalUser = await db.query.users.findFirst({
                                where: eq(users.id, portalUserId)
                            });
                        }
                        
                        // If still not found, try to find by email using select (more reliable)
                        if (!portalUser) {
                            const userByEmail = await db.select()
                                .from(users)
                                .where(eq(users.email, portalUserEmail))
                                .limit(1);
                            
                            if (userByEmail.length > 0) {
                                portalUser = userByEmail[0];
                            }
                        }
                    }

                    if (!portalUser) {
                        console.error("sendMessageFromPortal: Failed to create or find portal user after all attempts");
                        const errorDetail = insertError?.cause?.detail || insertError?.detail || insertError?.message || 'Unknown error';
                        return { 
                            success: false, 
                            error: `Failed to create or find portal user: ${errorDetail}` 
                        };
                    }
                    
                    console.log("sendMessageFromPortal: Found existing user after error:", portalUser.id);
                }
            }
        }

        try {
            const insertResult = await db.insert(messages).values({
                conversation_id: conversationId,
                user_id: portalUser.id,
                content: content.trim()
            }).returning();

            const newMessage = (Array.isArray(insertResult) ? insertResult[0] : insertResult) as typeof messages.$inferSelect | undefined;

            if (!newMessage) {
                console.error("sendMessageFromPortal: Failed to insert message - no message returned");
                return { success: false, error: "Failed to save message" };
            }

            // Log message sent (optional, don't fail if logger not available)
            try {
                const { logger } = await import("@/lib/logger");
                logger.logMessageSent(newMessage.id, conversationId, portalUser.id);
            } catch (logError) {
                console.log("Message sent:", { messageId: newMessage.id, conversationId, userId: portalUser.id });
            }

            // Update conversation updated_at
            await db.update(conversations)
                .set({ updated_at: new Date() })
                .where(eq(conversations.id, conversationId));

            // Broadcast to socket for real-time updates using unified getIO()
            const messagePayload = {
                id: newMessage.id,
                content: newMessage.content,
                user_id: newMessage.user_id,
                user_name: client?.name || client?.company_name || "Client",
                created_at: newMessage.created_at,
                conversation_id: conversationId,
                delivery_status: "sent" as const
            };

            try {
                const { getIO } = await import("@/lib/socket");
                const io = getIO();
                if (io) {
                    try {
                        const { logger } = await import("@/lib/logger");
                        logger.logSocketEvent("new-message", { conversationId });
                    } catch (logError) {
                        console.log("Broadcasting new-message to conversation:", conversationId);
                    }
                    io.to(`conversation-${conversationId}`).emit("new-message", messagePayload);
                    try {
                        const { logger } = await import("@/lib/logger");
                        logger.info("Message broadcasted successfully", { conversationId });
                    } catch (logError) {
                        console.log("Message broadcasted successfully:", conversationId);
                    }
                } else {
                    try {
                        const { logger } = await import("@/lib/logger");
                        logger.warn("Socket server not available, message saved to database (will require refresh)", { conversationId });
                    } catch (logError) {
                        console.warn("Socket server not available, message saved to database:", conversationId);
                    }
                }
            } catch (socketError) {
                console.error("sendMessageFromPortal: Error broadcasting message:", socketError);
                // Message is still saved to database, so this is non-critical
            }

            // Return message with user_name for client
            const messageWithUser = {
                ...newMessage,
                user_name: client?.name || client?.company_name || "Client"
            };

            // Revalidate portal path
            revalidatePath("/portal");
            
            return { success: true, message: messageWithUser };
        } catch (dbError: any) {
            console.error("sendMessageFromPortal: Database error sending message:", {
                error: dbError,
                message: dbError?.message,
                code: dbError?.code,
                detail: dbError?.detail,
                conversationId,
                content: content.substring(0, 50),
                portalUserId
            });
            return { 
                success: false, 
                error: dbError?.message || dbError?.detail || `Database error: ${dbError?.code || 'Unknown error'}` 
            };
        }
    } catch (error: any) {
        console.error("sendMessageFromPortal: Unexpected error sending message:", {
            error,
            message: error?.message,
            stack: error?.stack,
            conversationId,
            content: content.substring(0, 50)
        });
        return { 
            success: false, 
            error: error?.message || `Unexpected error: ${error?.toString() || 'Unknown error'}` 
        };
    }
}

export async function getConversationForFlow(flowId: string) {
    try {
        const session = await getSession();
        if (!session) return null;

        const workspace = await getOrCreateWorkspace();
        if (!workspace) return null;

        // Verify flow belongs to workspace
        const flow = await db.query.flows.findFirst({
            where: and(
                eq(flows.id, flowId),
                eq(flows.workspace_id, workspace.id)
            )
        });

        if (!flow) return null;

        // Find or create conversation for flow
        let conversation = await db.query.conversations.findFirst({
            where: and(
                eq(conversations.flow_id, flowId),
                eq(conversations.chat_type, "flow"),
                eq(conversations.workspace_id, workspace.id)
            )
        });

        if (!conversation) {
            // Auto-create conversation if it doesn't exist
            const [newConv] = await db.insert(conversations).values({
                workspace_id: workspace.id,
                flow_id: flowId,
                chat_type: "flow",
                title: `${flow.name} Chat`
            }).returning();
            conversation = newConv;
        }

        const msgs = await db.select({
            id: messages.id,
            content: messages.content,
            created_at: messages.created_at,
            user_id: messages.user_id,
            user_name: users.name,
            user_image: users.image
        })
            .from(messages)
            .leftJoin(users, eq(messages.user_id, users.id))
            .where(eq(messages.conversation_id, conversation.id))
            .orderBy(asc(messages.created_at));

        return { conversation, messages: msgs };
    } catch (error) {
        console.error("Error fetching flow conversation:", error);
        return null;
    }
}

// Star/unstar a message (toggle)
export async function starMessage(messageId: string, starred?: boolean) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Not authenticated" };
        }

        const workspace = await getOrCreateWorkspace();
        if (!workspace) {
            return { success: false, error: "Workspace not found" };
        }

        // Verify message exists and belongs to workspace
        const message = await db.select({
            id: messages.id,
            conversation_id: messages.conversation_id,
            is_starred: messages.is_starred,
        })
            .from(messages)
            .where(eq(messages.id, messageId))
            .limit(1);

        if (!message[0]) {
            return { success: false, error: "Message not found" };
        }

        // Verify conversation belongs to workspace
        const conversation = await db.query.conversations.findFirst({
            where: and(
                eq(conversations.id, message[0].conversation_id),
                eq(conversations.workspace_id, workspace.id)
            ),
        });

        if (!conversation) {
            return { success: false, error: "Message not found" };
        }

        // Toggle or set specific value
        const newStarredValue = starred !== undefined ? starred : !message[0].is_starred;

        await db.update(messages)
            .set({ is_starred: newStarredValue })
            .where(eq(messages.id, messageId));

        revalidatePath("/dashboard/chat");
        return { success: true };
    } catch (error) {
        console.error("Error starring message:", error);
        return { success: false, error: "Failed to star message" };
    }
}

// Unstar a message (deprecated, use starMessage with starred=false)
export async function unstarMessage(messageId: string) {
    return starMessage(messageId, false);
}

// Pin/unpin a message (toggle)
export async function pinMessage(messageId: string, pinned?: boolean) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Not authenticated" };
        }

        const workspace = await getOrCreateWorkspace();
        if (!workspace) {
            return { success: false, error: "Workspace not found" };
        }

        // Verify message exists and belongs to workspace
        const message = await db.select({
            id: messages.id,
            conversation_id: messages.conversation_id,
            is_pinned: messages.is_pinned,
        })
            .from(messages)
            .where(eq(messages.id, messageId))
            .limit(1);

        if (!message[0]) {
            return { success: false, error: "Message not found" };
        }

        // Verify conversation belongs to workspace
        const conversation = await db.query.conversations.findFirst({
            where: and(
                eq(conversations.id, message[0].conversation_id),
                eq(conversations.workspace_id, workspace.id)
            ),
        });

        if (!conversation) {
            return { success: false, error: "Message not found" };
        }

        // Toggle or set specific value
        const newPinnedValue = pinned !== undefined ? pinned : !message[0].is_pinned;

        await db.update(messages)
            .set({ is_pinned: newPinnedValue })
            .where(eq(messages.id, messageId));

        revalidatePath("/dashboard/chat");
        return { success: true };
    } catch (error) {
        console.error("Error pinning message:", error);
        return { success: false, error: "Failed to pin message" };
    }
}

// Unpin a message (deprecated, use pinMessage with pinned=false)
export async function unpinMessage(messageId: string) {
    return pinMessage(messageId, false);
}

// Forward a message to another conversation
export async function forwardMessage(messageId: string, targetConversationId: string) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Not authenticated" };
        }

        const workspace = await getOrCreateWorkspace();
        if (!workspace) {
            return { success: false, error: "Workspace not found" };
        }

        // Get original message with user info
        const originalMessageResult = await db.select({
            id: messages.id,
            content: messages.content,
            conversation_id: messages.conversation_id,
            user_id: messages.user_id,
            user_name: users.name,
        })
            .from(messages)
            .leftJoin(users, eq(messages.user_id, users.id))
            .where(eq(messages.id, messageId))
            .limit(1);

        if (!originalMessageResult[0]) {
            return { success: false, error: "Message not found" };
        }

        const originalMessage = originalMessageResult[0];

        // Verify original message's conversation belongs to workspace
        const originalConversation = await db.query.conversations.findFirst({
            where: and(
                eq(conversations.id, originalMessage.conversation_id),
                eq(conversations.workspace_id, workspace.id)
            ),
        });

        if (!originalConversation) {
            return { success: false, error: "Message not found" };
        }

        // Verify target conversation exists and belongs to workspace
        const targetConversation = await db.query.conversations.findFirst({
            where: and(
                eq(conversations.id, targetConversationId),
                eq(conversations.workspace_id, workspace.id)
            ),
        });

        if (!targetConversation) {
            return { success: false, error: "Target conversation not found" };
        }

        // Create forwarded message with prefix
        const forwardedContent = `Forwarded from ${originalMessage.user_name || "User"}: ${originalMessage.content}`;

        await db.insert(messages).values({
            conversation_id: targetConversationId,
            user_id: session.user.id,
            content: forwardedContent,
            reply_to_message_id: null,
        });

        // Update target conversation updated_at
        await db.update(conversations)
            .set({ updated_at: new Date() })
            .where(eq(conversations.id, targetConversationId));

        revalidatePath("/dashboard/chat");
        return { success: true };
    } catch (error) {
        console.error("Error forwarding message:", error);
        return { success: false, error: "Failed to forward message" };
    }
}

// Mark message as read
export async function markMessageAsRead(messageId: string) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Not authenticated" };
        }

        const workspace = await getOrCreateWorkspace();
        if (!workspace) {
            return { success: false, error: "Workspace not found" };
        }

        // Get message to find conversation_id
        // Get message to find conversation_id
        const message = await db.query.messages.findFirst({
            where: eq(messages.id, messageId),
        });

        if (!message) {
            return { success: false, error: "Message not found" };
        }

        // Check if already read
        const existingRead = await db.query.message_reads.findFirst({
            where: and(
                eq(message_reads.message_id, messageId),
                eq(message_reads.user_id, session.user.id)
            ),
        });

        if (!existingRead) {
            // Mark as read
            await db.insert(message_reads).values({
                message_id: messageId,
                user_id: session.user.id,
            });

            // Update message delivery status to 'read'
            await db.update(messages)
                .set({ delivery_status: "read" })
                .where(eq(messages.id, messageId));

            // Broadcast read receipt via socket
            try {
                const { getIO } = await import("@/lib/socket");
                const io = getIO();
                
                if (io && message.conversation_id) {
                    io.to(`conversation-${message.conversation_id}`).emit("message-read", {
                        messageId: messageId,
                        userId: session.user.id,
                        readAt: new Date(),
                    });
                }
            } catch (socketError) {
                logger.error("Error broadcasting read receipt", socketError);
                // Non-critical, continue
            }

            revalidatePath("/dashboard/chat");
        }

        return { success: true };
    } catch (error) {
        console.error("Error marking message as read:", error);
        return { success: false, error: "Failed to mark message as read" };
    }
}

// Schedule a message
export async function scheduleMessage(conversationId: string, content: string, scheduledFor: Date) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Not authenticated" };
        }

        const workspace = await getOrCreateWorkspace();
        if (!workspace) {
            return { success: false, error: "Workspace not found" };
        }

        // Verify conversation exists and belongs to workspace
        const conversation = await db.query.conversations.findFirst({
            where: and(
                eq(conversations.id, conversationId),
                eq(conversations.workspace_id, workspace.id)
            ),
        });

        if (!conversation) {
            return { success: false, error: "Conversation not found" };
        }

        // Create scheduled message
        await db.insert(messages).values({
            conversation_id: conversationId,
            user_id: session.user.id,
            content: content,
            scheduled_for: scheduledFor,
        });

        revalidatePath("/dashboard/chat");
        return { success: true };
    } catch (error) {
        console.error("Error scheduling message:", error);
        return { success: false, error: "Failed to schedule message" };
    }
}

// Mute/unmute conversation
export async function muteConversation(conversationId: string, muteUntil?: Date) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Not authenticated" };
        }

        const workspace = await getOrCreateWorkspace();
        if (!workspace) {
            return { success: false, error: "Workspace not found" };
        }

        // Verify conversation belongs to workspace
        const conversation = await db.query.conversations.findFirst({
            where: and(
                eq(conversations.id, conversationId),
                eq(conversations.workspace_id, workspace.id)
            ),
        });

        if (!conversation) {
            return { success: false, error: "Conversation not found" };
        }

        // Get or create settings
        const existingSettings = await db.query.conversation_settings.findFirst({
            where: and(
                eq(conversation_settings.conversation_id, conversationId),
                eq(conversation_settings.user_id, session.user.id)
            ),
        });

        if (existingSettings) {
            await db.update(conversation_settings)
                .set({
                    is_muted: true,
                    mute_until: muteUntil || null,
                    updated_at: new Date(),
                })
                .where(and(
                    eq(conversation_settings.conversation_id, conversationId),
                    eq(conversation_settings.user_id, session.user.id)
                ));
        } else {
            await db.insert(conversation_settings).values({
                conversation_id: conversationId,
                user_id: session.user.id,
                is_muted: true,
                mute_until: muteUntil || null,
            });
        }

        revalidatePath("/dashboard/chat");
        return { success: true };
    } catch (error: any) {
        console.error("Error muting conversation:", error);
        return { success: false, error: error?.message || "Failed to mute conversation" };
    }
}

export async function unmuteConversation(conversationId: string) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Not authenticated" };
        }

        await db.update(conversation_settings)
            .set({
                is_muted: false,
                mute_until: null,
                updated_at: new Date(),
            })
            .where(and(
                eq(conversation_settings.conversation_id, conversationId),
                eq(conversation_settings.user_id, session.user.id)
            ));

        revalidatePath("/dashboard/chat");
        return { success: true };
    } catch (error: any) {
        console.error("Error unmuting conversation:", error);
        return { success: false, error: error?.message || "Failed to unmute conversation" };
    }
}

export async function updateNotificationSettings(conversationId: string, enabled: boolean) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Not authenticated" };
        }

        // Get or create settings
        const existingSettings = await db.query.conversation_settings.findFirst({
            where: and(
                eq(conversation_settings.conversation_id, conversationId),
                eq(conversation_settings.user_id, session.user.id)
            ),
        });

        if (existingSettings) {
            await db.update(conversation_settings)
                .set({
                    notification_enabled: enabled,
                    updated_at: new Date(),
                })
                .where(and(
                    eq(conversation_settings.conversation_id, conversationId),
                    eq(conversation_settings.user_id, session.user.id)
                ));
        } else {
            await db.insert(conversation_settings).values({
                conversation_id: conversationId,
                user_id: session.user.id,
                notification_enabled: enabled,
            });
        }

        revalidatePath("/dashboard/chat");
        return { success: true };
    } catch (error: any) {
        console.error("Error updating notification settings:", error);
        return { success: false, error: error?.message || "Failed to update notification settings" };
    }
}

// Add reaction to message
export async function addReaction(messageId: string, emoji: string) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Not authenticated" };
        }

        const workspace = await getOrCreateWorkspace();
        if (!workspace) {
            return { success: false, error: "Workspace not found" };
        }

        // Verify message exists and belongs to workspace
        const message = await db.select({
            id: messages.id,
            conversation_id: messages.conversation_id,
        })
            .from(messages)
            .where(eq(messages.id, messageId))
            .limit(1);

        if (!message[0]) {
            return { success: false, error: "Message not found" };
        }

        // Verify conversation belongs to workspace
        const conversation = await db.query.conversations.findFirst({
            where: and(
                eq(conversations.id, message[0].conversation_id),
                eq(conversations.workspace_id, workspace.id)
            ),
        });

        if (!conversation) {
            return { success: false, error: "Message not found" };
        }

        // Check if reaction already exists
        const existingReaction = await db.query.message_reactions.findFirst({
            where: and(
                eq(message_reactions.message_id, messageId),
                eq(message_reactions.user_id, session.user.id),
                eq(message_reactions.emoji, emoji)
            ),
        });

        if (existingReaction) {
            // Already exists, do nothing (idempotent)
            return { success: true };
        }

        // Add reaction
        await db.insert(message_reactions).values({
            message_id: messageId,
            user_id: session.user.id,
            emoji: emoji,
        });

        revalidatePath("/dashboard/chat");
        return { success: true };
    } catch (error) {
        console.error("Error adding reaction:", error);
        return { success: false, error: "Failed to add reaction" };
    }
}

// Remove reaction from message
export async function removeReaction(messageId: string, emoji: string) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Not authenticated" };
        }

        await db.delete(message_reactions)
            .where(and(
                eq(message_reactions.message_id, messageId),
                eq(message_reactions.user_id, session.user.id),
                eq(message_reactions.emoji, emoji)
            ));

        revalidatePath("/dashboard/chat");
        return { success: true };
    } catch (error) {
        console.error("Error removing reaction:", error);
        return { success: false, error: "Failed to remove reaction" };
    }
}

