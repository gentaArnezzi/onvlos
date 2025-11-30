"use server";

import { db } from "@/lib/db";
import { invoices, invoice_items, client_companies, client_spaces } from "@/lib/db/schema";
import { desc, eq, and, or, like } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getOrCreateWorkspace } from "./workspace";
import { getSession } from "@/lib/get-session";
import { sendEmail } from "@/lib/email";
import { getCurrencySymbol } from "@/lib/currency";

export async function getInvoices(search?: string, status?: string, page: number = 1, limit: number = 20) {
  try {
    const session = await getSession();
    if (!session) return { invoices: [], total: 0, totalPages: 0 };

    const workspace = await getOrCreateWorkspace();
    if (!workspace) return { invoices: [], total: 0, totalPages: 0 };

    const conditions = [eq(invoices.workspace_id, workspace.id)];

    // Filter by status
    if (status && status !== 'all') {
      conditions.push(eq(invoices.status, status));
    }

    // Search by invoice number or client name
    let query = db.select({
        id: invoices.id,
        invoice_number: invoices.invoice_number,
        amount: invoices.total_amount,
        currency: invoices.currency,
        status: invoices.status,
        due_date: invoices.due_date,
        client_name: client_companies.name,
        client_company_name: client_companies.company_name,
        created_at: invoices.created_at
    })
    .from(invoices)
    .leftJoin(client_companies, eq(invoices.client_id, client_companies.id))
    .where(and(...conditions));

    const allData = await query.orderBy(desc(invoices.created_at));

    // Filter by search term if provided
    let filteredData = allData;
    if (search && search.trim()) {
      const searchLower = search.toLowerCase();
      filteredData = allData.filter(inv => 
        inv.invoice_number?.toLowerCase().includes(searchLower) ||
        inv.client_name?.toLowerCase().includes(searchLower) ||
        inv.client_company_name?.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const total = filteredData.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedData = filteredData.slice(offset, offset + limit);

    return { invoices: paginatedData, total, totalPages };
  } catch (error) {
    console.error(error);
    return { invoices: [], total: 0, totalPages: 0 };
  }
}

export async function createInvoice(data: {
    client_id?: string;
    due_date: Date;
    items: { name: string; quantity: number; unit_price: number }[];
    currency?: string;
    discount_amount?: number;
    discount_percentage?: number;
    tax_rate?: number;
    notes?: string;
    status?: 'draft' | 'sent';
    invoice_type?: 'single' | 'retainer';
    retainer_schedule?: { frequency: 'weekly' | 'monthly' | 'yearly'; interval: number };
    autopay_enabled?: boolean;
    is_public?: boolean;
    redirect_url?: string;
}) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Not authenticated" };
        }

        const workspace = await getOrCreateWorkspace();
        if (!workspace) {
            return { success: false, error: "Workspace not found" };
        }
        
        // Use workspace default currency if currency not provided
        const currency = data.currency || workspace.default_currency || "USD";
        
        // Calculate totals
        let subtotal = 0;
        const itemsWithSubtotal = data.items.map(item => {
            const itemSubtotal = item.quantity * item.unit_price;
            subtotal += itemSubtotal;
            return { ...item, subtotal: itemSubtotal };
        });
        
        // Calculate discount
        const discountAmount = data.discount_amount 
            ? data.discount_amount 
            : data.discount_percentage 
                ? (subtotal * data.discount_percentage) / 100 
                : 0;
        
        // Calculate tax (on subtotal after discount)
        const taxRate = data.tax_rate || 0;
        const taxAmount = (subtotal - discountAmount) * (taxRate / 100);
        const totalAmount = subtotal - discountAmount + taxAmount;
        
        // Generate Invoice Number
        const existingInvoices = await db.select()
            .from(invoices)
            .where(eq(invoices.workspace_id, workspace.id));
        const count = existingInvoices.length;
        const invoiceNumber = `INV-${String(count + 1).padStart(3, '0')}`;
        
        // Generate public URL if is_public
        const publicUrl = data.is_public ? `invoice-${crypto.randomUUID()}` : null;
        
        // Transaction
        await db.transaction(async (tx) => {
            const [newInvoice] = await tx.insert(invoices).values({
                workspace_id: workspace.id,
                client_id: data.client_id || null,
                invoice_number: invoiceNumber,
                invoice_type: data.invoice_type || 'single',
                currency: currency,
                due_date: data.due_date instanceof Date 
                    ? data.due_date.toISOString().split('T')[0] 
                    : data.due_date,
                issued_date: new Date().toISOString().split('T')[0],
                amount_subtotal: subtotal.toString(),
                discount_amount: discountAmount > 0 ? discountAmount.toString() : null,
                discount_percentage: data.discount_percentage ? data.discount_percentage.toString() : null,
                tax_rate: taxRate > 0 ? taxRate.toString() : null,
                tax_amount: taxAmount > 0 ? taxAmount.toString() : null,
                total_amount: totalAmount.toString(),
                notes: data.notes || null,
                status: data.status || 'draft',
                is_public: data.is_public || false,
                public_url: publicUrl,
                retainer_schedule: data.retainer_schedule ? JSON.stringify(data.retainer_schedule) : null,
                autopay_enabled: data.autopay_enabled || false,
                redirect_url: data.redirect_url || null,
                created_by_user_id: session.user.id,
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

export async function updateInvoiceStatus(invoiceId: string, status: string) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Not authenticated" };
        }

        const workspace = await getOrCreateWorkspace();
        if (!workspace) {
            return { success: false, error: "Workspace not found" };
        }

        await db.update(invoices)
            .set({ 
                status,
                updated_at: new Date(),
                ...(status === 'paid' ? { paid_date: new Date().toISOString().split('T')[0] } : {})
            })
            .where(and(
                eq(invoices.id, invoiceId),
                eq(invoices.workspace_id, workspace.id)
            ));

        revalidatePath("/dashboard/invoices");
        return { success: true };
    } catch (error) {
        console.error("Failed to update invoice status:", error);
        return { success: false, error: "Failed to update invoice status" };
    }
}

export async function sendInvoice(invoiceId: string) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Not authenticated" };
        }

        const workspace = await getOrCreateWorkspace();
        if (!workspace) {
            return { success: false, error: "Workspace not found" };
        }

        // Update status to 'sent'
        await db.update(invoices)
            .set({ 
                status: 'sent',
                updated_at: new Date()
            })
            .where(and(
                eq(invoices.id, invoiceId),
                eq(invoices.workspace_id, workspace.id)
            ));

        // TODO: Send email to client
        // await sendEmail(...);

        revalidatePath("/dashboard/invoices");
        return { success: true };
    } catch (error) {
        console.error("Failed to send invoice:", error);
        return { success: false, error: "Failed to send invoice" };
    }
}

