import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/utils";
import { InvoiceService } from "@/services/invoice.service";
import { createPaymentLinkSchema } from "@/lib/validators/invoice";
import { validateRequest, getRequestBody } from "@/lib/api/middleware";
import { createMidtransPaymentLink } from "@/actions/payments";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const { invoiceId } = await params;

    const invoice = await InvoiceService.getById(invoiceId);
    if (!invoice) {
      return errorResponse("Invoice not found", 404);
    }

    const body = await getRequestBody(request);
    const validation = body
      ? validateRequest(body, createPaymentLinkSchema.parse)
      : { valid: true, data: {} };

    if (!validation.valid) {
      return errorResponse(validation.error, 400);
    }

    // Create payment link with Midtrans
    const result = await createMidtransPaymentLink(invoiceId);

    if (!result.success) {
      return errorResponse(result.error || "Failed to create payment link", 500);
    }

    const paymentLink = {
      token: result.token,
      redirectUrl: result.redirectUrl,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    return successResponse(paymentLink, "Payment link created successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

