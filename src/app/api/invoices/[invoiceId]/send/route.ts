import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/utils";
import { InvoiceService } from "@/services/invoice.service";
import { sendInvoiceSchema } from "@/lib/validators/invoice";
import { validateRequest, getRequestBody } from "@/lib/api/middleware";
// import { sendEmail } from "@/lib/email"; // Uncomment when email service is ready

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const { invoiceId } = await params;

    const body = await getRequestBody(request);
    const validation = body
      ? validateRequest(body, sendInvoiceSchema.parse)
      : { valid: true, data: {} };

    if (!validation.valid) {
      return errorResponse(validation.error, 400);
    }

    const invoice = await InvoiceService.markAsSent(invoiceId);
    if (!invoice) {
      return errorResponse("Invoice not found", 404);
    }

    // TODO: Send email to client
    // if (validation.data.email) {
    //   await sendEmail(validation.data.email, "invoice", {
    //     invoiceNumber: invoice.invoice_number,
    //     amount: invoice.total_amount,
    //     dueDate: invoice.due_date,
    //   });
    // }

    return successResponse(invoice, "Invoice sent successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

