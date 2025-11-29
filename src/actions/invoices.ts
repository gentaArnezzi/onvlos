"use server";

import { db } from "@/lib/db";
import { invoices, invoice_items, client_companies } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getInvoices() {
  try {
    const data = await db.select({
        id: invoices.id,
        invoice_number: invoices.invoice_number,
        amount: invoices.total_amount,
        status: invoices.status,
        due_date: invoices.due_date,
        client_name: client_companies.name,
        created_at: invoices.created_at
    })
    .from(invoices)
    .leftJoin(client_companies, eq(invoices.client_id, client_companies.id))
    .orderBy(desc(invoices.created_at));
    
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function createInvoice(data: {
    client_id: string;
    due_date: Date;
    items: { name: string; quantity: number; unit_price: number }[];
    notes?: string;
}) {
    try {
        // Mock workspace
        const workspaceId = "00000000-0000-0000-0000-000000000000";
        
        // Calculate totals
        let subtotal = 0;
        const itemsWithSubtotal = data.items.map(item => {
            const itemSubtotal = item.quantity * item.unit_price;
            subtotal += itemSubtotal;
            return { ...item, subtotal: itemSubtotal };
        });
        
        // Simple tax logic (e.g., 0% for MVP unless specified)
        const taxRate = 0;
        const taxAmount = 0;
        const totalAmount = subtotal + taxAmount;
        
        // Generate Invoice Number
        const count = await db.$count(invoices);
        const invoiceNumber = `INV-${String(count + 1).padStart(3, '0')}`;
        
        // Transaction
        await db.transaction(async (tx) => {
            const [newInvoice] = await tx.insert(invoices).values({
                workspace_id: workspaceId,
                client_id: data.client_id,
                invoice_number: invoiceNumber,
                due_date: data.due_date.toISOString(), // Drizzle date expects string YYYY-MM-DD often, but let's try Date object or ISO string
                issued_date: new Date().toISOString(),
                amount_subtotal: subtotal.toString(),
                tax_rate: taxRate.toString(),
                tax_amount: taxAmount.toString(),
                total_amount: totalAmount.toString(),
                notes: data.notes,
                status: 'sent', // Auto send for MVP
            }).returning();
            
            if (itemsWithSubtotal.length > 0) {
                await tx.insert(invoice_items).values(
                    itemsWithSubtotal.map(item => ({
                        invoice_id: newInvoice.id,
                        name: item.name,
                        quantity: item.quantity,
                        unit_price: item.unit_price.toString(),
                    }))
                );
            }
        });

        revalidatePath("/dashboard/invoices");
        return { success: true };
    } catch (error) {
        console.error("Failed to create invoice:", error);
        return { success: false, error: "Failed to create invoice" };
    }
}
