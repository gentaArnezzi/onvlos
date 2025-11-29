import { NextRequest } from "next/server";
import { requireAuth, extractWorkspaceId } from "@/lib/api/middleware";
import { successResponse, errorResponse, handleApiError, parsePaginationParams, createPaginatedResponse } from "@/lib/api/utils";
import { ClientService } from "@/services/client.service";
import { createClientSchema } from "@/lib/validators/client";
import { validateRequest, getRequestBody } from "@/lib/api/middleware";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const workspaceId = extractWorkspaceId(request);
    if (!workspaceId) {
      return errorResponse("workspaceId is required", 400);
    }

    const searchParams = request.nextUrl.searchParams;
    const pagination = parsePaginationParams(searchParams);
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const clients = await ClientService.getByWorkspace(workspaceId, {
      status,
      search,
      limit: pagination.limit,
      offset: pagination.offset,
    });

    // Get total count for pagination
    const allClients = await ClientService.getByWorkspace(workspaceId, { status, search });
    const total = allClients.length;

    const response = createPaginatedResponse(clients, total, pagination.page!, pagination.limit!);

    return successResponse(response);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const body = await getRequestBody(request);
    if (!body) {
      return errorResponse("Request body is required", 400);
    }

    const validation = validateRequest(body, createClientSchema.parse);
    if (!validation.valid) {
      return errorResponse(validation.error, 400);
    }

    const client = await ClientService.create(validation.data);

    return successResponse(client, "Client created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}

