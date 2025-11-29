import { NextRequest } from "next/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/utils";
import { FunnelService } from "@/services/funnel.service";
import { submitFunnelStepSchema } from "@/lib/validators/funnel";
import { validateRequest, getRequestBody } from "@/lib/api/middleware";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ publicUrl: string }> }
) {
  try {
    const { publicUrl } = await params;

    const funnel = await FunnelService.getByPublicUrl(publicUrl);
    if (!funnel) {
      return errorResponse("Funnel not found", 404);
    }

    const body = await getRequestBody(request);
    if (!body) {
      return errorResponse("Request body is required", 400);
    }

    const validation = validateRequest(body, submitFunnelStepSchema.parse);
    if (!validation.valid) {
      return errorResponse(validation.error, 400);
    }

    // TODO: Process funnel step submission
    // This would involve:
    // 1. Creating/updating onboarding session
    // 2. Processing step data (form responses, signature, payment, etc.)
    // 3. Moving to next step or completing funnel
    // 4. Triggering automation actions

    return successResponse(
      { stepCompleted: true, nextStep: null },
      "Step submitted successfully"
    );
  } catch (error) {
    return handleApiError(error);
  }
}


