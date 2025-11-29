import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/utils";
import { BoardService } from "@/services/board.service";
import { updateBoardColumnSchema } from "@/lib/validators/board";
import { validateRequest, getRequestBody } from "@/lib/api/middleware";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string; columnId: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const { columnId } = await params;

    const body = await getRequestBody(request);
    if (!body) {
      return errorResponse("Request body is required", 400);
    }

    const validation = validateRequest(body, updateBoardColumnSchema.parse);
    if (!validation.valid) {
      return errorResponse(validation.error, 400);
    }

    const column = await BoardService.updateColumn(columnId, validation.data);
    if (!column) {
      return errorResponse("Column not found", 404);
    }

    return successResponse(column, "Column updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

