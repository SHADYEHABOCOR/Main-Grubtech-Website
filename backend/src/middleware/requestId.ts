/**
 * Request ID Middleware
 *
 * Generates a unique ID for each request to enable:
 * - Request correlation in logs
 * - Distributed tracing across services
 * - Debugging and error tracking
 *
 * The request ID is:
 * - Generated if not present in headers
 * - Passed through if received (for distributed tracing)
 * - Added to response headers for client-side correlation
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      requestId: string;
      startTime: number;
    }
  }
}

/**
 * Request ID middleware
 * Generates unique ID for request tracking and logging
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Use existing request ID from header (for distributed tracing) or generate new one
  const requestId = (req.headers['x-request-id'] as string) || uuidv4();

  // Attach to request object
  req.requestId = requestId;
  req.startTime = Date.now();

  // Add to response headers
  res.setHeader('X-Request-ID', requestId);

  next();
}

/**
 * Request duration helper
 */
export function getRequestDuration(req: Request): number {
  return Date.now() - (req.startTime || Date.now());
}

export default requestIdMiddleware;
