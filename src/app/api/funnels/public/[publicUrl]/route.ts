import { NextRequest } from "next/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/utils";
import { FunnelService } from "@/services/funnel.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicUrl: string }> }
) {
  try {
    const { publicUrl } = await params;

    const funnel = await FunnelService.getByPublicUrl(publicUrl);
    if (!funnel) {
      return errorResponse("Funnel not found", 404);
    }

    return successResponse(funnel);
  } catch (error) {
    return handleApiError(error);
  }
}

