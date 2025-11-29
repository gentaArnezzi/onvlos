import { NextRequest } from "next/server";
import { requireAuth, extractWorkspaceId } from "@/lib/api/middleware";
import { successResponse, errorResponse, handleApiError, parsePaginationParams, createPaginatedResponse } from "@/lib/api/utils";
import { TaskService } from "@/services/task.service";
import { createTaskSchema } from "@/lib/validators/task";
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
    const client_id = searchParams.get("client_id") || undefined;
    const status = searchParams.get("status") || undefined;
    const assignee_id = searchParams.get("assignee_id") || undefined;
    const search = searchParams.get("search") || undefined;

    const tasks = await TaskService.getByWorkspace(workspaceId, {
      client_id,
      status,
      assignee_id,
      search,
      limit: pagination.limit,
      offset: pagination.offset,
    });

    // Get total count
    const allTasks = await TaskService.getByWorkspace(workspaceId, {
      client_id,
      status,
      assignee_id,
      search,
    });
    const total = allTasks.length;

    const response = createPaginatedResponse(tasks, total, pagination.page!, pagination.limit!);

    return successResponse(response);
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

    const validation = validateRequest(body, createTaskSchema.parse);
    if (!validation.valid) {
      return errorResponse(validation.error, 400);
    }

    const task = await TaskService.create({
      ...validation.data,
      created_by_user_id: user.id,
    });

    return successResponse(task, "Task created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}

