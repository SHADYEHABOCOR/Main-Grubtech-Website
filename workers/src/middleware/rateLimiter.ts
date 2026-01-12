/**
 * KV-Based Rate Limiter Middleware for Cloudflare Workers
 *
 * This module provides rate limiting middleware using Cloudflare KV namespace
 * to protect against common web attacks including brute force, spam, and API abuse.
 *
 * SECURITY RATIONALE - Rate Limiting Always Active:
 * ===================================================
 * All rate limiters in this module are ALWAYS active, regardless of environment.
 * This is intentional for the following reasons:
 *
 * 1. Environment Consistency: Developers test against the same security behavior
 *    they'll see in production, catching rate-limiting issues early.
 *
 * 2. Misconfiguration Protection: If ENVIRONMENT is misconfigured or left unset in
 *    production, rate limiting won't be accidentally disabled.
 *
 * 3. Developer Experience: Instead of disabling rate limiting in development,
 *    we use HIGHER limits via environment variables. This maintains security
 *    while providing a better developer experience.
 *
 * IMPLEMENTATION NOTES:
 * ====================
 * - Uses Cloudflare KV with expirationTtl for automatic cleanup
 * - Each rate limit entry stores: { count: number, firstRequest: number }
 * - Keys follow pattern: ratelimit:{type}:{ip}
 * - TTL-based expiration eliminates need for manual cleanup
 */

import type { Context, Next, MiddlewareHandler } from 'hono';
import type { Env, Variables } from '../types/bindings';

type AppContext = Context<{ Bindings: Env; Variables: Variables }>;

/**
 * Rate limit record stored in KV
 */
interface RateLimitRecord {
  count: number;
  firstRequest: number;
}

/**
 * Rate limiter configuration options
 */
export interface RateLimiterOptions {
  /** Rate limiter type identifier (used in KV key prefix) */
  type: string;
  /** Time window in milliseconds */
  windowMs: number;
  /** Maximum requests allowed within the window */
  max: number;
  /** Error message returned when rate limited */
  message: string;
  /** Skip counting successful requests (status < 400) */
  skipSuccessfulRequests?: boolean;
  /** Custom handler for rate limit exceeded (optional) */
  handler?: (c: AppContext, remainingTime: number) => Response;
}

/**
 * Get client IP address from request
 * Cloudflare Workers provide the client IP in CF-Connecting-IP header
 */
function getClientIp(c: AppContext): string {
  // Cloudflare provides the actual client IP
  const cfIp = c.req.header('CF-Connecting-IP');
  if (cfIp) return cfIp;

  // Fallback to X-Forwarded-For
  const xff = c.req.header('X-Forwarded-For');
  if (xff) return xff.split(',')[0].trim();

  // Final fallback to X-Real-IP
  const xRealIp = c.req.header('X-Real-IP');
  if (xRealIp) return xRealIp;

  // Unknown client
  return 'unknown';
}

/**
 * Create a KV-based rate limiter middleware
 *
 * @param options - Rate limiter configuration
 * @returns Hono middleware function
 *
 * @example
 * const loginLimiter = createRateLimiter({
 *   type: 'login',
 *   windowMs: 15 * 60 * 1000, // 15 minutes
 *   max: 20,
 *   message: 'Too many login attempts',
 *   skipSuccessfulRequests: true,
 * });
 */
