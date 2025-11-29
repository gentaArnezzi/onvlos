import { NextResponse } from "next/server";

/**
 * API Response Helpers
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

export function errorResponse(
  error: string,
  status: number = 400,
  message?: string
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      message,
    },
    { status }
  );
}

/**
 * Pagination Helpers
 */

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function parsePaginationParams(
  searchParams: URLSearchParams
): PaginationParams {
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const offset = (page - 1) * limit;

  return {
    page: Math.max(1, page),
    limit: Math.min(100, Math.max(1, limit)), // Cap at 100
    offset: Math.max(0, offset),
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

/**
 * Query Parameter Parsing
 */

export function parseQueryParams<T extends Record<string, any>>(
  searchParams: URLSearchParams,
  schema: Record<keyof T, (value: string) => any>
): Partial<T> {
  const params: Partial<T> = {};

  for (const [key, parser] of Object.entries(schema)) {
    const value = searchParams.get(key);
    if (value !== null) {
      (params as any)[key] = parser(value);
    }
  }

  return params;
}

/**
 * Common Query Parsers
 */

export const queryParsers = {
  string: (value: string) => value,
  number: (value: string) => parseInt(value, 10),
  boolean: (value: string) => value === "true",
  date: (value: string) => new Date(value),
  array: (value: string) => value.split(",").map((v) => v.trim()),
};

/**
 * Error Handling
 */

export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  console.error("API Error:", error);

  if (error instanceof ApiError) {
    return errorResponse(error.message, error.statusCode);
  }

  if (error instanceof Error) {
    return errorResponse(
      error.message || "An unexpected error occurred",
      500
    );
  }

  return errorResponse("An unexpected error occurred", 500);
}

