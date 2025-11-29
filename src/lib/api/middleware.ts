import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/get-session";
import { db } from "@/lib/db";
import { workspace_members, workspaces } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { errorResponse } from "./utils";

/**
 * Authentication Middleware
 * Checks if user is authenticated
 */
export async function requireAuth(
  request: NextRequest
): Promise<{ user: { id: string; email: string; name: string } } | NextResponse> {
  const session = await getSession();

  if (!session || !session.user) {
    return errorResponse("Unauthorized", 401);
  }

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name || "",
    },
  };
}

/**
 * Workspace Authorization Middleware
 * Checks if user has access to workspace and returns workspace member info
 */
export async function requireWorkspaceAccess(
  request: NextRequest,
  workspaceId: string,
  requiredRole?: "owner" | "admin" | "member"
): Promise<
  | {
      user: { id: string; email: string; name: string };
      workspaceId: string;
      member: {
        id: string;
        role: string;
        status: string;
      };
    }
  | NextResponse
> {
  // First check authentication
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  // Check if workspace exists
  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);

  if (!workspace) {
    return errorResponse("Workspace not found", 404);
  }

  // Check if user is a member of the workspace
  const [member] = await db
    .select()
    .from(workspace_members)
    .where(
      and(
        eq(workspace_members.workspace_id, workspaceId),
        eq(workspace_members.user_id, user.id)
      )
    )
    .limit(1);

  if (!member) {
    return errorResponse("Access denied: Not a member of this workspace", 403);
  }

  if (member.status !== "active") {
    return errorResponse("Access denied: Workspace membership is not active", 403);
  }

  // Check role if required
  if (requiredRole) {
    const roleHierarchy: Record<string, number> = {
      member: 1,
      admin: 2,
      owner: 3,
    };

    const userRoleLevel = roleHierarchy[member.role] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

    if (userRoleLevel < requiredRoleLevel) {
      return errorResponse(
        `Access denied: Requires ${requiredRole} role or higher`,
        403
      );
    }
  }

  return {
    user,
    workspaceId,
    member: {
      id: member.id,
      role: member.role,
      status: member.status,
    },
  };
}

/**
 * Extract workspace ID from request
 * Supports both query params and path params
 */
export function extractWorkspaceId(request: NextRequest): string | null {
  // Try path params first (e.g., /api/workspaces/:id/clients)
  const pathname = request.nextUrl.pathname;
  const workspaceMatch = pathname.match(/\/workspaces\/([^\/]+)/);
  if (workspaceMatch) {
    return workspaceMatch[1];
  }

  // Try query params
  const workspaceId = request.nextUrl.searchParams.get("workspaceId");
  if (workspaceId) {
    return workspaceId;
  }

  return null;
}

/**
 * CORS Headers
 */
export function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

/**
 * Rate Limiting (Basic implementation)
 * In production, use a proper rate limiting library like @upstash/ratelimit
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000 // 1 minute
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Request Validation Helper
 */
export function validateRequest<T>(
  body: unknown,
  validator: (data: unknown) => T
): { valid: true; data: T } | { valid: false; error: string } {
  try {
    const data = validator(body);
    return { valid: true, data };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Validation failed",
    };
  }
}

/**
 * Extract JSON body from request
 */
export async function getRequestBody<T = any>(
  request: NextRequest
): Promise<T | null> {
  try {
    const body = await request.json();
    return body as T;
  } catch (error) {
    return null;
  }
}

