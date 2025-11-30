"use server";

import { db } from "@/lib/db";
import { flows, flow_members, workspaces, users } from "@/lib/db/schema";
import { desc, eq, and, sql, or, like } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/get-session";
import { getOrCreateWorkspace } from "./workspace";

export async function getFlows(filters?: {
  status?: string;
  tags?: string[];
  search?: string;
}) {
  try {
    const session = await getSession();
    if (!session) return { flows: [], total: 0 };

    const workspace = await getOrCreateWorkspace();
    if (!workspace) return { flows: [], total: 0 };

    let conditions = [eq(flows.workspace_id, workspace.id)];

    // Filter by status
    if (filters?.status && filters.status !== "all") {
      conditions.push(eq(flows.status, filters.status));
    } else {
      // Exclude deleted by default
      conditions.push(eq(flows.status, "active"));
    }

    // Filter by tags (if tags array provided)
    if (filters?.tags && filters.tags.length > 0) {
      // Tags are stored as JSON array, so we need to check if any tag matches
      const tagConditions = filters.tags.map(tag => 
        sql`${flows.tags}::text LIKE ${`%"${tag}"%`}`
      );
      conditions.push(or(...tagConditions)!);
    }

    // Search filter
    if (filters?.search) {
      conditions.push(
        or(
          like(flows.name, `%${filters.search}%`),
          like(flows.description, `%${filters.search}%`)
        )!
      );
    }

    const flowsList = await db.select()
      .from(flows)
      .where(and(...conditions))
      .orderBy(desc(flows.updated_at));

    // Enrich with member count
    const enrichedFlows = await Promise.all(
      flowsList.map(async (flow) => {
        const memberCount = await db.select({ count: sql<number>`count(*)` })
          .from(flow_members)
          .where(eq(flow_members.flow_id, flow.id));
        
        return {
          ...flow,
          member_count: Number(memberCount[0]?.count || 0),
        };
      })
    );

    return { flows: enrichedFlows, total: enrichedFlows.length };
  } catch (error) {
    console.error("Failed to get flows:", error);
    return { flows: [], total: 0 };
  }
}

export async function getFlow(flowId: string) {
  try {
    const session = await getSession();
    if (!session) return null;

    const workspace = await getOrCreateWorkspace();
    if (!workspace) return null;

    const flow = await db.query.flows.findFirst({
      where: and(
        eq(flows.id, flowId),
        eq(flows.workspace_id, workspace.id)
      ),
    });

    if (!flow) return null;

    // Get members
    const members = await db.select({
      id: flow_members.id,
      user_id: flow_members.user_id,
      role: flow_members.role,
      joined_at: flow_members.joined_at,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
      },
    })
      .from(flow_members)
      .leftJoin(users, eq(flow_members.user_id, users.id))
      .where(eq(flow_members.flow_id, flowId));

    return {
      ...flow,
      members: members.map(m => ({
        id: m.id,
        user_id: m.user_id,
        role: m.role,
        joined_at: m.joined_at,
        user: m.user,
      })),
    };
  } catch (error) {
    console.error("Failed to get flow:", error);
    return null;
  }
}

export async function createFlow(data: {
  name: string;
  description?: string;
  brief?: string;
  tags?: string[];
  layout?: string;
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

    const [newFlow] = await db.insert(flows).values({
      workspace_id: workspace.id,
      name: data.name,
      description: data.description,
      brief: data.brief,
      tags: data.tags ? JSON.stringify(data.tags) : null,
      layout: data.layout || "medium",
      status: "active",
      created_by_user_id: session.user.id,
    }).returning();

    // Add creator as owner member
    await db.insert(flow_members).values({
      flow_id: newFlow.id,
      user_id: session.user.id,
      role: "owner",
    });

    revalidatePath("/dashboard/flows");
    return { success: true, flow: newFlow };
  } catch (error) {
    console.error("Failed to create flow:", error);
    return { success: false, error: "Failed to create flow" };
  }
}

export async function updateFlow(flowId: string, data: {
  name?: string;
  description?: string;
  brief?: string;
  tags?: string[];
  layout?: string;
  status?: string;
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

    // Verify flow belongs to workspace
    const flow = await db.query.flows.findFirst({
      where: and(
        eq(flows.id, flowId),
        eq(flows.workspace_id, workspace.id)
      ),
    });

    if (!flow) {
      return { success: false, error: "Flow not found" };
    }

    const updateData: any = {
      updated_at: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.brief !== undefined) updateData.brief = data.brief;
    if (data.tags !== undefined) updateData.tags = data.tags ? JSON.stringify(data.tags) : null;
    if (data.layout !== undefined) updateData.layout = data.layout;
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === "completed") {
        updateData.completed_at = new Date();
      }
    }

    const [updatedFlow] = await db.update(flows)
      .set(updateData)
      .where(eq(flows.id, flowId))
      .returning();

    revalidatePath("/dashboard/flows");
    revalidatePath(`/dashboard/flows/${flowId}`);
    return { success: true, flow: updatedFlow };
  } catch (error) {
    console.error("Failed to update flow:", error);
    return { success: false, error: "Failed to update flow" };
  }
}

