import { z } from "zod";

export const invoiceItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  quantity: z.number().int().positive().default(1),
  unit_price: z.string(), // Store as string, convert to numeric in service
});

export const createInvoiceSchema = z.object({
  workspace_id: z.string().uuid(),
  client_id: z.string().uuid(),
  invoice_number: z.string().optional(), // Auto-generated if not provided
  currency: z.string().default("USD"),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
  discount_amount: z.string().optional().nullable(),
  discount_percentage: z.string().optional().nullable(),
  tax_rate: z.string().optional().nullable(),
  due_date: z.string().date(),
  issued_date: z.string().date().optional(), // Defaults to today
  notes: z.string().optional().nullable(),
});

export const updateInvoiceSchema = z.object({
  invoice_number: z.string().optional(),
  currency: z.string().optional(),
  items: z.array(invoiceItemSchema).optional(),
  discount_amount: z.string().optional().nullable(),
  discount_percentage: z.string().optional().nullable(),
  tax_rate: z.string().optional().nullable(),
  due_date: z.string().date().optional(),
  issued_date: z.string().date().optional(),
  status: z.enum(["draft", "sent", "paid", "overdue", "archived"]).optional(),
  paid_date: z.string().date().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const sendInvoiceSchema = z.object({
  email: z.string().email().optional(), // Use client email if not provided
  message: z.string().optional(),
});

export const createPaymentLinkSchema = z.object({
  return_url: z.string().url().optional(),
  cancel_url: z.string().url().optional(),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type SendInvoiceInput = z.infer<typeof sendInvoiceSchema>;
export type CreatePaymentLinkInput = z.infer<typeof createPaymentLinkSchema>;

