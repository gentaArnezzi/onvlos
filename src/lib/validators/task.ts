import { z } from "zod";

export const createTaskSchema = z.object({
  workspace_id: z.string().uuid(),
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional().nullable(),
  status: z.enum(["todo", "inprogress", "inreview", "done"]).default("todo"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  due_date: z.string().date().optional().nullable(),
  client_id: z.string().uuid().optional().nullable(),
  card_id: z.string().uuid().optional().nullable(),
  assignee_ids: z.array(z.string().uuid()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  visibility: z.enum(["internal", "client_visible", "manager_only"]).default("internal"),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  status: z.enum(["todo", "inprogress", "inreview", "done"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  due_date: z.string().date().optional().nullable(),
  client_id: z.string().uuid().optional().nullable(),
  card_id: z.string().uuid().optional().nullable(),
  assignee_ids: z.array(z.string().uuid()).optional(),
  tags: z.array(z.string()).optional(),
  visibility: z.enum(["internal", "client_visible", "manager_only"]).optional(),
  completed_at: z.string().datetime().optional().nullable(),
});

export const createTaskCommentSchema = z.object({
  task_id: z.string().uuid(),
  content: z.string().min(1, "Comment content is required"),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type CreateTaskCommentInput = z.infer<typeof createTaskCommentSchema>;

