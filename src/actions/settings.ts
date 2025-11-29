"use server";

import { db } from "@/lib/db";
import { users, workspaces } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/get-session";
import { getOrCreateWorkspace } from "./workspace";
import { revalidatePath } from "next/cache";

export async function getUserProfile() {
  try {
    const session = await getSession();
    if (!session) return null;

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id)
    });

    if (!user) return null;

    // Map BetterAuth schema to our expected format
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar_url: user.image || null,
    };
  } catch (error) {
    console.error("Failed to get user profile:", error);
    return null;
  }
}

export async function updateUserProfile(data: {
  name?: string;
  avatar_url?: string | null;
}) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Not authenticated" };
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.name) {
      updateData.name = data.name;
    }

    if (data.avatar_url !== undefined) {
      updateData.image = data.avatar_url || null;
    }

    await db.update(users)
      .set(updateData)
      .where(eq(users.id, session.user.id));

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to update user profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

export async function getWorkspaceSettings() {
  try {
    const workspace = await getOrCreateWorkspace();
    return workspace;
  } catch (error) {
    console.error("Failed to get workspace settings:", error);
    return null;
  }
}

export async function updateWorkspaceSettings(data: {
  name?: string;
  timezone?: string;
  logo_url?: string | null;
  billing_email?: string | null;
  default_currency?: string;
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

    await db.update(workspaces)
      .set({
        ...(data.name && { name: data.name }),
        ...(data.timezone && { timezone: data.timezone }),
        ...(data.logo_url !== undefined && { logo_url: data.logo_url }),
        ...(data.billing_email !== undefined && { billing_email: data.billing_email }),
        ...(data.default_currency && { default_currency: data.default_currency }),
        updated_at: new Date(),
      })
      .where(eq(workspaces.id, workspace.id));

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to update workspace settings:", error);
    return { success: false, error: "Failed to update workspace settings" };
  }
}

export async function getBillingInfo() {
  try {
    const workspace = await getOrCreateWorkspace();
    if (!workspace) return null;

    return {
      subscription_tier: workspace.subscription_tier || "starter",
      subscription_status: workspace.subscription_status || "active",
      billing_email: workspace.billing_email,
    };
  } catch (error) {
    console.error("Failed to get billing info:", error);
    return null;
  }
}

