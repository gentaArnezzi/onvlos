"use server";

import { db } from "@/lib/db";
import { message_reactions, messages } from "@/lib/db/schema";
import { getSession } from "@/lib/get-session";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Add reaction to a message
 */
export async function addReaction(messageId: string, emoji: string) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Not authenticated" };
        }

        // Check if reaction already exists
        const existing = await db.query.message_reactions.findFirst({
            where: and(
                eq(message_reactions.message_id, messageId),
                eq(message_reactions.user_id, session.user.id),
                eq(message_reactions.emoji, emoji)
            ),
        });

        if (existing) {
            return { success: false, error: "Reaction already exists" };
        }

        // Get message to find conversation ID
        const message = await db.query.messages.findFirst({
            where: eq(messages.id, messageId),
        });

        if (!message) {
            return { success: false, error: "Message not found" };
        }

        // Add reaction
        const [newReaction] = await db.insert(message_reactions).values({
            message_id: messageId,
            user_id: session.user.id,
            emoji: emoji,
        }).returning();

        // Broadcast via socket
        try {
            const { getIO } = await import("@/lib/socket");
            const io = getIO();
            
            io.to(`conversation-${message.conversation_id}`).emit("message-reaction", {
                messageId: messageId,
                emoji: emoji,
                userId: session.user.id,
                action: "add",
            });
        } catch (socketError) {
            console.log("Socket not available for reaction broadcast:", socketError);
        }

        revalidatePath("/dashboard/chat");
        return { success: true, reaction: newReaction };
    } catch (error: any) {
        console.error("Error adding reaction:", error);
        return { success: false, error: error?.message || "Failed to add reaction" };
    }
}

/**
 * Remove reaction from a message
 */
export async function removeReaction(messageId: string, emoji: string) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Not authenticated" };
        }

        // Get message to find conversation ID
        const message = await db.query.messages.findFirst({
            where: eq(messages.id, messageId),
        });

        if (!message) {
            return { success: false, error: "Message not found" };
        }

        await db.delete(message_reactions)
            .where(and(
                eq(message_reactions.message_id, messageId),
                eq(message_reactions.user_id, session.user.id),
                eq(message_reactions.emoji, emoji)
            ));

        // Broadcast via socket
        try {
            const { getIO } = await import("@/lib/socket");
            const io = getIO();
            
            io.to(`conversation-${message.conversation_id}`).emit("message-reaction", {
                messageId: messageId,
                emoji: emoji,
                userId: session.user.id,
                action: "remove",
            });
        } catch (socketError) {
            console.log("Socket not available for reaction broadcast:", socketError);
        }

        revalidatePath("/dashboard/chat");
        return { success: true };
    } catch (error: any) {
        console.error("Error removing reaction:", error);
        return { success: false, error: error?.message || "Failed to remove reaction" };
    }
}

/**
 * Toggle reaction (add if not exists, remove if exists)
 */
export async function toggleReaction(messageId: string, emoji: string) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Not authenticated" };
        }

        // Check if reaction exists
        const existing = await db.query.message_reactions.findFirst({
            where: and(
                eq(message_reactions.message_id, messageId),
                eq(message_reactions.user_id, session.user.id),
                eq(message_reactions.emoji, emoji)
            ),
        });

        if (existing) {
            // Remove reaction
            await removeReaction(messageId, emoji);
            return { success: true, action: "removed" };
        } else {
            // Add reaction
            await addReaction(messageId, emoji);
            return { success: true, action: "added" };
        }
    } catch (error: any) {
        console.error("Error toggling reaction:", error);
        return { success: false, error: error?.message || "Failed to toggle reaction" };
    }
}

/**
 * Get all reactions for a message
 */
export async function getMessageReactions(messageId: string) {
    try {
        const reactions = await db.select()
            .from(message_reactions)
            .where(eq(message_reactions.message_id, messageId));

        // Group reactions by emoji
        const grouped = reactions.reduce((acc, reaction) => {
            if (!acc[reaction.emoji]) {
                acc[reaction.emoji] = [];
            }
            acc[reaction.emoji].push(reaction);
            return acc;
        }, {} as Record<string, typeof reactions>);

        return { success: true, reactions: grouped };
    } catch (error: any) {
        console.error("Error getting reactions:", error);
        return { success: false, error: error?.message || "Failed to get reactions" };
    }
}

