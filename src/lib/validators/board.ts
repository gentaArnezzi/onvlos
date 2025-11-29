import { z } from "zod";

export const createBoardSchema = z.object({
  workspace_id: z.string().uuid(),
  name: z.string().min(1, "Board name is required"),
  board_type: z.enum(["sales", "onboarding", "delivery", "custom"]).optional(),
});

export const updateBoardSchema = z.object({
  name: z.string().min(1).optional(),
  board_type: z.enum(["sales", "onboarding", "delivery", "custom"]).optional(),
});

export const createBoardColumnSchema = z.object({
  board_id: z.string().uuid(),
  name: z.string().min(1, "Column name is required"),
  order: z.number().int().default(0),
  wip_limit: z.number().int().positive().optional().nullable(),
  collapsed: z.boolean().default(false),
});

export const updateBoardColumnSchema = z.object({
  name: z.string().min(1).optional(),
  order: z.number().int().optional(),
  wip_limit: z.number().int().positive().optional().nullable(),
  collapsed: z.boolean().optional(),
});

export const createCardSchema = z.object({
  column_id: z.string().uuid(),
  client_id: z.string().uuid().optional().nullable(),
  title: z.string().min(1, "Card title is required"),
  description: z.string().optional().nullable(),
  order: z.number().int().default(0),
  due_date: z.string().date().optional().nullable(),
});

export const updateCardSchema = z.object({
  column_id: z.string().uuid().optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  order: z.number().int().optional(),
  due_date: z.string().date().optional().nullable(),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;
export type CreateBoardColumnInput = z.infer<typeof createBoardColumnSchema>;
export type UpdateBoardColumnInput = z.infer<typeof updateBoardColumnSchema>;
export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;

