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
            const [newMessage] = await db.insert(messages).values({
                conversation_id: conversationId,
                user_id: portalUser.id,
                content: content.trim()
            }).returning();
            
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
