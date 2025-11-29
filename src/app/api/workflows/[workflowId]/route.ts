import { NextRequest } from "next/server";
import { requireAuth, extractWorkspaceId } from "@/lib/api/middleware";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/utils";
import { WorkflowService } from "@/services/workflow.service";
import { updateWorkflowSchema } from "@/lib/validators/workflow";
import { validateRequest, getRequestBody } from "@/lib/api/middleware";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const { workflowId } = await params;
    const workspaceId = extractWorkspaceId(request);

    const workflow = await WorkflowService.getById(workflowId, workspaceId || undefined);
    if (!workflow) {
      return errorResponse("Workflow not found", 404);
    }

    return successResponse(workflow);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const { workflowId } = await params;

    const body = await getRequestBody(request);
    if (!body) {
      return errorResponse("Request body is required", 400);
    }

    const validation = validateRequest(body, updateWorkflowSchema.parse);
    if (!validation.valid) {
      return errorResponse(validation.error, 400);
    }

    const workflow = await WorkflowService.update(workflowId, validation.data);
    if (!workflow) {
      return errorResponse("Workflow not found", 404);
    }

    return successResponse(workflow, "Workflow updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const { workflowId } = await params;

    await WorkflowService.delete(workflowId);

    return successResponse(null, "Workflow deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

