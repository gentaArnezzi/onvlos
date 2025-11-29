import { NextRequest } from "next/server";
import { requireAuth, extractWorkspaceId } from "@/lib/api/middleware";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/utils";
import { BoardService } from "@/services/board.service";
import { updateBoardSchema } from "@/lib/validators/board";
import { validateRequest, getRequestBody } from "@/lib/api/middleware";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const { boardId } = await params;
    const workspaceId = extractWorkspaceId(request);

    const board = await BoardService.getById(boardId, workspaceId || undefined);
    if (!board) {
      return errorResponse("Board not found", 404);
    }

    return successResponse(board);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const { boardId } = await params;
    const workspaceId = extractWorkspaceId(request);

    const body = await getRequestBody(request);
    if (!body) {
      return errorResponse("Request body is required", 400);
    }

    const validation = validateRequest(body, updateBoardSchema.parse);
    if (!validation.valid) {
      return errorResponse(validation.error, 400);
    }

    const board = await BoardService.update(boardId, validation.data, workspaceId || undefined);
    if (!board) {
      return errorResponse("Board not found", 404);
    }

    return successResponse(board, "Board updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const { boardId } = await params;
    const workspaceId = extractWorkspaceId(request);

    await BoardService.delete(boardId, workspaceId || undefined);

    return successResponse(null, "Board deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

