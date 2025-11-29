import { z } from "zod";

export const formFieldSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(["text", "email", "select", "multiline", "file", "date", "checkbox"]),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(), // For select type
  placeholder: z.string().optional(),
  validation: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
  }).optional(),
});

export const funnelStepConfigSchema = z.object({
  // Form step
  fields: z.array(formFieldSchema).optional(),
  
  // Contract step
  contract_template: z.string().optional(),
  contract_text: z.string().optional(),
  requires_signature: z.boolean().default(true),
  
  // Invoice step
  invoice_id: z.string().uuid().optional(),
  amount: z.string().optional(),
  discount_code: z.boolean().default(false),
  payment_gateway: z.enum(["stripe", "midtrans", "xendit"]).optional(),
  
  // Automation step
  actions: z.array(z.object({
    type: z.enum(["create_client", "create_board_card", "send_email", "send_chat"]),
    config: z.record(z.any()),
  })).optional(),
});

export const createFunnelSchema = z.object({
  workspace_id: z.string().uuid(),
  name: z.string().min(1, "Funnel name is required"),
  description: z.string().optional().nullable(),
  public_url: z.string().min(1).optional(), // Auto-generated if not provided
  published: z.boolean().default(false),
});

export const updateFunnelSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  public_url: z.string().min(1).optional(),
  published: z.boolean().optional(),
});

export const createFunnelStepSchema = z.object({
  funnel_id: z.string().uuid(),
  step_type: z.enum(["form", "contract", "invoice", "automation"]),
  order: z.number().int().positive(),
  config: funnelStepConfigSchema,
});

export const updateFunnelStepSchema = z.object({
  step_type: z.enum(["form", "contract", "invoice", "automation"]).optional(),
  order: z.number().int().positive().optional(),
  config: funnelStepConfigSchema.optional(),
});

export const submitFunnelStepSchema = z.object({
  step_data: z.record(z.any()), // Form responses, signature, etc.
  client_email: z.string().email().optional(),
});

export type CreateFunnelInput = z.infer<typeof createFunnelSchema>;
export type UpdateFunnelInput = z.infer<typeof updateFunnelSchema>;
export type CreateFunnelStepInput = z.infer<typeof createFunnelStepSchema>;
export type UpdateFunnelStepInput = z.infer<typeof updateFunnelStepSchema>;
export type SubmitFunnelStepInput = z.infer<typeof submitFunnelStepSchema>;

