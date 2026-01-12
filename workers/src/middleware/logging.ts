/**
 * Request Logging Middleware for Cloudflare Workers
 *
 * This module provides structured JSON logging middleware for request/response
 * tracking, performance monitoring, and debugging.
 *
 * Features:
 * - Structured JSON log format for easy parsing and analysis
 * - Request ID generation for request tracing
 * - Response timing measurement
 * - Cloudflare-specific headers extraction (ray ID, colo, country)
 * - Configurable log levels
 * - Sensitive data redaction
 *
 * IMPLEMENTATION NOTES:
 * ====================
 * - Uses console.log for output (Cloudflare Workers log to dashboard and tail)
 * - Sets requestId and startTime in context variables for downstream middleware
 * - Uses JSON.stringify for structured output
 * - Respects LOG_LEVEL environment variable
 */

import type { Context, Next, MiddlewareHandler } from 'hono';
import type { Env, Variables } from '../types/bindings';

type AppContext = Context<{ Bindings: Env; Variables: Variables }>;

/**
 * Log levels in order of severity
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Structured log entry format
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  requestId: string;
  method: string;
  path: string;
  status?: number;
  duration?: number;
  ip?: string;
  userAgent?: string;
  referer?: string;
  contentLength?: number;
  contentType?: string;
  userId?: string;
  error?: string;
  errorStack?: string;
  cf?: {
    rayId?: string;
    colo?: string;
    country?: string;
  };
  [key: string]: unknown;
}

/**
 * Logger options
 */
export interface LoggerOptions {
  /** Minimum log level to output */
  level?: LogLevel;
  /** Include Cloudflare-specific metadata */
  includeCfMetadata?: boolean;
  /** Include request headers (redacted) */
  includeHeaders?: boolean;
  /** Custom fields to include in every log entry */
  defaultFields?: Record<string, unknown>;
  /** List of paths to exclude from logging (e.g., health checks) */
  excludePaths?: string[];
  /** Skip logging for successful responses (2xx) */
  skipSuccessful?: boolean;
}

/**
 * Headers to redact for security
 */
const REDACTED_HEADERS = [
  'authorization',
  'cookie',
  'set-cookie',
  'x-api-key',
  'x-auth-token',
];

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = crypto.randomUUID().split('-')[0];
  return `req_${timestamp}_${randomPart}`;
}

/**
 * Get client IP address from Cloudflare headers
 */
function getClientIp(c: AppContext): string {
  return (
    c.req.header('CF-Connecting-IP') ||
    c.req.header('X-Forwarded-For')?.split(',')[0].trim() ||
    c.req.header('X-Real-IP') ||
    'unknown'
  );
}

/**
 * Get Cloudflare-specific request metadata
 */
function getCfMetadata(c: AppContext): LogEntry['cf'] {
  return {
    rayId: c.req.header('CF-Ray'),
    colo: c.req.header('CF-IPCountry') ? undefined : undefined, // colo from cf object if available
    country: c.req.header('CF-IPCountry'),
  };
}

/**
 * Redact sensitive header values
 */
function redactHeaders(
  headers: Record<string, string>
): Record<string, string> {
  const redacted: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (REDACTED_HEADERS.includes(key.toLowerCase())) {
      redacted[key] = '[REDACTED]';
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
}

/**
 * Check if current log level should output
 */
function shouldLog(currentLevel: LogLevel, messageLevel: LogLevel): boolean {
  return LOG_LEVELS[messageLevel] >= LOG_LEVELS[currentLevel];
}

/**
 * Parse log level from environment variable
 */
function parseLogLevel(level: string | undefined): LogLevel {
  const normalized = level?.toLowerCase();
  if (normalized && normalized in LOG_LEVELS) {
    return normalized as LogLevel;
  }
  return 'info';
}

/**
 * Create a structured log entry and output to console
 */
export function log(
  level: LogLevel,
  entry: Partial<LogEntry>,
  configuredLevel: LogLevel = 'info'
): void {
  if (!shouldLog(configuredLevel, level)) {
    return;
  }

  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    requestId: entry.requestId || 'unknown',
    method: entry.method || 'UNKNOWN',
    path: entry.path || '/',
    ...entry,
  };

  // Output as structured JSON
  const output = JSON.stringify(logEntry);

  switch (level) {
    case 'error':
      console.error(output);
      break;
    case 'warn':
      console.warn(output);
      break;
    case 'debug':
      console.debug(output);
      break;
    default:
      console.log(output);
  }
}

/**
 * Create a logger instance bound to a request context
 */
export function createRequestLogger(
  requestId: string,
  method: string,
  path: string,
  configuredLevel: LogLevel = 'info'
) {
  const baseEntry = { requestId, method, path };

  return {
    debug: (message: string, extra?: Record<string, unknown>) =>
      log('debug', { ...baseEntry, message, ...extra }, configuredLevel),
    info: (message: string, extra?: Record<string, unknown>) =>
      log('info', { ...baseEntry, message, ...extra }, configuredLevel),
    warn: (message: string, extra?: Record<string, unknown>) =>
      log('warn', { ...baseEntry, message, ...extra }, configuredLevel),
    error: (message: string, error?: Error, extra?: Record<string, unknown>) =>
      log(
        'error',
        {
          ...baseEntry,
          message,
          error: error?.message,
          errorStack: error?.stack,
          ...extra,
        },
        configuredLevel
      ),
  };
}

/**
 * Request logging middleware
 *
 * Logs all incoming requests and their responses with timing information.
 * Sets requestId and startTime in context for use by downstream handlers.
 *
 * @param options - Logger configuration options
 * @returns Hono middleware function
 *
 * @example
 * // Basic usage
 * app.use('*', requestLogger());
 *
 * // With options
 * app.use('*', requestLogger({
 *   level: 'debug',
 *   includeCfMetadata: true,
 *   excludePaths: ['/api/health'],
 * }));
 */
