import { NextRequest } from "next/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/utils";
import { InvoiceService } from "@/services/invoice.service";
import { getRequestBody } from "@/lib/api/middleware";
import { triggerWorkflows } from "@/lib/workflows/engine";
// import xendit from "xendit-node";

export async function POST(request: NextRequest) {
  try {
    const body = await getRequestBody(request);
    if (!body) {
      return errorResponse("Request body is required", 400);
    }

    // TODO: Verify Xendit webhook signature
    // const xenditClient = new xendit({
    //   secretKey: process.env.XENDIT_SECRET_KEY!,
    // });

    // Handle payment success
    if (body.status === "PAID" || body.status === "SETTLED") {
      const invoiceId = body.external_id; // Assuming invoice ID is passed in external_id
      
      if (invoiceId) {
        const invoice = await InvoiceService.markAsPaid(invoiceId);
        
        // Trigger workflow "invoice_paid"
        if (invoice) {
          await triggerWorkflows("invoice_paid", {
            invoice_id: invoiceId,
            amount: parseFloat(invoice.total_amount || "0"),
            client_id: invoice.client_id,
            workspace_id: invoice.workspace_id,
          });
        }
      }
    }

    return successResponse({ received: true });
  } catch (error) {
    console.error("Xendit webhook error:", error);
    return handleApiError(error);
  }
}

