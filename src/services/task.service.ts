import { db } from "@/lib/db";
import { tasks, task_comments } from "@/lib/db/schema";
import { eq, and, desc, or, like, sql } from "drizzle-orm";
import type { CreateTaskInput, UpdateTaskInput } from "@/lib/validators/task";

export class TaskService {
  static async create(data: CreateTaskInput & { created_by_user_id: string }) {
    const [task] = await db
      .insert(tasks)
      .values({
        workspace_id: data.workspace_id,
        title: data.title,
        description: data.description || null,
        status: data.status || "todo",
        priority: data.priority || "medium",
        due_date: data.due_date || null,
        client_id: data.client_id || null,
        card_id: data.card_id || null,
        assignee_ids: JSON.stringify(data.assignee_ids || []),
        tags: JSON.stringify(data.tags || []),
        visibility: data.visibility || "internal",
        created_by_user_id: data.created_by_user_id,
      })
      .returning();

    return task;
  }

  static async getById(taskId: string, workspaceId?: string) {
    const conditions = [eq(tasks.id, taskId)];
    if (workspaceId) {
      conditions.push(eq(tasks.workspace_id, workspaceId));
    }

    const [task] = await db
      .select()
      .from(tasks)
      .where(and(...conditions))
      .limit(1);

    return task || null;
  }

  static async getByWorkspace(
    workspaceId: string,
    options?: {
      client_id?: string;
      status?: string;
      assignee_id?: string;
      search?: string;
      limit?: number;
      offset?: number;
    }
  ) {
    const conditions = [eq(tasks.workspace_id, workspaceId)];

    if (options?.client_id) {
      conditions.push(eq(tasks.client_id, options.client_id));
    }

    if (options?.status) {
      conditions.push(eq(tasks.status, options.status));
    }

    if (options?.assignee_id) {
      conditions.push(
        sql`${tasks.assignee_ids}::text LIKE ${`%"${options.assignee_id}"%`}`
      );
    }

    if (options?.search) {
      conditions.push(
        or(
          like(tasks.title, `%${options.search}%`),
          like(tasks.description, `%${options.search}%`)
        )
      );
    }

    let query = db
      .select()
      .from(tasks)
      .where(and(...conditions))
      .orderBy(desc(tasks.created_at));

    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.offset(options.offset);
    }

    return await query;
  }

  static async update(taskId: string, data: UpdateTaskInput, workspaceId?: string) {
    // Get old task to check if status changed to "done" and verify workspace
    const conditions = [eq(tasks.id, taskId)];
    if (workspaceId) {
      conditions.push(eq(tasks.workspace_id, workspaceId));
    }

    const oldTask = await db.query.tasks.findFirst({
      where: and(...conditions)
    });

    if (!oldTask) {
      return null;
    }

    const updateData: any = {
      updated_at: new Date(),
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.due_date !== undefined) updateData.due_date = data.due_date;
    if (data.client_id !== undefined) updateData.client_id = data.client_id;
    if (data.card_id !== undefined) updateData.card_id = data.card_id;
    if (data.assignee_ids !== undefined) {
      updateData.assignee_ids = JSON.stringify(data.assignee_ids);
    }
    if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags);
    if (data.visibility !== undefined) updateData.visibility = data.visibility;
    if (data.completed_at !== undefined) updateData.completed_at = data.completed_at;

    const [updated] = await db
      .update(tasks)
      .set(updateData)
      .where(and(...conditions))
      .returning();

    // Trigger workflow "task_completed" if status changed to "done"
    if (data.status === "done" && oldTask?.status !== "done" && updated) {
      const { triggerWorkflows } = await import("@/lib/workflows/engine");
      await triggerWorkflows("task_completed", {
        task_id: taskId,
        workspace_id: updated.workspace_id,
        client_id: updated.client_id,
        task_title: updated.title,
        completed_at: new Date().toISOString(),
      });
    }

    return updated || null;
  }

  static async delete(taskId: string, workspaceId?: string) {
    const conditions = [eq(tasks.id, taskId)];
    if (workspaceId) {
      conditions.push(eq(tasks.workspace_id, workspaceId));
    }
    await db.delete(tasks).where(and(...conditions));
  }

  static async addComment(taskId: string, userId: string, content: string) {
    const [comment] = await db
      .insert(task_comments)
      .values({
        task_id: taskId,
        user_id: userId,
        content,
      })
      .returning();

    return comment;
  }

  static async getComments(taskId: string) {
    const comments = await db
      .select()
      .from(task_comments)
      .where(eq(task_comments.task_id, taskId))
      .orderBy(desc(task_comments.created_at));

    return comments;
  }
}

