/**
 * Production-Ready Logging Configuration
 *
 * Uses Winston for structured logging with support for:
 * - Multiple log levels (error, warn, info, http, debug)
 * - JSON format for CloudWatch/ELK parsing
 * - Pretty format for local development
 * - Request correlation IDs
 * - Sensitive data masking
 *
 * AWS Integration:
 * - Logs to stdout in JSON format for CloudWatch Logs agent
 * - Includes metadata for structured querying
 */

import winston from 'winston';
import { env } from './env.js';

// Custom format for masking sensitive data
const maskSensitiveData = winston.format((info) => {
  const sensitiveFields = ['password', 'token', 'secret', 'authorization', 'cookie', 'jwt'];

  const maskValue = (obj: Record<string, unknown>, depth = 0): Record<string, unknown> => {
    if (depth > 5 || typeof obj !== 'object' || obj === null) return obj;

    const masked: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveFields.some(field => lowerKey.includes(field))) {
        masked[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        masked[key] = maskValue(value as Record<string, unknown>, depth + 1);
      } else {
        masked[key] = value;
      }
    }
    return masked;
  };

  if (info.meta && typeof info.meta === 'object') {
    info.meta = maskValue(info.meta as Record<string, unknown>);
  }

  return info;
});

// JSON format for production (CloudWatch compatible)
const jsonFormat = winston.format.combine(
  winston.format.timestamp({ format: 'ISO' }),
  maskSensitiveData(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Pretty format for development
const prettyFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  maskSensitiveData(),
  winston.format.errors({ stack: true }),
  winston.format.colorize(),
  winston.format.printf(({ level, message, timestamp, requestId, ...meta }) => {
    const reqId = requestId ? `[${requestId}]` : '';
    const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
    return `${timestamp} ${level} ${reqId} ${message}${metaStr}`;
  })
);

// Create logger instance
export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: env.LOG_FORMAT === 'json' ? jsonFormat : prettyFormat,
  defaultMeta: {
    service: 'grubtech-api',
    environment: env.NODE_ENV,
  },
  transports: [
    new winston.transports.Console({
      // In production, only log to stdout for CloudWatch
      handleExceptions: true,
      handleRejections: true,
    }),
  ],
  // Don't exit on handled exceptions
  exitOnError: false,
});

// Request logger for HTTP requests
export const httpLogger = {
  /**
   * Log incoming HTTP request
   */
  request: (req: {
    method: string;
    url: string;
    requestId?: string;
    ip?: string;
    userAgent?: string;
  }) => {
    logger.http('Incoming request', {
      requestId: req.requestId,
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.userAgent,
    });
  },

  /**
   * Log HTTP response
   */
  response: (req: {
    method: string;
    url: string;
    requestId?: string;
    statusCode: number;
    duration: number;
  }) => {
    const level = req.statusCode >= 500 ? 'error' : req.statusCode >= 400 ? 'warn' : 'http';
    logger.log(level, 'Request completed', {
      requestId: req.requestId,
      method: req.method,
      url: req.url,
      statusCode: req.statusCode,
      duration: `${req.duration}ms`,
    });
  },
};

// Specialized loggers for different concerns
export const dbLogger = {
  query: (query: string, duration?: number) => {
    if (env.LOG_LEVEL === 'debug') {
      logger.debug('Database query', { query: query.substring(0, 200), duration });
    }
  },
  error: (error: Error, query?: string) => {
    logger.error('Database error', { error: error.message, query: query?.substring(0, 200) });
  },
  connection: (status: 'connected' | 'disconnected' | 'error', details?: string) => {
    logger.info(`Database ${status}`, { details });
  },
};

export const authLogger = {
  loginSuccess: (userId: string, email: string, ip?: string) => {
    logger.info('User login successful', { userId, email, ip });
  },
  loginFailed: (email: string, reason: string, ip?: string) => {
    logger.warn('User login failed', { email, reason, ip });
  },
  tokenRefresh: (userId: string) => {
    logger.debug('Token refreshed', { userId });
  },
  logout: (userId: string) => {
    logger.info('User logout', { userId });
  },
};

export const uploadLogger = {
  success: (filename: string, size: number, type: string) => {
    logger.info('File uploaded', { filename, size, type });
  },
  error: (filename: string, error: string) => {
    logger.error('File upload failed', { filename, error });
  },
  deleted: (filename: string) => {
    logger.info('File deleted', { filename });
  },
};

export const emailLogger = {
  sent: (to: string, subject: string) => {
    logger.info('Email sent', { to, subject });
  },
  failed: (to: string, error: string) => {
    logger.error('Email failed', { to, error });
  },
};

// Export default logger
export default logger;
