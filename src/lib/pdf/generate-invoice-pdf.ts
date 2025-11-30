"use server";

import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePDF } from "./invoice-pdf";
import { db } from "@/lib/db";
import { invoices, invoice_items, client_companies, workspaces } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function generateInvoicePDF(invoiceId: string) {
  try {
    // Fetch invoice with all related data
    const invoice = await db.query.invoices.findFirst({
      where: eq(invoices.id, invoiceId),
    });

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    // Fetch invoice items
    const items = await db.query.invoice_items.findMany({
      where: eq(invoice_items.invoice_id, invoiceId),
    });

    // Fetch client
    const client = await db.query.client_companies.findFirst({
      where: eq(client_companies.id, invoice.client_id),
    });

    // Fetch workspace
    const workspace = await db.query.workspaces.findFirst({
      where: eq(workspaces.id, invoice.workspace_id),
    });

    // Prepare invoice data
    const invoiceData = {
      invoice_number: invoice.invoice_number,
      issued_date: invoice.issued_date?.toString() || new Date().toISOString(),
      due_date: invoice.due_date?.toString() || new Date().toISOString(),
      client: {
        name: client?.name || null,
        company_name: client?.company_name || null,
        email: client?.email || null,
      },
      items: items.map((item) => ({
        name: item.name,
        quantity: item.quantity || 1,
        unit_price: item.unit_price || "0",
      })),
      amount_subtotal: invoice.amount_subtotal || "0",
      discount_amount: invoice.discount_amount,
      discount_percentage: invoice.discount_percentage,
      tax_rate: invoice.tax_rate,
      tax_amount: invoice.tax_amount,
      total_amount: invoice.total_amount || "0",
      currency: invoice.currency || "USD",
      notes: invoice.notes,
      workspace: {
        name: workspace?.name || null,
      },
    };

    // Generate PDF
    const pdfBuffer = await renderToBuffer(<InvoicePDF invoice={invoiceData} />);

    return pdfBuffer;
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    throw error;
  }
}

