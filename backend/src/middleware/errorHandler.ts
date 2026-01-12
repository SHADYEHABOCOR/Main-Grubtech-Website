/**
 * Global Error Handler Middleware
 *
 * Centralized error handling for:
 * - Consistent error response format
 * - Error logging with context
 * - Sensitive data masking
 * - Environment-appropriate error details
 *
 * In production:
 * - Generic error messages to clients
 * - Full details logged server-side
 *
 * In development:
 * - Full error details in response
 * - Stack traces included
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logger.js';
import { apiResponse, ErrorCodes } from '../utils/apiResponse.js';
import { env } from '../config/env.js';

// Custom error class for application errors
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode = 500,
    code: string = ErrorCodes.INTERNAL_ERROR,
    details?: unknown
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.details = details;

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  // Factory methods for common errors
  static badRequest(message: string, details?: unknown): AppError {
    return new AppError(message, 400, ErrorCodes.VALIDATION_ERROR, details);
  }

  static unauthorized(message = 'Authentication required'): AppError {
    return new AppError(message, 401, ErrorCodes.AUTH_REQUIRED);
  }

  static forbidden(message = 'Access denied'): AppError {
    return new AppError(message, 403, ErrorCodes.FORBIDDEN);
  }

  static notFound(resource = 'Resource'): AppError {
    return new AppError(`${resource} not found`, 404, ErrorCodes.NOT_FOUND);
  }

  static conflict(message: string): AppError {
    return new AppError(message, 409, ErrorCodes.CONFLICT);
  }

  static tooManyRequests(message = 'Too many requests'): AppError {
    return new AppError(message, 429, ErrorCodes.RATE_LIMIT_EXCEEDED);
  }

  static internal(message = 'An unexpected error occurred'): AppError {
    return new AppError(message, 500, ErrorCodes.INTERNAL_ERROR);
  }

  static database(message = 'Database error'): AppError {
    return new AppError(message, 500, ErrorCodes.DATABASE_ERROR);
  }
}

/**
 * Error handler middleware
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Get request context for logging
  const context = {
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userId: (req as any).user?.id,
  };

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const validationErrors = err.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    logger.warn('Validation error', { ...context, errors: validationErrors });

    apiResponse(res).error(
      ErrorCodes.VALIDATION_ERROR,
      'Validation failed',
      400,
      validationErrors
    );
    return;
  }

  // Handle AppError (operational errors)
  if (err instanceof AppError) {
    logger.warn('Application error', {
      ...context,
      code: err.code,
      message: err.message,
      statusCode: err.statusCode,
    });

    apiResponse(res).error(
      err.code as any,
      err.message,
      err.statusCode,
      env.NODE_ENV !== 'production' ? err.details : undefined
    );
    return;
  }

  // Handle Multer errors (file uploads)
  if (err.name === 'MulterError') {
    const multerErr = err as any;
    let code: string = ErrorCodes.UPLOAD_FAILED;
    let message = 'File upload failed';

    if (multerErr.code === 'LIMIT_FILE_SIZE') {
      code = ErrorCodes.FILE_TOO_LARGE;
      message = 'File size exceeds limit';
    } else if (multerErr.code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files';
    } else if (multerErr.code === 'LIMIT_UNEXPECTED_FILE') {
      code = ErrorCodes.INVALID_INPUT;
      message = 'Unexpected file field';
    }

    logger.warn('Multer error', { ...context, multerCode: multerErr.code });
    apiResponse(res).error(code, message, 400);
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    logger.warn('JWT error', { ...context, message: err.message });
    apiResponse(res).error(ErrorCodes.AUTH_INVALID_TOKEN, 'Invalid token', 401);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    logger.warn('JWT expired', { ...context });
    apiResponse(res).error(ErrorCodes.AUTH_EXPIRED_TOKEN, 'Token expired', 401);
    return;
  }

  // Handle SQLite/Database errors
  if (err.message?.includes('SQLITE') || err.message?.includes('database')) {
    logger.error('Database error', {
      ...context,
      message: err.message,
      stack: err.stack,
    });

    apiResponse(res).error(
      ErrorCodes.DATABASE_ERROR,
      env.NODE_ENV === 'production' ? 'Database error' : err.message,
      500
    );
    return;
  }

  // Handle unknown errors (programming errors)
  logger.error('Unhandled error', {
    ...context,
    name: err.name,
    message: err.message,
    stack: err.stack,
  });

  apiResponse(res).error(
    ErrorCodes.INTERNAL_ERROR,
    env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
    500,
    env.NODE_ENV !== 'production' ? { stack: err.stack } : undefined
  );
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response): void {
  logger.warn('Route not found', {
    requestId: req.requestId,
    method: req.method,
    url: req.url,
  });

  apiResponse(res).notFound('Endpoint');
}

/**
 * Async route wrapper to catch errors
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export default errorHandler;