export async function getInvoiceById(invoiceId: string) {
    try {
        const session = await getSession();
        if (!session) return null;

        const workspace = await getOrCreateWorkspace();
        if (!workspace) return null;

        const invoice = await db.query.invoices.findFirst({
            where: and(
                eq(invoices.id, invoiceId),
                eq(invoices.workspace_id, workspace.id)
            )
        });

        if (!invoice) return null;

        const items = await db.query.invoice_items.findMany({
            where: eq(invoice_items.invoice_id, invoiceId)
        });

        const client = await db.query.client_companies.findFirst({
            where: eq(client_companies.id, invoice.client_id)
        });

        return {
            ...invoice,
            items,
            client
        };
    } catch (error) {
        console.error("Failed to get invoice:", error);
        return null;
    }
}

export async function duplicateInvoice(invoiceId: string) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Not authenticated" };
        }

        const workspace = await getOrCreateWorkspace();
        if (!workspace) {
            return { success: false, error: "Workspace not found" };
        }

        const originalInvoice = await db.query.invoices.findFirst({
            where: and(
                eq(invoices.id, invoiceId),
                eq(invoices.workspace_id, workspace.id)
            )
        });

        if (!originalInvoice) {
            return { success: false, error: "Invoice not found" };
        }

        const originalItems = await db.query.invoice_items.findMany({
            where: eq(invoice_items.invoice_id, invoiceId)
        });

        // Generate new invoice number
        const existingInvoices = await db.select()
            .from(invoices)
            .where(eq(invoices.workspace_id, workspace.id));
        const count = existingInvoices.length;
        const invoiceNumber = `INV-${String(count + 1).padStart(3, '0')}`;

        // Create duplicate
        await db.transaction(async (tx) => {
            const [newInvoice] = await tx.insert(invoices).values({
                workspace_id: workspace.id,
                client_id: originalInvoice.client_id,
                invoice_number: invoiceNumber,
                currency: originalInvoice.currency || 'USD',
                due_date: originalInvoice.due_date,
                issued_date: new Date().toISOString().split('T')[0],
                amount_subtotal: originalInvoice.amount_subtotal,
                discount_amount: originalInvoice.discount_amount,
                discount_percentage: originalInvoice.discount_percentage,
                tax_rate: originalInvoice.tax_rate,
                tax_amount: originalInvoice.tax_amount,
                total_amount: originalInvoice.total_amount,
                notes: originalInvoice.notes,
                status: 'draft',
                created_by_user_id: session.user.id,
            }).returning();

            if (originalItems.length > 0) {
                await tx.insert(invoice_items).values(
                    originalItems.map(item => ({
                        invoice_id: newInvoice.id,
                        name: item.name,
                        quantity: item.quantity,
                        unit_price: item.unit_price,
                    }))
                );
            }
        });

        revalidatePath("/dashboard/invoices");
        return { success: true };
    } catch (error) {
        console.error("Failed to duplicate invoice:", error);
        return { success: false, error: "Failed to duplicate invoice" };
    }
}

