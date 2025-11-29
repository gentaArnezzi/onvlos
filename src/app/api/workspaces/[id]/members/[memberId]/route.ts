import { NextRequest } from "next/server";
import { requireWorkspaceAccess } from "@/lib/api/middleware";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/utils";
import { WorkspaceService } from "@/services/workspace.service";
import { updateWorkspaceMemberSchema } from "@/lib/validators/workspace";
import { validateRequest, getRequestBody } from "@/lib/api/middleware";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const { id, memberId } = await params;
    const authResult = await requireWorkspaceAccess(request, id, "admin");
    if (authResult instanceof Response) return authResult;

    const body = await getRequestBody(request);
    if (!body) {
      return errorResponse("Request body is required", 400);
    }

    const validation = validateRequest(body, updateWorkspaceMemberSchema.parse);
    if (!validation.valid) {
      return errorResponse(validation.error, 400);
    }

    const member = await WorkspaceService.updateMember(id, memberId, validation.data);
    if (!member) {
      return errorResponse("Member not found", 404);
    }

    return successResponse(member, "Member updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const { id, memberId } = await params;
    const authResult = await requireWorkspaceAccess(request, id, "admin");
    if (authResult instanceof Response) return authResult;

    await WorkspaceService.removeMember(id, memberId);

    return successResponse(null, "Member removed successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

