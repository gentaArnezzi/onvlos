import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { errorResponse, handleApiError } from "@/lib/api/utils";
import { generateInvoicePDF } from "@/lib/pdf/generate-invoice-pdf";
import { InvoiceService } from "@/services/invoice.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const { invoiceId } = await params;

    // Verify invoice exists and user has access
    const invoice = await InvoiceService.getById(invoiceId);
    if (!invoice) {
      return errorResponse("Invoice not found", 404);
    }

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(invoiceId);

    // Return PDF as response
    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${invoice.invoice_number}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return handleApiError(error);
  }
}

