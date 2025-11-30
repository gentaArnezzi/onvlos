import { NextRequest } from "next/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/utils";
import { getRequestBody } from "@/lib/api/middleware";
import { verifyWebhook, handlePaymentSuccess } from "@/lib/payments/midtrans";

export async function POST(request: NextRequest) {
  try {
    const body = await getRequestBody(request);
    if (!body) {
      return errorResponse("Request body is required", 400);
    }

    // Verify webhook signature
    const isValid = await verifyWebhook(body);
    if (!isValid) {
      return errorResponse("Invalid webhook signature", 401);
    }

    // Extract invoice ID from custom_field1
    const invoiceId = body.custom_field1;
    if (!invoiceId) {
      return errorResponse("Invoice ID not found in webhook", 400);
    }

    // Handle payment success
    if (body.transaction_status === "settlement" || body.transaction_status === "capture") {
      const result = await handlePaymentSuccess(invoiceId, body);
      
      if (!result.success) {
        console.error("Failed to handle payment success:", result.error);
        return errorResponse(result.error || "Failed to process payment", 500);
      }
    }

    // Handle other transaction statuses (pending, cancel, expire, deny)
    // Log for monitoring but don't update invoice status yet
    if (["pending", "cancel", "expire", "deny"].includes(body.transaction_status)) {
      console.log(`Payment ${body.transaction_status} for invoice ${invoiceId}`);
    }

    return successResponse({ received: true, status: body.transaction_status });
  } catch (error) {
    console.error("Midtrans webhook error:", error);
    return handleApiError(error);
  }
}

