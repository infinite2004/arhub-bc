import { NextResponse } from "next/server";
import { AppError, ValidationError, AuthenticationError, AuthorizationError, NotFoundError } from "@/types";

// Standard API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  path: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Success response helpers
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    path: "/api", // This will be overridden by the actual path
  };

  return NextResponse.json(response, { status });
}

export function createdResponse<T>(
  data: T,
  message?: string
): NextResponse<ApiResponse<T>> {
  return successResponse(data, message, 201);
}

export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): NextResponse<PaginatedResponse<T>> {
  const totalPages = Math.ceil(total / limit);
  
  const response: PaginatedResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    path: "/api",
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };

  return NextResponse.json(response, { status: 200 });
}

// Error response helpers
export function errorResponse(
  error: Error | string,
  status: number = 500,
  path: string = "/api"
): NextResponse<ApiResponse<never>> {
  const message = typeof error === "string" ? error : error.message;
  
  const response: ApiResponse<never> = {
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
    path,
  };

  return NextResponse.json(response, { status });
}

export function badRequestResponse(
  error: Error | string,
  path?: string
): NextResponse<ApiResponse<never>> {
  return errorResponse(error, 400, path);
}

export function unauthorizedResponse(
  error: Error | string = "Unauthorized",
  path?: string
): NextResponse<ApiResponse<never>> {
  return errorResponse(error, 401, path);
}

export function forbiddenResponse(
  error: Error | string = "Forbidden",
  path?: string
): NextResponse<ApiResponse<never>> {
  return errorResponse(error, 403, path);
}

export function notFoundResponse(
  error: Error | string = "Not found",
  path?: string
): NextResponse<ApiResponse<never>> {
  return errorResponse(error, 404, path);
}

export function conflictResponse(
  error: Error | string,
  path?: string
): NextResponse<ApiResponse<never>> {
  return errorResponse(error, 409, path);
}

export function tooManyRequestsResponse(
  error: Error | string = "Too many requests",
  path?: string
): NextResponse<ApiResponse<never>> {
  return errorResponse(error, 429, path);
}

export function internalServerErrorResponse(
  error: Error | string = "Internal server error",
  path?: string
): NextResponse<ApiResponse<never>> {
  return errorResponse(error, 500, path);
}

// Validation error response
export function validationErrorResponse(
  errors: Record<string, string[]>,
  path?: string
): NextResponse<ApiResponse<never>> {
  const response: ApiResponse<never> = {
    success: false,
    error: "Validation failed",
    message: "Please check your input and try again",
    timestamp: new Date().toISOString(),
    path: path || "/api",
  };

  return NextResponse.json(response, { status: 400 });
}

// Handle different types of errors
export function handleApiError(
  error: unknown,
  path: string = "/api"
): NextResponse<ApiResponse<never>> {
  console.error("API Error:", error);

  // Handle known error types
  if (error instanceof ValidationError) {
    return badRequestResponse(error.message, path);
  }

  if (error instanceof AuthenticationError) {
    return unauthorizedResponse(error.message, path);
  }

  if (error instanceof AuthorizationError) {
    return forbiddenResponse(error.message, path);
  }

  if (error instanceof NotFoundError) {
    return notFoundResponse(error.message, path);
  }

  if (error instanceof AppError) {
    return errorResponse(error.message, error.statusCode, path);
  }

  // Handle Prisma errors
  if (error && typeof error === "object" && "code" in error) {
    const prismaError = error as any;
    
    switch (prismaError.code) {
      case "P2002":
        return conflictResponse("Resource already exists", path);
      case "P2025":
        return notFoundResponse("Resource not found", path);
      case "P2003":
        return badRequestResponse("Invalid reference", path);
      default:
        return internalServerErrorResponse("Database operation failed", path);
    }
  }

  // Handle Zod validation errors
  if (error && typeof error === "object" && "issues" in error) {
    const zodError = error as any;
    const fieldErrors: Record<string, string[]> = {};
    
    zodError.issues.forEach((issue: any) => {
      const field = issue.path.join(".");
      if (!fieldErrors[field]) {
        fieldErrors[field] = [];
      }
      fieldErrors[field].push(issue.message);
    });
    
    return validationErrorResponse(fieldErrors, path);
  }

  // Generic error
  return internalServerErrorResponse(
    error instanceof Error ? error.message : "An unexpected error occurred",
    path
  );
}

// API handler wrapper for better error handling
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  path?: string
) {
  return async (...args: T): Promise<NextResponse<ApiResponse<any>>> => {
    try {
      const result = await handler(...args);
      
      if (result instanceof NextResponse) {
        return result;
      }
      
      return successResponse(result);
    } catch (error) {
      return handleApiError(error, path);
    }
  };
}

// Rate limiting helper
export function createRateLimiter(
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
) {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return function isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const userRequests = requests.get(identifier);

    if (!userRequests || now > userRequests.resetTime) {
      requests.set(identifier, { count: 1, resetTime: now + windowMs });
      return false;
    }

    if (userRequests.count >= maxRequests) {
      return true;
    }

    userRequests.count++;
    return false;
  };
}

// Request logging middleware
export function logRequest(req: Request, responseTime: number) {
  const method = req.method;
  const url = req.url;
  const userAgent = req.headers.get("user-agent") || "Unknown";
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "Unknown";
  
  console.log(
    `${method} ${url} - ${responseTime}ms - ${ip} - ${userAgent}`
  );
}

// Response time middleware
export function withResponseTime<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const start = Date.now();
    try {
      const result = await handler(...args);
      const responseTime = Date.now() - start;
      
      // Log response time
      if (args[0] instanceof Request) {
        logRequest(args[0], responseTime);
      }
      
      return result;
    } catch (error) {
      const responseTime = Date.now() - start;
      
      if (args[0] instanceof Request) {
        logRequest(args[0], responseTime);
      }
      
      throw error;
    }
  };
}