export function requestLogger(
  options: LoggerOptions = {}
): MiddlewareHandler<{ Bindings: Env; Variables: Variables }> {
  const {
    includeCfMetadata = true,
    includeHeaders = false,
    defaultFields = {},
    excludePaths = ['/api/health', '/health', '/favicon.ico'],
    skipSuccessful = false,
  } = options;

  return async (c: AppContext, next: Next) => {
    const startTime = Date.now();
    const requestId = generateRequestId();
    const method = c.req.method;
    const path = c.req.path;
    const url = new URL(c.req.url);

    // Set context variables for downstream handlers
    c.set('requestId', requestId);
    c.set('startTime', startTime);

    // Check if path should be excluded from logging
    if (excludePaths.some((p) => path === p || path.startsWith(p))) {
      await next();
      return;
    }

    // Get configured log level from environment
    const logLevel = parseLogLevel(c.env.LOG_LEVEL);

    // Build request log entry
    const requestEntry: Partial<LogEntry> = {
      requestId,
      method,
      path,
      ip: getClientIp(c),
      userAgent: c.req.header('User-Agent'),
      referer: c.req.header('Referer'),
      contentType: c.req.header('Content-Type'),
      contentLength: parseInt(c.req.header('Content-Length') || '0', 10) || undefined,
      ...defaultFields,
    };

    // Add Cloudflare metadata if enabled
    if (includeCfMetadata) {
      requestEntry.cf = getCfMetadata(c);
    }

    // Add redacted headers if enabled
    if (includeHeaders) {
      const headers: Record<string, string> = {};
      c.req.raw.headers.forEach((value, key) => {
        headers[key] = value;
      });
      requestEntry.headers = redactHeaders(headers);
    }

    // Log incoming request at debug level
    log('debug', { ...requestEntry, message: 'Request received' }, logLevel);

    try {
      // Process request
      await next();

      // Calculate duration
      const duration = Date.now() - startTime;
      const status = c.res.status;

      // Skip logging successful responses if configured
      if (skipSuccessful && status >= 200 && status < 300) {
        return;
      }

      // Get user ID if authenticated
      const user = c.get('user');
      const userId = user?.userId || user?.id;

      // Build response log entry
      const responseEntry: Partial<LogEntry> = {
        ...requestEntry,
        status,
        duration,
        userId: userId as string | undefined,
        message: 'Request completed',
      };

      // Determine log level based on status code
      let responseLevel: LogLevel = 'info';
      if (status >= 500) {
        responseLevel = 'error';
      } else if (status >= 400) {
        responseLevel = 'warn';
      }

      log(responseLevel, responseEntry, logLevel);
    } catch (error) {
      // Calculate duration even on error
      const duration = Date.now() - startTime;

      // Log error
      log(
        'error',
        {
          ...requestEntry,
          duration,
          error: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined,
          message: 'Request failed with exception',
        },
        logLevel
      );

      // Re-throw to allow error handling middleware to process
      throw error;
    }
  };
}

/**
 * Simple access log format middleware
 *
 * Outputs a single line per request in combined log format style.
 * Lighter weight than the full requestLogger.
 *
 * @example
 * app.use('*', accessLog());
 */
export function accessLog(): MiddlewareHandler<{ Bindings: Env; Variables: Variables }> {
  return async (c: AppContext, next: Next) => {
    const startTime = Date.now();
    const requestId = generateRequestId();

    c.set('requestId', requestId);
    c.set('startTime', startTime);

    await next();

    const duration = Date.now() - startTime;
    const ip = getClientIp(c);
    const method = c.req.method;
    const path = c.req.path;
    const status = c.res.status;
    const userAgent = c.req.header('User-Agent') || '-';

    // Combined log format style output as JSON
    const logLine = JSON.stringify({
      timestamp: new Date().toISOString(),
      requestId,
      ip,
      method,
      path,
      status,
      duration,
      userAgent,
    });

    if (status >= 500) {
      console.error(logLine);
    } else if (status >= 400) {
      console.warn(logLine);
    } else {
      console.log(logLine);
    }
  };
}

/**
 * Error logging utility for use in error handlers
 *
 * @example
 * app.onError((err, c) => {
 *   logError(c, err);
 *   return c.json({ error: 'Internal server error' }, 500);
 * });
 */
export function logError(c: AppContext, error: Error): void {
  const requestId = c.get('requestId') || 'unknown';
  const startTime = c.get('startTime');
  const duration = startTime ? Date.now() - startTime : undefined;

  log('error', {
    requestId,
    method: c.req.method,
    path: c.req.path,
    duration,
    error: error.message,
    errorStack: error.stack,
    ip: getClientIp(c),
    message: 'Unhandled error',
  });
}

/**
 * Audit logging for sensitive operations
 *
 * Use this for logging administrative actions, authentication events,
 * and other security-relevant operations.
 *
 * @example
 * auditLog(c, 'user.login', { userId: user.id });
 * auditLog(c, 'admin.delete_user', { targetUserId: '123' });
 */
export function auditLog(
  c: AppContext,
  action: string,
  details: Record<string, unknown> = {}
): void {
  const requestId = c.get('requestId') || 'unknown';
  const user = c.get('user');

  const auditEntry = JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    type: 'audit',
    requestId,
    action,
    userId: user?.userId || user?.id || 'anonymous',
    ip: getClientIp(c),
    userAgent: c.req.header('User-Agent'),
    ...details,
  });

  console.log(auditEntry);
}
