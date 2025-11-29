import { db } from "@/lib/db";
import { workflows } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import type { CreateWorkflowInput, UpdateWorkflowInput } from "@/lib/validators/workflow";

export class WorkflowService {
  static async create(data: CreateWorkflowInput & { created_by_user_id: string }) {
    const [workflow] = await db
      .insert(workflows)
      .values({
        workspace_id: data.workspace_id,
        name: data.name,
        description: data.description || null,
        trigger: data.trigger,
        actions: data.actions,
        enabled: data.enabled !== false,
        created_by_user_id: data.created_by_user_id,
      })
      .returning();

    return workflow;
  }

  static async getById(workflowId: string, workspaceId?: string) {
    const conditions = [eq(workflows.id, workflowId)];
    if (workspaceId) {
      conditions.push(eq(workflows.workspace_id, workspaceId));
    }

    const [workflow] = await db
      .select()
      .from(workflows)
      .where(and(...conditions))
      .limit(1);

    return workflow || null;
  }

  static async getByWorkspace(workspaceId: string, enabled?: boolean) {
    const conditions = [eq(workflows.workspace_id, workspaceId)];
    if (enabled !== undefined) {
      conditions.push(eq(workflows.enabled, enabled));
    }

    const workflowsList = await db
      .select()
      .from(workflows)
      .where(and(...conditions))
      .orderBy(desc(workflows.created_at));

    return workflowsList;
  }

  static async update(workflowId: string, data: UpdateWorkflowInput) {
    const [updated] = await db
      .update(workflows)
      .set(data)
      .where(eq(workflows.id, workflowId))
      .returning();

    return updated || null;
  }

  static async delete(workflowId: string) {
    await db.delete(workflows).where(eq(workflows.id, workflowId));
  }

  static async toggleEnabled(workflowId: string, enabled: boolean) {
    const [updated] = await db
      .update(workflows)
      .set({ enabled })
      .where(eq(workflows.id, workflowId))
      .returning();

    return updated || null;
  }
}