export function createRateLimiter(
  options: RateLimiterOptions
): MiddlewareHandler<{ Bindings: Env; Variables: Variables }> {
  const {
    type,
    windowMs,
    max,
    message,
    skipSuccessfulRequests = false,
    handler,
  } = options;

  // Convert window from ms to seconds for KV TTL
  const windowSeconds = Math.ceil(windowMs / 1000);

  return async (c: AppContext, next: Next) => {
    const ip = getClientIp(c);
    const key = `ratelimit:${type}:${ip}`;
    const cache = c.env.CACHE;
    const now = Date.now();

    try {
      // Get current rate limit record from KV
      const recordJson = await cache.get(key);
      let record: RateLimitRecord;

      if (recordJson) {
        record = JSON.parse(recordJson);

        // Check if the window has expired (should be handled by TTL, but double-check)
        if (now - record.firstRequest >= windowMs) {
          // Window expired, start fresh
          record = { count: 1, firstRequest: now };
        } else {
          record.count += 1;
        }
      } else {
        // No existing record, create new one
        record = { count: 1, firstRequest: now };
      }

      // Calculate remaining time in the window
      const remainingTime = Math.max(0, windowMs - (now - record.firstRequest));
      const remainingTimeSeconds = Math.ceil(remainingTime / 1000);

      // Check if rate limit exceeded
      if (record.count > max) {
        // Set rate limit headers
        const headers = {
          'X-RateLimit-Limit': max.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(
            (record.firstRequest + windowMs) / 1000
          ).toString(),
          'Retry-After': remainingTimeSeconds.toString(),
        };

        // Use custom handler if provided
        if (handler) {
          return handler(c, remainingTime);
        }

        // Return 429 response
        return c.json(
          {
            success: false,
            error: message,
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: remainingTimeSeconds,
          },
          429,
          headers
        );
      }

      // Store updated record with TTL
      await cache.put(key, JSON.stringify(record), {
        expirationTtl: windowSeconds,
      });

      // Set rate limit headers on successful request
      c.header('X-RateLimit-Limit', max.toString());
      c.header('X-RateLimit-Remaining', Math.max(0, max - record.count).toString());
      c.header(
        'X-RateLimit-Reset',
        Math.ceil((record.firstRequest + windowMs) / 1000).toString()
      );

      // Continue to next handler
      await next();

      // If skipSuccessfulRequests is enabled and request was successful,
      // decrement the count
      if (skipSuccessfulRequests && c.res.status < 400) {
        record.count = Math.max(0, record.count - 1);
        await cache.put(key, JSON.stringify(record), {
          expirationTtl: windowSeconds,
        });
      }
    } catch (error) {
      // On KV errors, log and continue (fail open to avoid blocking legitimate users)
      // In production, you might want to fail closed instead
      await next();
    }
  };
}

// =============================================================================
// Pre-configured Rate Limiters
// =============================================================================

/**
 * Default rate limit values
 * These can be overridden via environment variables
 */
const DEFAULTS = {
  // Login rate limiter
  LOGIN_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  LOGIN_MAX_PRODUCTION: 20,
  LOGIN_MAX_DEVELOPMENT: 100,

  // API rate limiter
  API_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  API_MAX_PRODUCTION: 1000,
  API_MAX_DEVELOPMENT: 5000,

  // Analytics rate limiter
  ANALYTICS_WINDOW_MS: 60 * 1000, // 1 minute
  ANALYTICS_MAX_PRODUCTION: 500,
  ANALYTICS_MAX_DEVELOPMENT: 2000,

  // Lead form rate limiter
  LEAD_WINDOW_MS: 60 * 60 * 1000, // 1 hour
  LEAD_MAX_PRODUCTION: 10,
  LEAD_MAX_DEVELOPMENT: 50,

  // Setup rate limiter
  SETUP_WINDOW_MS: 60 * 60 * 1000, // 1 hour
  SETUP_MAX: 5,
};

/**
 * Get environment-aware max requests value
 */
function getMaxRequests(env: Env, productionMax: number, developmentMax: number): number {
  const customMax = parseInt(env.RATE_LIMIT_MAX_REQUESTS, 10);
  if (!isNaN(customMax) && customMax > 0) {
    return customMax;
  }
  return env.ENVIRONMENT === 'production' ? productionMax : developmentMax;
}

/**
 * Get window duration from environment or default
 */
function getWindowMs(env: Env, defaultMs: number): number {
  const customWindow = parseInt(env.RATE_LIMIT_WINDOW_MS, 10);
  if (!isNaN(customWindow) && customWindow > 0) {
    return customWindow;
  }
  return defaultMs;
}

/**
 * Login Rate Limiter - Prevents Brute Force Attacks
 *
 * Protects authentication endpoints from credential stuffing and brute force attacks
 * by limiting the number of login attempts from a single IP address.
 *
 * CONFIGURATION:
 * - Window: 15 minutes
 * - Max Attempts: 20 (production), 100 (development)
 * - Skips successful logins (only counts failed attempts)
 */
export function loginRateLimiter(): MiddlewareHandler<{ Bindings: Env; Variables: Variables }> {
  return async (c: AppContext, next: Next) => {
    const limiter = createRateLimiter({
      type: 'login',
      windowMs: getWindowMs(c.env, DEFAULTS.LOGIN_WINDOW_MS),
      max: getMaxRequests(
        c.env,
        DEFAULTS.LOGIN_MAX_PRODUCTION,
        DEFAULTS.LOGIN_MAX_DEVELOPMENT
      ),
      message: 'Too many login attempts from this IP, please try again after 15 minutes',
      skipSuccessfulRequests: true,
    });
    return limiter(c, next);
  };
}

