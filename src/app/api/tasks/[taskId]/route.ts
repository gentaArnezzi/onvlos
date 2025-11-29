import { NextRequest } from "next/server";
import { requireAuth, extractWorkspaceId } from "@/lib/api/middleware";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/utils";
import { TaskService } from "@/services/task.service";
import { updateTaskSchema } from "@/lib/validators/task";
import { validateRequest, getRequestBody } from "@/lib/api/middleware";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const { taskId } = await params;
    const workspaceId = extractWorkspaceId(request);

    const task = await TaskService.getById(taskId, workspaceId || undefined);
    if (!task) {
      return errorResponse("Task not found", 404);
    }

    return successResponse(task);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const { taskId } = await params;

    const body = await getRequestBody(request);
    if (!body) {
      return errorResponse("Request body is required", 400);
    }

    const validation = validateRequest(body, updateTaskSchema.parse);
    if (!validation.valid) {
      return errorResponse(validation.error, 400);
    }

    const task = await TaskService.update(taskId, validation.data);
    if (!task) {
      return errorResponse("Task not found", 404);
    }

    return successResponse(task, "Task updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const { taskId } = await params;

    await TaskService.delete(taskId);

    return successResponse(null, "Task deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

