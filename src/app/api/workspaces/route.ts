import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/utils";
import { WorkspaceService } from "@/services/workspace.service";
import { createWorkspaceSchema } from "@/lib/validators/workspace";
import { validateRequest } from "@/lib/api/middleware";
import { getRequestBody } from "@/lib/api/middleware";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;

    const workspaces = await WorkspaceService.getUserWorkspaces(user.id);

    return successResponse(workspaces);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;

    const body = await getRequestBody(request);
    if (!body) {
      return errorResponse("Request body is required", 400);
    }

    const validation = validateRequest(body, createWorkspaceSchema.parse);
    if (!validation.valid) {
      return errorResponse(validation.error, 400);
    }

    const workspace = await WorkspaceService.create({
      ...validation.data,
      created_by_user_id: user.id,
    });

    return successResponse(workspace, "Workspace created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}

