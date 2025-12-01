"use server";

import { db } from "@/lib/db";
import { conversations, conversation_settings } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getOrCreateWorkspace } from "@/actions/workspace";
import { getSession } from "@/lib/get-session";

// Get conversation settings for current user
export async function getConversationSettings(conversationId: string) {
    try {
        const session = await getSession();
        if (!session) {
            return null;
        }

        const workspace = await getOrCreateWorkspace();
        if (!workspace) {
            return null;
        }

        // Verify conversation belongs to workspace
        const conversation = await db.query.conversations.findFirst({
            where: and(
                eq(conversations.id, conversationId),
                eq(conversations.workspace_id, workspace.id)
            ),
        });

        if (!conversation) {
            return null;
        }

        // Get or create settings
        let settings = await db.query.conversation_settings.findFirst({
            where: and(
                eq(conversation_settings.conversation_id, conversationId),
                eq(conversation_settings.user_id, session.user.id)
            ),
        });

        if (!settings) {
            // Create default settings
            const [newSettings] = await db.insert(conversation_settings).values({
                conversation_id: conversationId,
                user_id: session.user.id,
                is_muted: false,
                notification_enabled: true,
            }).returning();
            settings = newSettings;
        }

        return settings;
    } catch (error: any) {
        console.error("Error getting conversation settings:", error);
        return null;
    }
}

// Check if conversation is muted for current user
export async function isConversationMuted(conversationId: string): Promise<boolean> {
    try {
        const session = await getSession();
        if (!session) return false;

        const settings = await getConversationSettings(conversationId);
        if (!settings) return false;

        // Check if muted and mute_until hasn't passed
        if (settings.is_muted) {
            if (settings.mute_until) {
                return new Date(settings.mute_until) > new Date();
            }
            return true;
        }

        return false;
    } catch (error) {
        console.error("Error checking mute status:", error);
        return false;
    }
}

