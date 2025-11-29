import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Workspace name is required").max(100),
  logo_url: z.string().url().optional().nullable(),
  timezone: z.string().default("UTC"),
  billing_email: z.string().email().optional().nullable(),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  logo_url: z.string().url().optional().nullable(),
  timezone: z.string().optional(),
  billing_email: z.string().email().optional().nullable(),
  subscription_tier: z.enum(["starter", "professional", "enterprise"]).optional(),
  subscription_status: z.enum(["active", "trialing", "cancelled", "suspended"]).optional(),
});

export const addWorkspaceMemberSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(["owner", "admin", "member"]),
});

export const updateWorkspaceMemberSchema = z.object({
  role: z.enum(["owner", "admin", "member"]).optional(),
  status: z.enum(["active", "invited", "inactive"]).optional(),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
export type AddWorkspaceMemberInput = z.infer<typeof addWorkspaceMemberSchema>;
export type UpdateWorkspaceMemberInput = z.infer<typeof updateWorkspaceMemberSchema>;

