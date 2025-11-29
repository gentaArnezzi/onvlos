import { NextRequest } from "next/server";
import { requireAuth, extractWorkspaceId } from "@/lib/api/middleware";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/utils";
import { ClientService } from "@/services/client.service";
import { updateClientSchema } from "@/lib/validators/client";
import { validateRequest, getRequestBody } from "@/lib/api/middleware";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const { clientId } = await params;
    const workspaceId = extractWorkspaceId(request);

    const client = await ClientService.getById(clientId, workspaceId || undefined);
    if (!client) {
      return errorResponse("Client not found", 404);
    }

    return successResponse(client);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const { clientId } = await params;

    const body = await getRequestBody(request);
    if (!body) {
      return errorResponse("Request body is required", 400);
    }

    const validation = validateRequest(body, updateClientSchema.parse);
    if (!validation.valid) {
      return errorResponse(validation.error, 400);
    }

    const client = await ClientService.update(clientId, validation.data);
    if (!client) {
      return errorResponse("Client not found", 404);
    }

    return successResponse(client, "Client updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const { clientId } = await params;

    await ClientService.delete(clientId);

    return successResponse(null, "Client deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

