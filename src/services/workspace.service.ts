import { db } from "@/lib/db";
import { workspaces, workspace_members } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import type { CreateWorkspaceInput, UpdateWorkspaceInput } from "@/lib/validators/workspace";

export class WorkspaceService {
  static async create(data: CreateWorkspaceInput & { created_by_user_id: string }) {
    const [workspace] = await db
      .insert(workspaces)
      .values({
        name: data.name,
        logo_url: data.logo_url || null,
        timezone: data.timezone || "UTC",
        billing_email: data.billing_email || null,
        created_by_user_id: data.created_by_user_id,
        subscription_tier: "starter",
        subscription_status: "active",
      })
      .returning();

    // Add creator as owner
    await db.insert(workspace_members).values({
      workspace_id: workspace.id,
      user_id: data.created_by_user_id,
      role: "owner",
      status: "active",
      joined_at: new Date(),
    });

    return workspace;
  }

  static async getById(workspaceId: string) {
    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1);

    return workspace || null;
  }

  static async getByUserId(userId: string) {
    const workspace = await db.query.workspaces.findFirst({
      where: eq(workspaces.created_by_user_id, userId),
    });

    return workspace;
  }

  static async getUserWorkspaces(userId: string) {
    const userWorkspaces = await db
      .select({
        workspace: workspaces,
        member: workspace_members,
      })
      .from(workspace_members)
      .innerJoin(workspaces, eq(workspace_members.workspace_id, workspaces.id))
      .where(
        and(
          eq(workspace_members.user_id, userId),
          eq(workspace_members.status, "active")
        )
      )
      .orderBy(desc(workspaces.created_at));

    return userWorkspaces.map(({ workspace }) => workspace);
  }

  static async update(workspaceId: string, data: UpdateWorkspaceInput) {
    const [updated] = await db
      .update(workspaces)
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where(eq(workspaces.id, workspaceId))
      .returning();

    return updated || null;
  }

  static async delete(workspaceId: string) {
    await db.delete(workspaces).where(eq(workspaces.id, workspaceId));
  }

  static async getMembers(workspaceId: string) {
    const members = await db
      .select()
      .from(workspace_members)
      .where(eq(workspace_members.workspace_id, workspaceId))
      .orderBy(desc(workspace_members.created_at));

    return members;
  }

  static async addMember(workspaceId: string, userId: string, role: "owner" | "admin" | "member") {
    const [member] = await db
      .insert(workspace_members)
      .values({
        workspace_id: workspaceId,
        user_id: userId,
        role,
        status: "invited",
        invited_at: new Date(),
      })
      .returning();

    return member;
  }

  static async updateMember(
    workspaceId: string,
    memberId: string,
    data: { role?: string; status?: string }
  ) {
    const [updated] = await db
      .update(workspace_members)
      .set(data)
      .where(
        and(
          eq(workspace_members.id, memberId),
          eq(workspace_members.workspace_id, workspaceId)
        )
      )
      .returning();

    return updated || null;
  }

  static async removeMember(workspaceId: string, memberId: string) {
    await db
      .delete(workspace_members)
      .where(
        and(
          eq(workspace_members.id, memberId),
          eq(workspace_members.workspace_id, workspaceId)
        )
      );
  }
}

