"use server";

import { db } from "@/lib/db";
import { workspaces, workspace_members } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/get-session";

export async function getOrCreateWorkspace() {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  // Check if user has a workspace
  let workspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.created_by_user_id, session.user.id)
  });

  // If not, create one
  if (!workspace) {
    const [newWorkspace] = await db.insert(workspaces).values({
      name: `${session.user.name}'s Workspace`,
      created_by_user_id: session.user.id,
      billing_email: session.user.email,
      subscription_tier: "starter",
      subscription_status: "active"
    }).returning();

    // Add user as owner
    await db.insert(workspace_members).values({
      workspace_id: newWorkspace.id,
      user_id: session.user.id,
      role: "owner",
      status: "active",
      joined_at: new Date()
    });

    workspace = newWorkspace;
  }

  return workspace;
}

export async function getCurrentWorkspace() {
  const session = await getSession();
  if (!session) return null;

  const workspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.created_by_user_id, session.user.id)
  });

  return workspace;
}
