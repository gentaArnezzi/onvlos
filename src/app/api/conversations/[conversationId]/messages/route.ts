import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse, errorResponse, handleApiError, parsePaginationParams } from "@/lib/api/utils";
import { MessageService } from "@/services/message.service";
import { createMessageSchema } from "@/lib/validators/message";
import { validateRequest, getRequestBody } from "@/lib/api/middleware";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const { conversationId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const pagination = parsePaginationParams(searchParams);

    const messages = await MessageService.getMessages(conversationId, {
      limit: pagination.limit,
      offset: pagination.offset,
    });

    return successResponse(messages);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;
    const { conversationId } = await params;

    const body = await getRequestBody(request);
    if (!body) {
      return errorResponse("Request body is required", 400);
    }

    const validation = validateRequest(body, createMessageSchema.parse);
    if (!validation.valid) {
      return errorResponse(validation.error, 400);
    }

    const message = await MessageService.createMessage({
      ...validation.data,
      conversation_id: conversationId,
      user_id: user.id,
    });

    return successResponse(message, "Message sent successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}

