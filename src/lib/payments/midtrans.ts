"use server";

import midtransClient from "midtrans-client";
import { db } from "@/lib/db";
import { invoices, payments, client_spaces } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { triggerWorkflows } from "@/lib/workflows/engine";

// Initialize Midtrans Snap client
function getMidtransSnap() {
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const clientKey = process.env.MIDTRANS_CLIENT_KEY;

  if (!serverKey || !clientKey) {
    throw new Error("Midtrans credentials not configured");
  }

  return new midtransClient.Snap({
    isProduction,
    serverKey,
    clientKey,
  });
}

// Initialize Midtrans Core API client (for webhook verification)
function getMidtransCore() {
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
  const serverKey = process.env.MIDTRANS_SERVER_KEY;

  if (!serverKey) {
    throw new Error("Midtrans server key not configured");
  }

  return new midtransClient.CoreApi({
    isProduction,
    serverKey,
  });
}

export interface CreatePaymentLinkParams {
  invoiceId: string;
  amount: number;
  currency: string;
  customerDetails: {
    first_name: string;
    last_name?: string;
    email: string;
    phone?: string;
  };
  itemDetails: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
  }>;
  returnUrl?: string;
  cancelUrl?: string;
}

export async function createPaymentLink(params: CreatePaymentLinkParams) {
  try {
    const snap = getMidtransSnap();

    const parameter = {
      transaction_details: {
        order_id: `INV-${params.invoiceId}-${Date.now()}`,
        gross_amount: params.amount,
      },
      item_details: params.itemDetails,
      customer_details: {
        first_name: params.customerDetails.first_name,
        last_name: params.customerDetails.last_name || "",
        email: params.customerDetails.email,
        phone: params.customerDetails.phone || "",
      },
      callbacks: {
        finish: params.returnUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/portal/payment/success`,
        unfinish: params.cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/portal/payment/unfinish`,
        error: params.cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/portal/payment/error`,
      },
      custom_field1: params.invoiceId, // Store invoice ID for webhook
      // Enable QRIS payment method
      enabled_payments: ['qris'],
    };

    const transaction = await snap.createTransaction(parameter);
    
    return {
      success: true,
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
    };
  } catch (error) {
    console.error("Midtrans payment link creation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create payment link",
    };
  }
}

// Create QRIS payment specifically for Funnels
export async function createQRISPayment(params: {
  orderId: string;
  amount: number;
  customerDetails: {
    first_name: string;
    last_name?: string;
    email: string;
    phone?: string;
  };
  itemDetails: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
  }>;
  metadata?: any;
}) {
  try {
    const core = getMidtransCore();

    const parameter = {
      payment_type: "qris",
      transaction_details: {
        order_id: params.orderId,
        gross_amount: params.amount,
      },
      item_details: params.itemDetails,
      customer_details: {
        first_name: params.customerDetails.first_name,
        last_name: params.customerDetails.last_name || "",
        email: params.customerDetails.email,
        phone: params.customerDetails.phone || "",
      },
      qris: {
        acquirer: "gopay", // or "shopeepay", "dana", etc.
      },
      custom_field1: JSON.stringify(params.metadata || {}),
    };

    const chargeResponse = await core.transaction.charge(parameter);
    
    return {
      success: true,
      transaction_id: chargeResponse.transaction_id,
      order_id: chargeResponse.order_id,
      qr_code: chargeResponse.qr_code, // QRIS QR code string
      qr_code_url: chargeResponse.qr_code_url, // QRIS QR code image URL
      status_code: chargeResponse.status_code,
      status_message: chargeResponse.status_message,
    };
  } catch (error) {
    console.error("Midtrans QRIS payment creation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create QRIS payment",
    };
  }
}

export async function verifyWebhook(notification: any): Promise<boolean> {
  try {
    const core = getMidtransCore();
    const serverKey = process.env.MIDTRANS_SERVER_KEY;

    if (!serverKey) {
      throw new Error("Midtrans server key not configured");
    }

    // Verify notification using Midtrans Core API
    const statusResponse = await core.transaction.notification(notification);
    
    // Verify the notification is valid
    if (!statusResponse || !statusResponse.transaction_status) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Midtrans webhook verification error:", error);
    return false;
  }
}

export async function getTransactionStatus(orderId: string) {
  try {
    const core = getMidtransCore();
    const statusResponse = await core.transaction.status(orderId);
    return {
      success: true,
      status: statusResponse,
    };
  } catch (error) {
    console.error("Midtrans transaction status error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get transaction status",
    };
  }
}

export async function handlePaymentSuccess(
  invoiceId: string,
  transactionData: any
) {
  try {
    const invoice = await db.query.invoices.findFirst({
      where: eq(invoices.id, invoiceId),
    });

    if (!invoice) {
      return { success: false, error: "Invoice not found" };
    }

    // Check if payment already processed (idempotency)
    const existingPayment = await db.query.payments.findFirst({
      where: eq(payments.gateway_payment_id, transactionData.transaction_id || ""),
    });

    if (existingPayment && existingPayment.status === "completed") {
      return { success: true, alreadyProcessed: true };
    }

    // Create payment record
    await db.insert(payments).values({
      invoice_id: invoiceId,
      gateway: "midtrans",
      gateway_payment_id: transactionData.transaction_id || "",
      amount: transactionData.gross_amount?.toString() || invoice.total_amount,
      currency: transactionData.currency || invoice.currency || "IDR",
      status: "completed",
      paid_at: new Date(transactionData.settlement_time || Date.now()),
      metadata: transactionData,
    });

    // Update invoice status
    await db.update(invoices)
      .set({
        status: "paid",
        paid_date: new Date(transactionData.settlement_time || Date.now()).toISOString(),
        updated_at: new Date(),
      })
      .where(eq(invoices.id, invoiceId));

    // Trigger workflow "invoice_paid"
    await triggerWorkflows("invoice_paid", {
      invoice_id: invoiceId,
      amount: parseFloat(transactionData.gross_amount?.toString() || invoice.total_amount || "0"),
      client_id: invoice.client_id,
      workspace_id: invoice.workspace_id,
    });

    // Revalidate paths
    const space = await db.query.client_spaces.findFirst({
      where: eq(client_spaces.client_id, invoice.client_id),
    });

    if (space) {
      revalidatePath(`/portal/${space.public_url}`);
    }
    revalidatePath("/dashboard/invoices");

    return { success: true };
  } catch (error) {
    console.error("Handle payment success error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to process payment",
    };
  }
}

