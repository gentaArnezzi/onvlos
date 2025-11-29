import { NextRequest } from "next/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/utils";
import { InvoiceService } from "@/services/invoice.service";
import { triggerWorkflows } from "@/lib/workflows/engine";
// import Stripe from "stripe";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2024-11-20.acacia",
// });

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return errorResponse("Missing stripe-signature header", 400);
    }

    // TODO: Verify webhook signature
    // const event = stripe.webhooks.constructEvent(
    //   body,
    //   signature,
    //   process.env.STRIPE_WEBHOOK_SECRET!
    // );

    // Parse event manually for now
    const event = JSON.parse(body);

    // Handle payment success
    if (event.type === "checkout.session.completed" || event.type === "payment_intent.succeeded") {
      const invoiceId = event.data.object.metadata?.invoice_id;
      const amount = event.data.object.amount_total ? event.data.object.amount_total / 100 : null;
      
      if (invoiceId) {
        const invoice = await InvoiceService.markAsPaid(invoiceId);
        
        // Trigger workflow "invoice_paid"
        if (invoice) {
          await triggerWorkflows("invoice_paid", {
            invoice_id: invoiceId,
            amount: amount || invoice.total_amount,
            client_id: invoice.client_id,
            workspace_id: invoice.workspace_id,
          });
        }
      }
    }

    return successResponse({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return handleApiError(error);
  }
}

