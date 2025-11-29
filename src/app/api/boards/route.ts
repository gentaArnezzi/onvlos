import { NextRequest } from "next/server";
import { requireAuth, extractWorkspaceId } from "@/lib/api/middleware";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/utils";
import { BoardService } from "@/services/board.service";
import { createBoardSchema } from "@/lib/validators/board";
import { validateRequest, getRequestBody } from "@/lib/api/middleware";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const workspaceId = extractWorkspaceId(request);
    if (!workspaceId) {
      return errorResponse("workspaceId is required", 400);
    }

    const boards = await BoardService.getByWorkspace(workspaceId);

    return successResponse(boards);
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

    const validation = validateRequest(body, createBoardSchema.parse);
    if (!validation.valid) {
      return errorResponse(validation.error, 400);
    }

    const board = await BoardService.create(validation.data);

    return successResponse(board, "Board created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}

