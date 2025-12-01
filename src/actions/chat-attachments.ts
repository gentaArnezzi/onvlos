"use server";

import { db } from "@/lib/db";
import { messages, conversations } from "@/lib/db/schema";
import { getSession } from "@/lib/get-session";
import { getOrCreateWorkspace } from "./workspace";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

interface Attachment {
    type: "image" | "document" | "audio" | "video" | "gif";
    url: string;
    name: string;
    size?: number;
    mimeType?: string;
    thumbnailUrl?: string;
    width?: number;
    height?: number;
    duration?: number;
}

/**
 * Process and save attachments for a message
 * This function handles the attachment metadata and saves to chat_media
 */
export async function processAttachments(messageId: string, attachments: Attachment[]) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Not authenticated" };
        }

        const workspace = await getOrCreateWorkspace();
        if (!workspace) {
            return { success: false, error: "Workspace not found" };
        }

        // Get message to find conversation
        const message = await db.select()
            .from(messages)
            .where(eq(messages.id, messageId))
            .limit(1);

        if (!message[0]) {
            return { success: false, error: "Message not found" };
        }

        // Import chat media functions
        const { saveChatMedia } = await import("./chat-media");

        // Save each attachment to chat_media
        const savedMedia = [];
        for (const attachment of attachments) {
            const mediaType = attachment.type === "gif" ? "gif" as const :
                            attachment.type === "audio" ? "audio" as const :
                            attachment.type === "video" ? "video" as const :
                            attachment.type === "image" ? "image" as const :
                            "document" as const;

            const result = await saveChatMedia({
                conversationId: message[0].conversation_id,
                messageId: messageId,
                mediaType: mediaType,
                fileUrl: attachment.url,
                fileName: attachment.name,
                fileSize: attachment.size,
                mimeType: attachment.mimeType,
                thumbnailUrl: attachment.thumbnailUrl,
                width: attachment.width,
                height: attachment.height,
                duration: attachment.duration,
            });

            if (result.success && result.mediaItem) {
                savedMedia.push(result.mediaItem);
            }
        }

        // Update message attachments field
        await db.update(messages)
            .set({
                attachments: attachments as any,
                updated_at: new Date(),
            })
            .where(eq(messages.id, messageId));

        revalidatePath("/dashboard/chat");
        return { success: true, savedMedia };
    } catch (error: any) {
        console.error("Error processing attachments:", error);
        return { success: false, error: error?.message || "Failed to process attachments" };
    }
}

/**
 * Validate file upload
 */
export async function validateFileUpload(file: {
    name: string;
    size: number;
    type: string;
}) {
    try {
        // Maximum file size: 100MB
        const MAX_FILE_SIZE = 100 * 1024 * 1024;

        if (file.size > MAX_FILE_SIZE) {
            return {
                success: false,
                error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
            };
        }

        // Allowed file types
        const allowedTypes = [
            // Images
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp",
            // Documents
            "application/pdf", "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "text/plain", "text/csv",
            // Audio
            "audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/webm",
            // Video
            "video/mp4", "video/webm", "video/ogg",
        ];

        if (!allowedTypes.includes(file.type)) {
            return {
                success: false,
                error: `File type ${file.type} is not allowed`,
            };
        }

        return { success: true };
    } catch (error: any) {
        console.error("Error validating file:", error);
        return { success: false, error: error?.message || "Failed to validate file" };
    }
}

/**
 * Get attachments for a message
 */
export async function getMessageAttachments(messageId: string) {
    try {
        const message = await db.select()
            .from(messages)
            .where(eq(messages.id, messageId))
            .limit(1);

        if (!message[0]) {
            return { success: false, error: "Message not found" };
        }

        const attachments = message[0].attachments as Attachment[] | null;
        return { success: true, attachments: attachments || [] };
    } catch (error: any) {
        console.error("Error getting attachments:", error);
        return { success: false, error: error?.message || "Failed to get attachments" };
    }
}


