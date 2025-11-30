"use server";

import { db } from "@/lib/db";
import { invoices, invoice_items, client_companies } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createPaymentLink } from "@/lib/payments/midtrans";

export async function getInvoicePaymentDetails(invoiceId: string) {
    try {
        // Note: This function is used by portal (public access), so we don't check workspace
        // The portal access is already protected by the slug-based access
        const invoice = await db.query.invoices.findFirst({
            where: eq(invoices.id, invoiceId)
        });
        return invoice;
    } catch (error) {
        return null;
    }
}

export async function createMidtransPaymentLink(invoiceId: string) {
    try {
        const invoice = await db.query.invoices.findFirst({
            where: eq(invoices.id, invoiceId)
        });

        if (!invoice) {
            return { success: false, error: "Invoice not found" };
        }

        // Get client details
        const client = await db.query.client_companies.findFirst({
            where: eq(client_companies.id, invoice.client_id)
        });

        if (!client) {
            return { success: false, error: "Client not found" };
        }

        // Get invoice items
        const items = await db.query.invoice_items.findMany({
            where: eq(invoice_items.invoice_id, invoiceId)
        });

        // Prepare customer details
        const clientName = client.name || client.company_name || "Customer";
        const nameParts = clientName.split(" ");
        const firstName = nameParts[0] || "Customer";
        const lastName = nameParts.slice(1).join(" ") || "";

        // Prepare item details for Midtrans
        const itemDetails = items.map((item, index) => ({
            id: item.id || `item-${index}`,
            price: parseFloat(item.unit_price || "0"),
            quantity: item.quantity || 1,
            name: item.name || "Item",
        }));

        // If no items, add a single item with total amount
        if (itemDetails.length === 0) {
            itemDetails.push({
                id: "invoice-total",
                price: parseFloat(invoice.total_amount || "0"),
                quantity: 1,
                name: `Invoice ${invoice.invoice_number}`,
            });
        }

        // Create payment link
        const result = await createPaymentLink({
            invoiceId: invoice.id,
            amount: parseFloat(invoice.total_amount || "0"),
            currency: invoice.currency || "IDR",
            customerDetails: {
                first_name: firstName,
                last_name: lastName,
                email: client.email || "",
                phone: "",
            },
            itemDetails,
            returnUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/portal/payment/success`,
            cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/portal/payment/cancel`,
        });

        return result;
    } catch (error) {
        console.error("Create payment link error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create payment link",
        };
    }
}
