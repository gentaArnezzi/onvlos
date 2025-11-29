import { NextRequest } from "next/server";
import { requireWorkspaceAccess } from "@/lib/api/middleware";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/utils";
import { WorkspaceService } from "@/services/workspace.service";
import { addWorkspaceMemberSchema } from "@/lib/validators/workspace";
import { validateRequest, getRequestBody } from "@/lib/api/middleware";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authResult = await requireWorkspaceAccess(request, id);
    if (authResult instanceof Response) return authResult;

    const members = await WorkspaceService.getMembers(id);

    return successResponse(members);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authResult = await requireWorkspaceAccess(request, id, "admin");
    if (authResult instanceof Response) return authResult;

    const body = await getRequestBody(request);
    if (!body) {
      return errorResponse("Request body is required", 400);
    }

    const validation = validateRequest(body, addWorkspaceMemberSchema.parse);
    if (!validation.valid) {
      return errorResponse(validation.error, 400);
    }

    const member = await WorkspaceService.addMember(
      id,
      validation.data.user_id,
      validation.data.role
    );

    return successResponse(member, "Member added successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}

