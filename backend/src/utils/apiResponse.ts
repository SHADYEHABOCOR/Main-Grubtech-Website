/**
 * Standardized API Response Format
 *
 * All API responses follow this consistent format for:
 * - Predictable client-side handling
 * - Easy error tracking and debugging
 * - Proper HTTP status codes
 * - Request correlation for logging
 *
 * Response Format:
 * {
 *   success: boolean,
 *   data?: T,
 *   error?: {
 *     code: string,
 *     message: string,
 *     details?: any
 *   },
 *   meta?: {
 *     requestId: string,
 *     timestamp: string,
 *     pagination?: PaginationMeta
 *   }
 * }
 */

import { Response } from 'express';

// ============================================
// Types
// ============================================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    requestId?: string;
    timestamp: string;
    pagination?: PaginationMeta;
  };
}

// ============================================
// Error Codes
// ============================================

export const ErrorCodes = {
  // Authentication errors (401)
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_INVALID_TOKEN: 'AUTH_INVALID_TOKEN',
  AUTH_EXPIRED_TOKEN: 'AUTH_EXPIRED_TOKEN',
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',

  // Authorization errors (403)
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // Validation errors (400)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',

  // Resource errors (404)
  NOT_FOUND: 'NOT_FOUND',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',

  // Conflict errors (409)
  CONFLICT: 'CONFLICT',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  ALREADY_EXISTS: 'ALREADY_EXISTS',

  // Rate limiting (429)
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // Server errors (500)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',

  // File upload errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

// ============================================
// Response Builder Class
// ============================================

export class ApiResponseBuilder {
  private res: Response;
  private requestId?: string;

  constructor(res: Response) {
    this.res = res;
    this.requestId = (res.req as any)?.requestId;
  }

  /**
   * Send successful response with data
   */
  success<T>(data: T, statusCode = 200): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      meta: {
        requestId: this.requestId,
        timestamp: new Date().toISOString(),
      },
    };
    return this.res.status(statusCode).json(response);
  }

  /**
   * Send successful response with pagination
   */
  paginated<T>(data: T[], pagination: PaginationMeta, statusCode = 200): Response {
    const response: ApiResponse<T[]> = {
      success: true,
      data,
      meta: {
        requestId: this.requestId,
        timestamp: new Date().toISOString(),
        pagination,
      },
    };
    return this.res.status(statusCode).json(response);
  }

  /**
   * Send created response (201)
   */
  created<T>(data: T): Response {
    return this.success(data, 201);
  }

  /**
   * Send no content response (204)
   */
  noContent(): Response {
    return this.res.status(204).send();
  }

  /**
   * Send error response
   */
  error(code: string, message: string, statusCode = 500, details?: unknown): Response {
    const response: ApiResponse = {
      success: false,
      error: {
        code,
        message,
        details,
      },
      meta: {
        requestId: this.requestId,
        timestamp: new Date().toISOString(),
      },
    };
    return this.res.status(statusCode).json(response);
  }

  // Convenience methods for common errors

  badRequest(message: string, details?: unknown): Response {
    return this.error(ErrorCodes.VALIDATION_ERROR, message, 400, details);
  }

  unauthorized(message = 'Authentication required'): Response {
    return this.error(ErrorCodes.AUTH_REQUIRED, message, 401);
  }

  forbidden(message = 'Access denied'): Response {
    return this.error(ErrorCodes.FORBIDDEN, message, 403);
  }

  notFound(resource = 'Resource'): Response {
    return this.error(ErrorCodes.NOT_FOUND, `${resource} not found`, 404);
  }

  conflict(message: string): Response {
    return this.error(ErrorCodes.CONFLICT, message, 409);
  }

  tooManyRequests(message = 'Too many requests, please try again later'): Response {
    return this.error(ErrorCodes.RATE_LIMIT_EXCEEDED, message, 429);
  }

  internalError(message = 'An unexpected error occurred'): Response {
    return this.error(ErrorCodes.INTERNAL_ERROR, message, 500);
  }
}

// ============================================
// Helper Functions
// ============================================

/**
 * Create response builder from Express response
 */
export function apiResponse(res: Response): ApiResponseBuilder {
  return new ApiResponseBuilder(res);
}

/**
 * Calculate pagination metadata
 */
export function calculatePagination(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Parse pagination query parameters with defaults
 */
export function parsePagination(query: {
  page?: string;
  limit?: string;
}): { page: number; limit: number; offset: number } {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '10', 10)));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

export default apiResponse;
