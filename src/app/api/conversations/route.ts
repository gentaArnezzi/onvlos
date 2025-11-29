import { NextRequest } from "next/server";
import { requireAuth, extractWorkspaceId } from "@/lib/api/middleware";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/utils";
import { MessageService } from "@/services/message.service";
import { createConversationSchema } from "@/lib/validators/message";
import { validateRequest, getRequestBody } from "@/lib/api/middleware";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const workspaceId = extractWorkspaceId(request);
    if (!workspaceId) {
      return errorResponse("workspaceId is required", 400);
    }

    const clientSpaceId = request.nextUrl.searchParams.get("client_space_id") || undefined;

    const conversations = await MessageService.getConversationsByWorkspace(
      workspaceId,
      clientSpaceId
    );

    return successResponse(conversations);
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

    const validation = validateRequest(body, createConversationSchema.parse);
    if (!validation.valid) {
      return errorResponse(validation.error, 400);
    }

    const conversation = await MessageService.createConversation(validation.data);

    return successResponse(conversation, "Conversation created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}

