import { z } from "zod";

export const workflowTriggerSchema = z.object({
  type: z.enum([
    "invoice_paid",
    "funnel_step_completed",
    "new_client_created",
    "due_date_approaching",
    "task_completed",
  ]),
  config: z.record(z.any()).optional(), // Trigger-specific configuration
});

export const workflowActionSchema = z.object({
  type: z.enum([
    "send_email",
    "create_task",
    "move_card",
    "send_chat_message",
  ]),
  config: z.record(z.any()), // Action-specific configuration
});

export const createWorkflowSchema = z.object({
  workspace_id: z.string().uuid(),
  name: z.string().min(1, "Workflow name is required"),
  description: z.string().optional().nullable(),
  trigger: workflowTriggerSchema,
  actions: z.array(workflowActionSchema).min(1, "At least one action is required"),
  enabled: z.boolean().default(true),
});

export const updateWorkflowSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  trigger: workflowTriggerSchema.optional(),
  actions: z.array(workflowActionSchema).optional(),
  enabled: z.boolean().optional(),
});

export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>;
export type UpdateWorkflowInput = z.infer<typeof updateWorkflowSchema>;

