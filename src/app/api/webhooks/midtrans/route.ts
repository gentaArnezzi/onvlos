import { NextRequest } from "next/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/utils";
import { InvoiceService } from "@/services/invoice.service";
import { getRequestBody } from "@/lib/api/middleware";
// import midtransClient from "midtrans-client";

export async function POST(request: NextRequest) {
  try {
    const body = await getRequestBody(request);
    if (!body) {
      return errorResponse("Request body is required", 400);
    }

    // TODO: Verify Midtrans notification
    // const snap = new midtransClient.Snap({
    //   isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
    //   serverKey: process.env.MIDTRANS_SERVER_KEY!,
    // });

    // const statusResponse = await snap.transaction.notification(body);

    // Handle payment success
    if (body.transaction_status === "settlement" || body.transaction_status === "capture") {
      const invoiceId = body.custom_field1; // Assuming invoice ID is passed in custom_field1
      
      if (invoiceId) {
        await InvoiceService.markAsPaid(invoiceId);
        
        // TODO: Trigger workflow "invoice_paid"
      }
    }

    return successResponse({ received: true });
  } catch (error) {
    console.error("Midtrans webhook error:", error);
    return handleApiError(error);
  }
}

