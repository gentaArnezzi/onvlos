import { z } from "zod";

export const createClientSchema = z.object({
  workspace_id: z.string().uuid(),
  name: z.string().min(1, "Client name is required"),
  email: z.string().email().optional().nullable(),
  company_name: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  logo_url: z.string().url().optional().nullable(),
  status: z.enum(["lead", "active", "onboarding", "completed", "archived"]).default("lead"),
  contract_value: z.string().optional().nullable(), // Store as string, convert to numeric in service
  contract_start: z.string().date().optional().nullable(),
  contract_end: z.string().date().optional().nullable(),
  owner_user_id: z.string().uuid().optional().nullable(),
});

export const updateClientSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional().nullable(),
  company_name: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  logo_url: z.string().url().optional().nullable(),
  status: z.enum(["lead", "active", "onboarding", "completed", "archived"]).optional(),
  contract_value: z.string().optional().nullable(),
  contract_start: z.string().date().optional().nullable(),
  contract_end: z.string().date().optional().nullable(),
  owner_user_id: z.string().uuid().optional().nullable(),
});

export const createClientSpaceSchema = z.object({
  client_id: z.string().uuid(),
  public_url: z.string().min(1),
  custom_domain: z.string().optional().nullable(),
  logo_url: z.string().url().optional().nullable(),
  branding: z.object({
    primary_color: z.string().optional(),
    accent_color: z.string().optional(),
    font_family: z.string().optional(),
  }).optional().nullable(),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type CreateClientSpaceInput = z.infer<typeof createClientSpaceSchema>;

