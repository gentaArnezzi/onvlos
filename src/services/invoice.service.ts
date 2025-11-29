import { db } from "@/lib/db";
import { invoices, invoice_items } from "@/lib/db/schema";
import { eq, and, desc, or, like } from "drizzle-orm";
import type { CreateInvoiceInput, UpdateInvoiceInput } from "@/lib/validators/invoice";

export class InvoiceService {
  static async generateInvoiceNumber(workspaceId: string): Promise<string> {
    // Get the latest invoice number for this workspace
    const latest = await db
      .select()
      .from(invoices)
      .where(eq(invoices.workspace_id, workspaceId))
      .orderBy(desc(invoices.created_at))
      .limit(1);

    if (latest.length === 0) {
      return "INV-001";
    }

    const lastNumber = latest[0].invoice_number.match(/\d+$/)?.[0];
    if (!lastNumber) {
      return "INV-001";
    }

    const nextNumber = String(parseInt(lastNumber, 10) + 1).padStart(3, "0");
    return `INV-${nextNumber}`;
  }

  static async create(data: CreateInvoiceInput & { created_by_user_id: string }) {
    // Calculate totals
    const items = data.items.map((item) => ({
      ...item,
      quantity: item.quantity,
      unit_price: parseFloat(item.unit_price),
    }));

    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );

    const discountAmount = data.discount_amount
      ? parseFloat(data.discount_amount)
      : data.discount_percentage
      ? (subtotal * parseFloat(data.discount_percentage)) / 100
      : 0;

    const taxRate = data.tax_rate ? parseFloat(data.tax_rate) : 0;
    const taxAmount = (subtotal - discountAmount) * (taxRate / 100);
    const total = subtotal - discountAmount + taxAmount;

    const invoiceNumber =
      data.invoice_number || (await this.generateInvoiceNumber(data.workspace_id));

    const [invoice] = await db
      .insert(invoices)
      .values({
        workspace_id: data.workspace_id,
        client_id: data.client_id,
        invoice_number: invoiceNumber,
        currency: data.currency || "USD",
        amount_subtotal: subtotal.toString(),
        discount_amount: discountAmount > 0 ? discountAmount.toString() : null,
        discount_percentage: data.discount_percentage || null,
        tax_rate: taxRate > 0 ? taxRate.toString() : null,
        tax_amount: taxAmount > 0 ? taxAmount.toString() : null,
        total_amount: total.toString(),
        status: "draft",
        due_date: data.due_date,
        issued_date: data.issued_date || new Date().toISOString().split("T")[0],
        notes: data.notes || null,
        created_by_user_id: data.created_by_user_id,
      })
      .returning();

    // Insert invoice items
    await db.insert(invoice_items).values(
      items.map((item, index) => ({
        invoice_id: invoice.id,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.unit_price.toString(),
      }))
    );

    return invoice;
  }

  static async getById(invoiceId: string, workspaceId?: string) {
    const conditions = [eq(invoices.id, invoiceId)];
    if (workspaceId) {
      conditions.push(eq(invoices.workspace_id, workspaceId));
    }

    const [invoice] = await db
      .select()
      .from(invoices)
      .where(and(...conditions))
      .limit(1);

    if (!invoice) return null;

    const items = await db
      .select()
      .from(invoice_items)
      .where(eq(invoice_items.invoice_id, invoiceId));

    return { ...invoice, items };
  }

  static async getByWorkspace(
    workspaceId: string,
    options?: {
      client_id?: string;
      status?: string;
      search?: string;
      limit?: number;
      offset?: number;
    }
  ) {
    const conditions = [eq(invoices.workspace_id, workspaceId)];

    if (options?.client_id) {
      conditions.push(eq(invoices.client_id, options.client_id));
    }

    if (options?.status) {
      conditions.push(eq(invoices.status, options.status));
    }

    if (options?.search) {
      conditions.push(like(invoices.invoice_number, `%${options.search}%`));
    }

    let query = db
      .select()
      .from(invoices)
      .where(and(...conditions))
      .orderBy(desc(invoices.created_at));

    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.offset(options.offset);
    }

    return await query;
  }

  static async update(invoiceId: string, data: UpdateInvoiceInput, workspaceId?: string) {
    // Verify invoice belongs to workspace if workspaceId is provided
    if (workspaceId) {
      const existing = await this.getById(invoiceId, workspaceId);
      if (!existing) {
        return null;
      }
    }

    const updateData: any = {
      updated_at: new Date(),
    };

    if (data.invoice_number !== undefined) updateData.invoice_number = data.invoice_number;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.due_date !== undefined) updateData.due_date = data.due_date;
    if (data.issued_date !== undefined) updateData.issued_date = data.issued_date;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.paid_date !== undefined) updateData.paid_date = data.paid_date;
    if (data.notes !== undefined) updateData.notes = data.notes;

    // Recalculate totals if items are updated
    if (data.items) {
      const items = data.items.map((item) => ({
        ...item,
        quantity: item.quantity,
        unit_price: parseFloat(item.unit_price),
      }));

      const subtotal = items.reduce(
        (sum, item) => sum + item.quantity * item.unit_price,
        0
      );

      const discountAmount = data.discount_amount
        ? parseFloat(data.discount_amount)
        : data.discount_percentage
        ? (subtotal * parseFloat(data.discount_percentage)) / 100
        : 0;

      const taxRate = data.tax_rate ? parseFloat(data.tax_rate) : 0;
      const taxAmount = (subtotal - discountAmount) * (taxRate / 100);
      const total = subtotal - discountAmount + taxAmount;

      updateData.amount_subtotal = subtotal.toString();
      updateData.discount_amount = discountAmount > 0 ? discountAmount.toString() : null;
      updateData.discount_percentage = data.discount_percentage || null;
      updateData.tax_rate = taxRate > 0 ? taxRate.toString() : null;
      updateData.tax_amount = taxAmount > 0 ? taxAmount.toString() : null;
      updateData.total_amount = total.toString();

      // Update items
      await db.delete(invoice_items).where(eq(invoice_items.invoice_id, invoiceId));
      await db.insert(invoice_items).values(
        items.map((item) => ({
          invoice_id: invoiceId,
          name: item.name,
          quantity: item.quantity,
          unit_price: item.unit_price.toString(),
        }))
      );
    }

    const conditions = [eq(invoices.id, invoiceId)];
    if (workspaceId) {
      conditions.push(eq(invoices.workspace_id, workspaceId));
    }

    const [updated] = await db
      .update(invoices)
      .set(updateData)
      .where(and(...conditions))
      .returning();

    return updated || null;
  }

  static async delete(invoiceId: string, workspaceId?: string) {
    const conditions = [eq(invoices.id, invoiceId)];
    if (workspaceId) {
      conditions.push(eq(invoices.workspace_id, workspaceId));
    }
    await db.delete(invoices).where(and(...conditions));
  }

  static async markAsSent(invoiceId: string) {
    const [updated] = await db
      .update(invoices)
      .set({ status: "sent", updated_at: new Date() })
      .where(eq(invoices.id, invoiceId))
      .returning();

    return updated || null;
  }

  static async markAsPaid(invoiceId: string, paidDate?: string) {
    const [updated] = await db
      .update(invoices)
      .set({
        status: "paid",
        paid_date: paidDate || new Date().toISOString().split("T")[0],
        updated_at: new Date(),
      })
      .where(eq(invoices.id, invoiceId))
      .returning();

    return updated || null;
  }
}

