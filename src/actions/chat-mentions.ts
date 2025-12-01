"use server";

import { db } from "@/lib/db";
import { message_mentions, messages, users, client_companies } from "@/lib/db/schema";
import { getSession } from "@/lib/get-session";
import { getOrCreateWorkspace } from "./workspace";
import { eq, and, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Detect and save mentions from message content
 * Supports: @user, @client, @task:123, @flow:abc, @board:xyz, @invoice:456
 */
export async function processMentions(messageId: string, content: string) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Not authenticated" };
        }

        const workspace = await getOrCreateWorkspace();
        if (!workspace) {
            return { success: false, error: "Workspace not found" };
        }

        // Regex patterns for mentions
        const mentionPatterns = {
            user: /@([A-Za-z0-9\s]+)/g, // @John Doe
            client: /@client:([A-Za-z0-9\s]+)/g, // @client:Acme Corp
            task: /@task:([A-Za-z0-9-]+)/g, // @task:123
            flow: /@flow:([A-Za-z0-9-]+)/g, // @flow:abc
            board: /@board:([A-Za-z0-9-]+)/g, // @board:xyz
            invoice: /@invoice:([A-Za-z0-9-]+)/g, // @invoice:456
        };

        const mentionsToInsert: Array<{
            message_id: string;
            user_id?: string;
            client_id?: string;
            entity_type: string;
            entity_id?: string;
            mentioned_text: string;
        }> = [];

        // Process user mentions
        let match;
        const userPattern = mentionPatterns.user;
        while ((match = userPattern.exec(content)) !== null) {
            const mentionedName = match[1].trim();
            const user = await db.query.users.findFirst({
                where: and(
                    eq(users.name, mentionedName),
                    // Could add workspace check via workspace_members
                ),
            });

            if (user) {
                mentionsToInsert.push({
                    message_id: messageId,
                    user_id: user.id,
                    entity_type: "user",
                    mentioned_text: match[0],
                });
            }
        }

        // Process client mentions
        const clientPattern = mentionPatterns.client;
        while ((match = clientPattern.exec(content)) !== null) {
            const clientName = match[1].trim();
            const client = await db.query.client_companies.findFirst({
                where: and(
                    or(
                        eq(client_companies.name, clientName),
                        eq(client_companies.company_name, clientName)
                    ),
                    eq(client_companies.workspace_id, workspace.id)
                ),
            });

            if (client) {
                mentionsToInsert.push({
                    message_id: messageId,
                    client_id: client.id,
                    entity_type: "client",
                    mentioned_text: match[0],
                });
            }
        }

        // Process entity mentions (task, flow, board, invoice)
        const entityPatterns = [
            { type: "task", pattern: mentionPatterns.task },
            { type: "flow", pattern: mentionPatterns.flow },
            { type: "board", pattern: mentionPatterns.board },
            { type: "invoice", pattern: mentionPatterns.invoice },
        ];

        for (const { type, pattern } of entityPatterns) {
            while ((match = pattern.exec(content)) !== null) {
                const entityId = match[1];
                mentionsToInsert.push({
                    message_id: messageId,
                    entity_type: type,
                    entity_id: entityId,
                    mentioned_text: match[0],
                });
            }
        }

        // Insert all mentions
        if (mentionsToInsert.length > 0) {
            await db.insert(message_mentions).values(mentionsToInsert);
        }

        return { success: true, mentionsCount: mentionsToInsert.length };
    } catch (error: any) {
        console.error("Error processing mentions:", error);
        return { success: false, error: error?.message || "Failed to process mentions" };
    }
}

/**
 * Get mentions for a message
 */
export async function getMessageMentions(messageId: string) {
    try {
        const mentions = await db.select()
            .from(message_mentions)
            .where(eq(message_mentions.message_id, messageId));

        return { success: true, mentions };
    } catch (error: any) {
        console.error("Error getting mentions:", error);
        return { success: false, error: error?.message || "Failed to get mentions" };
    }
}

/**
 * Get all mentions for current user (for notifications)
 */
export async function getUserMentions() {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Not authenticated" };
        }

        const mentions = await db.select()
            .from(message_mentions)
            .where(eq(message_mentions.user_id, session.user.id));

        return { success: true, mentions };
    } catch (error: any) {
        console.error("Error getting user mentions:", error);
        return { success: false, error: error?.message || "Failed to get user mentions" };
    }
}


