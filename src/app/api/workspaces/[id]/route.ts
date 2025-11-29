import { NextRequest } from "next/server";
import { requireWorkspaceAccess } from "@/lib/api/middleware";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/utils";
import { WorkspaceService } from "@/services/workspace.service";
import { updateWorkspaceSchema } from "@/lib/validators/workspace";
import { validateRequest, getRequestBody } from "@/lib/api/middleware";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authResult = await requireWorkspaceAccess(request, id);
    if (authResult instanceof Response) return authResult;

    const workspace = await WorkspaceService.getById(id);
    if (!workspace) {
      return errorResponse("Workspace not found", 404);
    }

    return successResponse(workspace);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authResult = await requireWorkspaceAccess(request, id, "admin");
    if (authResult instanceof Response) return authResult;

    const body = await getRequestBody(request);
    if (!body) {
      return errorResponse("Request body is required", 400);
    }

    const validation = validateRequest(body, updateWorkspaceSchema.parse);
    if (!validation.valid) {
      return errorResponse(validation.error, 400);
    }

    const workspace = await WorkspaceService.update(id, validation.data);
    if (!workspace) {
      return errorResponse("Workspace not found", 404);
    }

    return successResponse(workspace, "Workspace updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authResult = await requireWorkspaceAccess(request, id, "owner");
    if (authResult instanceof Response) return authResult;

    await WorkspaceService.delete(id);

    return successResponse(null, "Workspace deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