/**
 * Lead Form Rate Limiter - Prevents Spam Submissions
 *
 * Protects lead generation and contact form endpoints from spam and abuse
 * by limiting the number of form submissions from a single IP address.
 *
 * CONFIGURATION:
 * - Window: 1 hour
 * - Max Submissions: 10 (production), 50 (development)
 */
export function leadRateLimiter(): MiddlewareHandler<{ Bindings: Env; Variables: Variables }> {
  return async (c: AppContext, next: Next) => {
    const limiter = createRateLimiter({
      type: 'lead',
      windowMs: getWindowMs(c.env, DEFAULTS.LEAD_WINDOW_MS),
      max: getMaxRequests(c.env, DEFAULTS.LEAD_MAX_PRODUCTION, DEFAULTS.LEAD_MAX_DEVELOPMENT),
      message: 'Too many form submissions from this IP, please try again later',
    });
    return limiter(c, next);
  };
}

/**
 * General API Rate Limiter - Prevents API Abuse
 *
 * Provides general protection for API endpoints against abuse, automated scraping,
 * and denial-of-service attacks by limiting the total number of requests from a
 * single IP address.
 *
 * CONFIGURATION:
 * - Window: 15 minutes
 * - Max Requests: 1000 (production), 5000 (development)
 */
export function apiRateLimiter(): MiddlewareHandler<{ Bindings: Env; Variables: Variables }> {
  return async (c: AppContext, next: Next) => {
    const limiter = createRateLimiter({
      type: 'api',
      windowMs: getWindowMs(c.env, DEFAULTS.API_WINDOW_MS),
      max: getMaxRequests(c.env, DEFAULTS.API_MAX_PRODUCTION, DEFAULTS.API_MAX_DEVELOPMENT),
      message: 'Too many requests from this IP, please try again later',
    });
    return limiter(c, next);
  };
}

/**
 * Analytics Rate Limiter - Prevents Tracking Abuse
 *
 * Protects analytics and tracking endpoints from abuse while allowing legitimate
 * automatic page view and event tracking. Has the highest limits since analytics
 * tracking can generate many requests during normal browsing.
 *
 * CONFIGURATION:
 * - Window: 1 minute
 * - Max Requests: 500 (production), 2000 (development)
 */
export function analyticsRateLimiter(): MiddlewareHandler<{ Bindings: Env; Variables: Variables }> {
  return async (c: AppContext, next: Next) => {
    const limiter = createRateLimiter({
      type: 'analytics',
      windowMs: getWindowMs(c.env, DEFAULTS.ANALYTICS_WINDOW_MS),
      max: getMaxRequests(
        c.env,
        DEFAULTS.ANALYTICS_MAX_PRODUCTION,
        DEFAULTS.ANALYTICS_MAX_DEVELOPMENT
      ),
      message: 'Too many analytics requests, please slow down',
    });
    return limiter(c, next);
  };
}

/**
 * Setup Rate Limiter - Prevents Setup Admin Endpoint Token Brute-Forcing
 *
 * Strict rate limiter for the setup admin endpoint to prevent token brute-force attacks.
 * This endpoint is critical and should be heavily protected since it allows initial admin creation.
 *
 * CONFIGURATION:
 * - Window: 1 hour
 * - Max Attempts: 5 (same for all environments)
 */
export function setupRateLimiter(): MiddlewareHandler<{ Bindings: Env; Variables: Variables }> {
  return async (c: AppContext, next: Next) => {
    const limiter = createRateLimiter({
      type: 'setup',
      windowMs: DEFAULTS.SETUP_WINDOW_MS,
      max: DEFAULTS.SETUP_MAX,
      message: 'Too many setup attempts from this IP, please try again after an hour',
      handler: (ctx, remainingTime) => {
        const remainingMinutes = Math.ceil(remainingTime / 60000);
        return ctx.json(
          {
            success: false,
            error: 'Too many setup attempts from this IP, please try again after an hour',
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: Math.ceil(remainingTime / 1000),
          },
          429
        );
      },
    });
    return limiter(c, next);
  };
}

/**
 * Custom rate limiter factory for specialized endpoints
 *
 * @example
 * // Create a custom rate limiter for file uploads
 * app.post('/api/upload', customRateLimiter({
 *   type: 'upload',
 *   windowMs: 60 * 60 * 1000, // 1 hour
 *   max: 50,
 *   message: 'Upload limit reached, try again later',
 * }), uploadHandler);
 */
export function customRateLimiter(
  options: RateLimiterOptions
): MiddlewareHandler<{ Bindings: Env; Variables: Variables }> {
  return createRateLimiter(options);
}
