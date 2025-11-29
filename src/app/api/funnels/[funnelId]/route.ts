import { NextRequest } from "next/server";
import { requireAuth, extractWorkspaceId } from "@/lib/api/middleware";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/utils";
import { FunnelService } from "@/services/funnel.service";
import { updateFunnelSchema } from "@/lib/validators/funnel";
import { validateRequest, getRequestBody } from "@/lib/api/middleware";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ funnelId: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const { funnelId } = await params;
    const workspaceId = extractWorkspaceId(request);

    const funnel = await FunnelService.getById(funnelId, workspaceId || undefined);
    if (!funnel) {
      return errorResponse("Funnel not found", 404);
    }

    return successResponse(funnel);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ funnelId: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const { funnelId } = await params;

    const body = await getRequestBody(request);
    if (!body) {
      return errorResponse("Request body is required", 400);
    }

    const validation = validateRequest(body, updateFunnelSchema.parse);
    if (!validation.valid) {
      return errorResponse(validation.error, 400);
    }

    const funnel = await FunnelService.update(funnelId, validation.data);
    if (!funnel) {
      return errorResponse("Funnel not found", 404);
    }

    return successResponse(funnel, "Funnel updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ funnelId: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const { funnelId } = await params;

    await FunnelService.delete(funnelId);

    return successResponse(null, "Funnel deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

