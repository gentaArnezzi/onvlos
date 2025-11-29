import { NextRequest } from "next/server";
import { requireAuth, extractWorkspaceId } from "@/lib/api/middleware";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/utils";
import { InvoiceService } from "@/services/invoice.service";
import { updateInvoiceSchema } from "@/lib/validators/invoice";
import { validateRequest, getRequestBody } from "@/lib/api/middleware";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const { invoiceId } = await params;
    const workspaceId = extractWorkspaceId(request);

    const invoice = await InvoiceService.getById(invoiceId, workspaceId || undefined);
    if (!invoice) {
      return errorResponse("Invoice not found", 404);
    }

    return successResponse(invoice);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const { invoiceId } = await params;
    const workspaceId = extractWorkspaceId(request);

    const body = await getRequestBody(request);
    if (!body) {
      return errorResponse("Request body is required", 400);
    }

    const validation = validateRequest(body, updateInvoiceSchema.parse);
    if (!validation.valid) {
      return errorResponse(validation.error, 400);
    }

    const invoice = await InvoiceService.update(invoiceId, validation.data, workspaceId || undefined);
    if (!invoice) {
      return errorResponse("Invoice not found", 404);
    }

    return successResponse(invoice, "Invoice updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const { invoiceId } = await params;
    const workspaceId = extractWorkspaceId(request);

    await InvoiceService.delete(invoiceId, workspaceId || undefined);

    return successResponse(null, "Invoice deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

