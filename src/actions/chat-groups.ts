"use server";

import { db } from "@/lib/db";
import { conversations, conversation_members, conversation_settings } from "@/lib/db/schema";
import { getSession } from "@/lib/get-session";
import { getOrCreateWorkspace } from "./workspace";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Create a new group chat
 */
export async function createGroupChat(data: {
    name: string;
    description?: string;
    avatarUrl?: string;
    memberIds: string[];
}) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Not authenticated" };
        }

        const workspace = await getOrCreateWorkspace();
        if (!workspace) {
            return { success: false, error: "Workspace not found" };
        }

        // Create conversation
        const [conversation] = await db.insert(conversations).values({
            workspace_id: workspace.id,
            chat_type: "direct",
            is_group: true,
            group_name: data.name,
            group_description: data.description,
            group_avatar_url: data.avatarUrl,
            created_by_user_id: session.user.id,
        }).returning();

        // Add creator as owner
        await db.insert(conversation_members).values({
            conversation_id: conversation.id,
            user_id: session.user.id,
            role: "owner",
            added_by_user_id: session.user.id,
        });

        // Add other members
        const memberInserts = data.memberIds
            .filter(id => id !== session.user.id) // Don't add creator again
            .map(userId => ({
                conversation_id: conversation.id,
                user_id: userId,
                role: "member" as const,
                added_by_user_id: session.user.id,
            }));

        if (memberInserts.length > 0) {
            await db.insert(conversation_members).values(memberInserts);
        }

        // Create default settings for all members
        const allMemberIds = [session.user.id, ...data.memberIds.filter(id => id !== session.user.id)];
        const settingsInserts = allMemberIds.map(userId => ({
            conversation_id: conversation.id,
            user_id: userId,
            is_muted: false,
            notification_enabled: true,
        }));

        await db.insert(conversation_settings).values(settingsInserts);

        revalidatePath("/dashboard/chat");
        return { success: true, conversation };
    } catch (error: any) {
        console.error("Error creating group chat:", error);
        return { success: false, error: error?.message || "Failed to create group chat" };
    }
}

/**
 * Add members to a group chat
 */
export async function addGroupMembers(conversationId: string, memberIds: string[]) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Not authenticated" };
        }

        const workspace = await getOrCreateWorkspace();
        if (!workspace) {
            return { success: false, error: "Workspace not found" };
        }

        // Verify conversation is a group and belongs to workspace
        const conversation = await db.select()
            .from(conversations)
            .where(and(
                eq(conversations.id, conversationId),
                eq(conversations.workspace_id, workspace.id),
                eq(conversations.is_group, true)
            ))
            .limit(1);

        if (!conversation[0]) {
            return { success: false, error: "Group chat not found" };
        }

        // Check if user is member/admin/owner
        const membership = await db.select()
            .from(conversation_members)
            .where(and(
                eq(conversation_members.conversation_id, conversationId),
                eq(conversation_members.user_id, session.user.id)
            ))
            .limit(1);

        if (!membership[0] || !["owner", "admin"].includes(membership[0].role)) {
            return { success: false, error: "Unauthorized" };
        }

        // Filter out existing members
        const existingMembers = await db.select()
            .from(conversation_members)
            .where(eq(conversation_members.conversation_id, conversationId));

        const existingMemberIds = existingMembers.map(m => m.user_id);
        const newMemberIds = memberIds.filter(id => !existingMemberIds.includes(id));

        // Add new members
        if (newMemberIds.length > 0) {
            const memberInserts = newMemberIds.map(userId => ({
                conversation_id: conversationId,
                user_id: userId,
                role: "member" as const,
                added_by_user_id: session.user.id,
            }));

            await db.insert(conversation_members).values(memberInserts);

            // Create default settings for new members
            const settingsInserts = newMemberIds.map(userId => ({
                conversation_id: conversationId,
                user_id: userId,
                is_muted: false,
                notification_enabled: true,
            }));

            await db.insert(conversation_settings).values(settingsInserts);
        }

        revalidatePath("/dashboard/chat");
        return { success: true, addedCount: newMemberIds.length };
    } catch (error: any) {
        console.error("Error adding group members:", error);
        return { success: false, error: error?.message || "Failed to add members" };
    }
}

/**
 * Remove member from group chat
 */
export async function removeGroupMember(conversationId: string, userId: string) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Not authenticated" };
        }

        // Check if user is admin/owner or removing themselves
        const membership = await db.select()
            .from(conversation_members)
            .where(and(
                eq(conversation_members.conversation_id, conversationId),
                eq(conversation_members.user_id, session.user.id)
            ))
            .limit(1);

        if (!membership[0]) {
            return { success: false, error: "Not a member" };
        }

        const isOwnerOrAdmin = ["owner", "admin"].includes(membership[0].role);
        const isRemovingSelf = userId === session.user.id;

        if (!isOwnerOrAdmin && !isRemovingSelf) {
            return { success: false, error: "Unauthorized" };
        }

        // Remove member
        await db.update(conversation_members)
            .set({ left_at: new Date() })
            .where(and(
                eq(conversation_members.conversation_id, conversationId),
                eq(conversation_members.user_id, userId)
            ));

        revalidatePath("/dashboard/chat");
        return { success: true };
    } catch (error: any) {
        console.error("Error removing group member:", error);
        return { success: false, error: error?.message || "Failed to remove member" };
    }
}

/**
 * Update group chat info
 */
export async function updateGroupChat(conversationId: string, data: {
    name?: string;
    description?: string;
    avatarUrl?: string;
}) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Not authenticated" };
        }

        // Check if user is owner/admin
        const membership = await db.select()
            .from(conversation_members)
            .where(and(
                eq(conversation_members.conversation_id, conversationId),
                eq(conversation_members.user_id, session.user.id)
            ))
            .limit(1);

        if (!membership[0] || !["owner", "admin"].includes(membership[0].role)) {
            return { success: false, error: "Unauthorized" };
        }

        // Update conversation
        const updateData: any = {};
        if (data.name !== undefined) updateData.group_name = data.name;
        if (data.description !== undefined) updateData.group_description = data.description;
        if (data.avatarUrl !== undefined) updateData.group_avatar_url = data.avatarUrl;
        updateData.updated_at = new Date();

        await db.update(conversations)
            .set(updateData)
            .where(eq(conversations.id, conversationId));

        revalidatePath("/dashboard/chat");
        return { success: true };
    } catch (error: any) {
        console.error("Error updating group chat:", error);
        return { success: false, error: error?.message || "Failed to update group chat" };
    }
}

/**
 * Get group chat members
 */
export async function getGroupMembers(conversationId: string) {
    try {
        const allMembers = await db.select()
            .from(conversation_members)
            .where(eq(conversation_members.conversation_id, conversationId));

        // Filter out members who have left
        const members = allMembers.filter(m => !m.left_at);

        return { success: true, members };
    } catch (error: any) {
        console.error("Error getting group members:", error);
        return { success: false, error: error?.message || "Failed to get members" };
    }
}

