"use server";

import { db } from "@/lib/db";
import { invoices, payments, client_spaces } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getInvoicePaymentDetails(invoiceId: string) {
    try {
        const invoice = await db.query.invoices.findFirst({
            where: eq(invoices.id, invoiceId)
        });
        return invoice;
    } catch (error) {
        return null;
    }
}

export async function processPayment(invoiceId: string, amount: string, method: string) {
    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Create payment record
        await db.insert(payments).values({
            invoice_id: invoiceId,
            gateway: "stripe_mock",
            gateway_payment_id: "pay_" + Math.random().toString(36).substring(7),
            amount: amount,
            currency: "USD",
            status: "completed",
            paid_at: new Date()
        });

        // Update invoice status
        await db.update(invoices)
            .set({ 
                status: 'paid', 
                paid_date: new Date().toISOString() // Drizzle date string handling
            })
            .where(eq(invoices.id, invoiceId));

        // Find workspace to revalidate portal
        const invoice = await db.query.invoices.findFirst({
            where: eq(invoices.id, invoiceId),
            with: {
                // Assuming relations exist, otherwise we query client_spaces
            }
        });
        
        if (invoice) {
             const space = await db.query.client_spaces.findFirst({
                 where: eq(client_spaces.client_id, invoice.client_id)
             });
             if (space) {
                 revalidatePath(`/portal/${space.public_url}`);
             }
        }
        
        revalidatePath("/dashboard/invoices");

        return { success: true };
    } catch (error) {
        console.error("Payment Failed:", error);
        return { success: false };
    }
}
