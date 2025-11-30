"use server";

import { db } from "@/lib/db";
import { conversations, messages, client_spaces, client_companies, users, flows, message_reads } from "@/lib/db/schema";
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
                 chat_type: "client_external",
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
        let conversation = await db.query.conversations.findFirst({
            where: eq(conversations.client_space_id, clientSpaceId)
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

        // Verify conversation exists and get client space
        const conversation = await db.query.conversations.findFirst({
            where: eq(conversations.id, conversationId)
        });

        if (!conversation) {
            return { success: false, error: "Conversation not found" };
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
        // Strategy: Find or create a system user for portal clients
        // Using unique ID based on client_space_id to avoid conflicts
        const portalUserId = `portal-user-${clientSpace.id}`;
        const portalUserEmail = client.email || `portal-${clientSpace.id}@portal.local`;
        
        // Try to find existing portal user
        let portalUser = await db.query.users.findFirst({
            where: eq(users.id, portalUserId)
        });

        // If user doesn't exist, create one for portal client
        if (!portalUser) {
            try {
                const [newUser] = await db.insert(users).values({
                    id: portalUserId,
                    name: client.name || client.company_name || "Portal Client",
                    email: portalUserEmail,
                    emailVerified: false,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }).returning();
                portalUser = newUser;
            } catch (insertError: any) {
                // If insert fails (e.g., email already exists), try to find by email
                if (insertError?.code === '23505' || insertError?.message?.includes('unique')) {
                    portalUser = await db.query.users.findFirst({
                        where: eq(users.email, portalUserEmail)
                    });
                }
                
                // If still not found, try to find by ID (maybe created by another request)
                if (!portalUser) {
                    portalUser = await db.query.users.findFirst({
                        where: eq(users.id, portalUserId)
                    });
                }
                
                if (!portalUser) {
                    throw insertError;
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
            
            // Broadcast to socket if available (for real-time updates)
            try {
                const { getIO } = await import("@/lib/socket");
                const io = getIO();
                
                // Broadcast to all users in the conversation
                io.to(`conversation-${conversationId}`).emit("new-message", {
                    id: newMessage.id,
                    content: newMessage.content,
                    user_id: newMessage.user_id,
                    user_name: client?.name || client?.company_name || "Client",
                    created_at: newMessage.created_at,
                    conversation_id: conversationId
                });
            } catch (socketError) {
                // Socket not available or not initialized - that's okay, message is still saved
                console.log("Socket not available for broadcast:", socketError);
            }
            
            // Revalidate portal path
            revalidatePath("/portal");
            return { success: true, message: newMessage };
        } catch (dbError: any) {
            console.error("Database error sending message:", dbError);
            return { success: false, error: dbError?.message || "Failed to send message" };
        }
    } catch (error) {
        console.error("Error sending message from portal:", error);
        return { success: false, error: "Failed to send message" };
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

// Star a message
export async function starMessage(messageId: string) {
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

        await db.update(messages)
            .set({ is_starred: true })
            .where(eq(messages.id, messageId));

        revalidatePath("/dashboard/chat");
        return { success: true };
    } catch (error) {
        console.error("Error starring message:", error);
        return { success: false, error: "Failed to star message" };
    }
}

// Unstar a message
export async function unstarMessage(messageId: string) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Not authenticated" };
        }

        const workspace = await getOrCreateWorkspace();
        if (!workspace) {
            return { success: false, error: "Workspace not found" };
        }

        await db.update(messages)
            .set({ is_starred: false })
            .where(eq(messages.id, messageId));

        revalidatePath("/dashboard/chat");
        return { success: true };
    } catch (error) {
        console.error("Error unstarring message:", error);
        return { success: false, error: "Failed to unstar message" };
    }
}

// Pin a message
export async function pinMessage(messageId: string) {
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

        await db.update(messages)
            .set({ is_pinned: true })
            .where(eq(messages.id, messageId));

        revalidatePath("/dashboard/chat");
        return { success: true };
    } catch (error) {
        console.error("Error pinning message:", error);
        return { success: false, error: "Failed to pin message" };
    }
}

// Unpin a message
export async function unpinMessage(messageId: string) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Not authenticated" };
        }

        const workspace = await getOrCreateWorkspace();
        if (!workspace) {
            return { success: false, error: "Workspace not found" };
        }

        await db.update(messages)
            .set({ is_pinned: false })
            .where(eq(messages.id, messageId));

        revalidatePath("/dashboard/chat");
        return { success: true };
    } catch (error) {
        console.error("Error unpinning message:", error);
        return { success: false, error: "Failed to unpin message" };
    }
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

        // Check if already read
        const existingRead = await db.query.message_reads.findFirst({
            where: and(
                eq(message_reads.message_id, messageId),
                eq(message_reads.user_id, session.user.id)
            ),
        });

        if (!existingRead) {
            await db.insert(message_reads).values({
                message_id: messageId,
                user_id: session.user.id,
            });
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