export async function getPublicInvoice(publicUrl: string) {
    try {
        const invoice = await db.query.invoices.findFirst({
            where: and(
                eq(invoices.public_url, publicUrl),
                eq(invoices.is_public, true)
            )
        });

        if (!invoice) return null;

        const items = await db.query.invoice_items.findMany({
            where: eq(invoice_items.invoice_id, invoice.id)
        });

        const client = invoice.client_id ? await db.query.client_companies.findFirst({
            where: eq(client_companies.id, invoice.client_id)
        }) : null;

        return {
            ...invoice,
            items,
            client
        };
    } catch (error) {
        console.error("Failed to get public invoice:", error);
        return null;
    }
}

export async function generateInvoicePDF(invoiceId: string) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, pdf: null, error: "Not authenticated" };
        }

        const invoice = await getInvoiceById(invoiceId);
        if (!invoice) {
            return { success: false, pdf: null, error: "Invoice not found" };
        }

        // TODO: Implement actual PDF generation using a library like pdfkit, jsPDF, or puppeteer
        // For now, return a placeholder
        const pdfData = `PDF for invoice ${invoice.invoice_number}`;
        
        return { success: true, pdf: pdfData };
    } catch (error) {
        console.error("Failed to generate PDF:", error);
        return { success: false, pdf: null, error: "Failed to generate PDF" };
    }
}

export async function sendInvoiceEmail(invoiceId: string, recipientEmail: string) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Not authenticated" };
        }

        const invoice = await getInvoiceById(invoiceId);
        if (!invoice) {
            return { success: false, error: "Invoice not found" };
        }

        // Generate public URL if not exists and make it public
        let publicUrl = invoice.public_url;
        if (!publicUrl) {
            publicUrl = `invoice-${crypto.randomUUID()}`;
            await db.update(invoices)
                .set({ 
                    public_url: publicUrl,
                    is_public: true
                })
                .where(eq(invoices.id, invoiceId));
        }

        const invoiceLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invoice/${publicUrl}`;

        // Send email
        await sendEmail({
            to: recipientEmail,
            subject: `Invoice ${invoice.invoice_number}`,
            html: `
                <h2>Invoice ${invoice.invoice_number}</h2>
                <p>Dear ${invoice.client?.name || 'Client'},</p>
                <p>Please find your invoice attached.</p>
                <p><a href="${invoiceLink}">View Invoice Online</a></p>
                <p>Amount: ${invoice.currency} ${invoice.total_amount}</p>
                <p>Due Date: ${invoice.due_date}</p>
            `,
        });

        // Update status to 'sent' if it's draft
        if (invoice.status === 'draft') {
            await db.update(invoices)
                .set({ status: 'sent' })
                .where(eq(invoices.id, invoiceId));
        }

        revalidatePath("/dashboard/invoices");
        return { success: true };
    } catch (error) {
        console.error("Failed to send invoice email:", error);
        return { success: false, error: "Failed to send invoice email" };
    }
}

export async function createStripePaymentIntent(invoiceId: string) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, clientSecret: null, error: "Not authenticated" };
        }

        const invoice = await getInvoiceById(invoiceId);
        if (!invoice) {
            return { success: false, clientSecret: null, error: "Invoice not found" };
        }

        // TODO: Implement actual Stripe Payment Intent creation
        // This requires Stripe API key configuration
        // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        // const paymentIntent = await stripe.paymentIntents.create({
        //     amount: Math.round(parseFloat(invoice.total_amount) * 100), // Convert to cents
        //     currency: invoice.currency?.toLowerCase() || 'usd',
        //     metadata: { invoice_id: invoiceId },
        // });

        // For now, return a placeholder
        return { 
            success: true, 
            clientSecret: `pi_mock_${invoiceId}`,
            error: null 
        };
    } catch (error) {
        console.error("Failed to create payment intent:", error);
        return { success: false, clientSecret: null, error: "Failed to create payment intent" };
    }
}
