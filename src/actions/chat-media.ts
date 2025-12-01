"use server";

import { db } from "@/lib/db";
import { chat_media, conversations, messages } from "@/lib/db/schema";
import { getSession } from "@/lib/get-session";
import { getOrCreateWorkspace } from "./workspace";
import { eq, and, desc, or, like } from "drizzle-orm";
import { revalidatePath } from "next/cache";

interface MediaItem {
    id: string;
    conversation_id: string;
    message_id: string;
    media_type: "image" | "document" | "audio" | "video" | "gif" | "link";
    file_url: string;
    file_name?: string | null;
    file_size?: number | null;
    mime_type?: string | null;
    thumbnail_url?: string | null;
    width?: number | null;
    height?: number | null;
    duration?: number | null;
    metadata?: any;
    created_at: Date;
}

/**
 * Save media item to chat_media table
 */
export async function saveChatMedia(data: {
    conversationId: string;
    messageId: string;
    mediaType: "image" | "document" | "audio" | "video" | "gif" | "link";
    fileUrl: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    thumbnailUrl?: string;
    width?: number;
    height?: number;
    duration?: number;
    metadata?: any;
}) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Not authenticated" };
        }

        const [mediaItem] = await db.insert(chat_media).values({
            conversation_id: data.conversationId,
            message_id: data.messageId,
            media_type: data.mediaType,
            file_url: data.fileUrl,
            file_name: data.fileName,
            file_size: data.fileSize,
            mime_type: data.mimeType,
            thumbnail_url: data.thumbnailUrl,
            width: data.width,
            height: data.height,
            duration: data.duration,
            metadata: data.metadata,
            uploaded_by_user_id: session.user.id,
        }).returning();

        revalidatePath("/dashboard/chat");
        return { success: true, mediaItem };
    } catch (error: any) {
        console.error("Error saving chat media:", error);
        return { success: false, error: error?.message || "Failed to save media" };
    }
}

/**
 * Get all media for a conversation (for media gallery)
 */
export async function getConversationMedia(
    conversationId: string,
    options?: {
        mediaType?: "image" | "document" | "audio" | "video" | "gif" | "link";
        limit?: number;
        offset?: number;
    }
) {
    try {
        const workspace = await getOrCreateWorkspace();
        if (!workspace) {
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
            return { success: false, error: "Conversation not found" };
        }

        let query = db.select()
            .from(chat_media)
            .where(eq(chat_media.conversation_id, conversationId));

        // Filter by media type if provided
        if (options?.mediaType) {
            query = query.where(eq(chat_media.media_type, options.mediaType)) as any;
        }

        // Apply limit and offset
        if (options?.limit) {
            query = query.limit(options.limit) as any;
        }
        if (options?.offset) {
            query = query.offset(options.offset) as any;
        }

        const mediaItems = await query.orderBy(desc(chat_media.created_at));

        return { success: true, mediaItems };
    } catch (error: any) {
        console.error("Error getting conversation media:", error);
        return { success: false, error: error?.message || "Failed to get media" };
    }
}

/**
 * Get media grouped by type
 */
export async function getConversationMediaGrouped(conversationId: string) {
    try {
        const result = await getConversationMedia(conversationId);
        if (!result.success) {
            return result;
        }

        const grouped = (result.mediaItems || []).reduce((acc, item) => {
            if (!acc[item.media_type]) {
                acc[item.media_type] = [];
            }
            acc[item.media_type].push(item);
            return acc;
        }, {} as Record<string, typeof result.mediaItems>);

        return { success: true, grouped };
    } catch (error: any) {
        console.error("Error getting grouped media:", error);
        return { success: false, error: error?.message || "Failed to get grouped media" };
    }
}

/**
 * Search media by file name
 */
export async function searchConversationMedia(conversationId: string, searchQuery: string) {
    try {
        const workspace = await getOrCreateWorkspace();
        if (!workspace) {
            return { success: false, error: "Workspace not found" };
        }

        const mediaItems = await db.select()
            .from(chat_media)
            .where(and(
                eq(chat_media.conversation_id, conversationId),
                or(
                    like(chat_media.file_name, `%${searchQuery}%`),
                    like(chat_media.file_url, `%${searchQuery}%`)
                )
            ))
            .orderBy(desc(chat_media.created_at));

        return { success: true, mediaItems };
    } catch (error: any) {
        console.error("Error searching media:", error);
        return { success: false, error: error?.message || "Failed to search media" };
    }
}

/**
 * Delete media item
 */
export async function deleteChatMedia(mediaId: string) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Not authenticated" };
        }

        // Verify media belongs to user or user is admin
        const media = await db.select()
            .from(chat_media)
            .where(eq(chat_media.id, mediaId))
            .limit(1);

        if (!media[0]) {
            return { success: false, error: "Media not found" };
        }

        // Check if user owns the media or is workspace admin
        if (media[0].uploaded_by_user_id !== session.user.id) {
            // Could add workspace admin check here
            return { success: false, error: "Unauthorized" };
        }

        await db.delete(chat_media)
            .where(eq(chat_media.id, mediaId));

        revalidatePath("/dashboard/chat");
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting media:", error);
        return { success: false, error: error?.message || "Failed to delete media" };
    }
}


