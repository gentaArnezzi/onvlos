import { NextRequest } from "next/server";
import { requireAuth, extractWorkspaceId } from "@/lib/api/middleware";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/utils";
import { WorkflowService } from "@/services/workflow.service";
import { createWorkflowSchema } from "@/lib/validators/workflow";
import { validateRequest, getRequestBody } from "@/lib/api/middleware";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const workspaceId = extractWorkspaceId(request);
    if (!workspaceId) {
      return errorResponse("workspaceId is required", 400);
    }

    const enabled = request.nextUrl.searchParams.get("enabled");
    const workflows = await WorkflowService.getByWorkspace(
      workspaceId,
      enabled ? enabled === "true" : undefined
    );

    return successResponse(workflows);
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

    const validation = validateRequest(body, createWorkflowSchema.parse);
    if (!validation.valid) {
      return errorResponse(validation.error, 400);
    }

    const workflow = await WorkflowService.create({
      ...validation.data,
      created_by_user_id: user.id,
    });

    return successResponse(workflow, "Workflow created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}

