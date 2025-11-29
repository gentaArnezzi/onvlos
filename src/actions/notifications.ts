"use server";

import { db } from "@/lib/db";
import { getOrCreateWorkspace } from "./workspace";
import { getSession } from "@/lib/get-session";

interface Notification {
  id: string;
  type: "message" | "task" | "invoice" | "client" | "event";
  title: string;
  message: string;
  href: string;
  read: boolean;
  created_at: Date;
}

// For MVP, we'll create notifications from recent activities
export async function getNotifications(): Promise<Notification[]> {
  try {
    const session = await getSession();
    if (!session) return [];

    const workspace = await getOrCreateWorkspace();
    if (!workspace) return [];

    const notifications: Notification[] = [];

    // Get recent unread messages (simplified - in production, use a notifications table)
    // For now, we'll return empty array and let the UI show "No notifications"
    // In production, you'd query a notifications table:
    // const dbNotifications = await db.select().from(notifications)
    //   .where(eq(notifications.workspace_id, workspace.id))
    //   .orderBy(desc(notifications.created_at))
    //   .limit(20);

    // Mock notifications for demo (remove in production)
    // In production, create notifications when:
    // - New message received
    // - Task assigned
    // - Invoice paid
    // - New client added
    // - Event reminder

    return notifications;
  } catch (error) {
    console.error("Failed to get notifications:", error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Not authenticated" };
    }

    // In production, update notifications table:
    // await db.update(notifications)
    //   .set({ read: true, read_at: new Date() })
    //   .where(eq(notifications.id, notificationId));

    return { success: true };
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    return { success: false, error: "Failed to mark as read" };
  }
}