export async function deleteFlow(flowId: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Not authenticated" };
    }

    const workspace = await getOrCreateWorkspace();
    if (!workspace) {
      return { success: false, error: "Workspace not found" };
    }

    // Soft delete by setting status to "deleted"
    await db.update(flows)
      .set({ status: "deleted", updated_at: new Date() })
      .where(and(
        eq(flows.id, flowId),
        eq(flows.workspace_id, workspace.id)
      ));

    revalidatePath("/dashboard/flows");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete flow:", error);
    return { success: false, error: "Failed to delete flow" };
  }
}

export async function duplicateFlow(flowId: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Not authenticated" };
    }

    const workspace = await getOrCreateWorkspace();
    if (!workspace) {
      return { success: false, error: "Workspace not found" };
    }

    const originalFlow = await db.query.flows.findFirst({
      where: and(
        eq(flows.id, flowId),
        eq(flows.workspace_id, workspace.id)
      ),
    });

    if (!originalFlow) {
      return { success: false, error: "Flow not found" };
    }

    // Create duplicate
    const [duplicatedFlow] = await db.insert(flows).values({
      workspace_id: workspace.id,
      name: `${originalFlow.name} (Copy)`,
      description: originalFlow.description,
      brief: originalFlow.brief,
      tags: originalFlow.tags,
      layout: originalFlow.layout,
      status: "active",
      created_by_user_id: session.user.id,
    }).returning();

    // Duplicate members
    const members = await db.select()
      .from(flow_members)
      .where(eq(flow_members.flow_id, flowId));

    if (members.length > 0) {
      await db.insert(flow_members).values(
        members.map(m => ({
          flow_id: duplicatedFlow.id,
          user_id: m.user_id,
          role: m.role,
        }))
      );
    }

    revalidatePath("/dashboard/flows");
    return { success: true, flow: duplicatedFlow };
  } catch (error) {
    console.error("Failed to duplicate flow:", error);
    return { success: false, error: "Failed to duplicate flow" };
  }
}

export async function addFlowMember(flowId: string, userId: string, role: string = "member") {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Not authenticated" };
    }

    const workspace = await getOrCreateWorkspace();
    if (!workspace) {
      return { success: false, error: "Workspace not found" };
    }

    // Verify flow belongs to workspace
    const flow = await db.query.flows.findFirst({
      where: and(
        eq(flows.id, flowId),
        eq(flows.workspace_id, workspace.id)
      ),
    });

    if (!flow) {
      return { success: false, error: "Flow not found" };
    }

    // Check if member already exists
    const existing = await db.query.flow_members.findFirst({
      where: and(
        eq(flow_members.flow_id, flowId),
        eq(flow_members.user_id, userId)
      ),
    });

    if (existing) {
      return { success: false, error: "User is already a member" };
    }

    await db.insert(flow_members).values({
      flow_id: flowId,
      user_id: userId,
      role: role,
    });

    revalidatePath(`/dashboard/flows/${flowId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to add flow member:", error);
    return { success: false, error: "Failed to add flow member" };
  }
}

export async function removeFlowMember(flowId: string, userId: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Not authenticated" };
    }

    await db.delete(flow_members)
      .where(and(
        eq(flow_members.flow_id, flowId),
        eq(flow_members.user_id, userId)
      ));

    revalidatePath(`/dashboard/flows/${flowId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to remove flow member:", error);
    return { success: false, error: "Failed to remove flow member" };
  }
}

export async function getRecentFlows(limit: number = 4) {
  try {
    const session = await getSession();
    if (!session) return [];

    const workspace = await getOrCreateWorkspace();
    if (!workspace) return [];

    const recentFlows = await db.select()
      .from(flows)
      .where(and(
        eq(flows.workspace_id, workspace.id),
        eq(flows.status, "active")
      ))
      .orderBy(desc(flows.updated_at))
      .limit(limit);

    return recentFlows;
  } catch (error) {
    console.error("Failed to get recent flows:", error);
    return [];
  }
}

