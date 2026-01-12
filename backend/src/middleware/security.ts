/**
 * Security Middleware
 *
 * This module provides rate limiting and input sanitization middleware to protect
 * against common web attacks including brute force, spam, and XSS attacks.
 *
 * SECURITY RATIONALE - Rate Limiting Always Active:
 * ===================================================
 * All rate limiters in this module are ALWAYS active, regardless of environment.
 * This is intentional for the following reasons:
 *
 * 1. Environment Consistency: Developers test against the same security behavior
 *    they'll see in production, catching rate-limiting issues early.
 *
 * 2. Misconfiguration Protection: If NODE_ENV is misconfigured or left unset in
 *    production, rate limiting won't be accidentally disabled.
 *
 * 3. Developer Experience: Instead of disabling rate limiting in development,
 *    we use HIGHER limits via environment variables. This maintains security
 *    while providing a better developer experience.
 *
 * CONFIGURATION:
 * ==============
 * Rate limits are configurable via environment variables in env.ts:
 *
 * Login Rate Limiter:
 *   - LOGIN_RATE_LIMIT_WINDOW_MS: Time window in milliseconds (default: 15 minutes)
 *   - LOGIN_RATE_LIMIT_MAX: Max attempts per window (default: 100 dev, 20 prod)
 *
 * API Rate Limiter:
 *   - API_RATE_LIMIT_WINDOW_MS: Time window in milliseconds (default: 15 minutes)
 *   - API_RATE_LIMIT_MAX: Max requests per window (default: 5000 dev, 1000 prod)
 *
 * Analytics Rate Limiter:
 *   - ANALYTICS_RATE_LIMIT_WINDOW_MS: Time window in milliseconds (default: 1 minute)
 *   - ANALYTICS_RATE_LIMIT_MAX: Max requests per window (default: 2000 dev, 500 prod)
 *
 * Lead Form Rate Limiter:
 *   - LEAD_RATE_LIMIT_WINDOW_MS: Time window in milliseconds (default: 1 hour)
 *   - LEAD_RATE_LIMIT_MAX: Max submissions per window (default: 50 dev, 10 prod)
 *
 * Setup Rate Limiter:
 *   - SETUP_RATE_LIMIT_WINDOW_MS: Time window in milliseconds (default: 1 hour)
 *   - SETUP_RATE_LIMIT_MAX: Max setup attempts per window (default: 5)
 *
 * The defaults are automatically set based on NODE_ENV in env.ts, providing
 * higher limits for development and stricter limits for production.
 */

import rateLimit from 'express-rate-limit';
import validator from 'validator';
import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';

/**
 * Login Rate Limiter - Prevents Brute Force Attacks
 *
 * Protects authentication endpoints from credential stuffing and brute force attacks
 * by limiting the number of login attempts from a single IP address.
 *
 * SECURITY CONSIDERATIONS:
 * - Always active (not skipped in development) to ensure consistent behavior
 * - Skips successful logins to only count failed attempts
 * - Uses IP-based tracking (consider user-based tracking for additional security)
 *
 * CONFIGURATION:
 * - Window: LOGIN_RATE_LIMIT_WINDOW_MS (default: 15 minutes / 900000ms)
 * - Max Attempts: LOGIN_RATE_LIMIT_MAX (default: 100 in dev, 20 in production)
 *
 * PRODUCTION RECOMMENDATIONS:
 * - Set LOGIN_RATE_LIMIT_MAX to 20 or lower
 * - Consider adding account lockout after multiple failures
 * - Monitor for distributed attacks across multiple IPs
 *
 * @example
 * // In your .env file for production:
 * LOGIN_RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
 * LOGIN_RATE_LIMIT_MAX=20            # 20 attempts per 15 minutes
 */
export const loginRateLimiter = rateLimit({
  windowMs: env.LOGIN_RATE_LIMIT_WINDOW_MS,
  max: env.LOGIN_RATE_LIMIT_MAX,
  message: 'Too many login attempts from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins against the limit
});

/**
 * Lead Form Rate Limiter - Prevents Spam Submissions
 *
 * Protects lead generation and contact form endpoints from spam and abuse
 * by limiting the number of form submissions from a single IP address.
 *
 * SECURITY CONSIDERATIONS:
 * - Always active to prevent form spam in all environments
 * - Longer time window (1 hour) to prevent repeated spam throughout the day
 * - Lower max limit since legitimate users rarely submit multiple forms
 *
 * CONFIGURATION:
 * - Window: LEAD_RATE_LIMIT_WINDOW_MS (default: 1 hour / 3600000ms)
 * - Max Submissions: LEAD_RATE_LIMIT_MAX (default: 50 in dev, 10 in production)
 *
 * PRODUCTION RECOMMENDATIONS:
 * - Set LEAD_RATE_LIMIT_MAX to 10 or lower
 * - Consider adding CAPTCHA for additional spam prevention
 * - Monitor submission patterns for suspicious activity
 *
 * @example
 * // In your .env file for production:
 * LEAD_RATE_LIMIT_WINDOW_MS=3600000  # 1 hour
 * LEAD_RATE_LIMIT_MAX=10             # 10 submissions per hour
 */
export const leadRateLimiter = rateLimit({
  windowMs: env.LEAD_RATE_LIMIT_WINDOW_MS,
  max: env.LEAD_RATE_LIMIT_MAX,
  message: 'Too many form submissions from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General API Rate Limiter - Prevents API Abuse
 *
 * Provides general protection for API endpoints against abuse, automated scraping,
 * and denial-of-service attacks by limiting the total number of requests from a
 * single IP address.
 *
 * SECURITY CONSIDERATIONS:
 * - Always active to protect API resources in all environments
 * - Higher limit than login/lead form limiters since APIs may have legitimate high usage
 * - Applied to general API routes (not login or forms which have specific limiters)
 *
 * CONFIGURATION:
 * - Window: API_RATE_LIMIT_WINDOW_MS (default: 15 minutes / 900000ms)
 * - Max Requests: API_RATE_LIMIT_MAX (default: 5000 in dev, 1000 in production)
 *
 * PRODUCTION RECOMMENDATIONS:
 * - Set API_RATE_LIMIT_MAX to 1000 or lower depending on your API usage patterns
 * - Monitor API usage and adjust limits based on legitimate traffic patterns
 * - Consider implementing API keys for authenticated rate limiting
 * - Use response headers to inform clients of their rate limit status
 *
 * @example
 * // In your .env file for production:
 * API_RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
 * API_RATE_LIMIT_MAX=1000          # 1000 requests per 15 minutes
 */
export const apiRateLimiter = rateLimit({
  windowMs: env.API_RATE_LIMIT_WINDOW_MS,
  max: env.API_RATE_LIMIT_MAX,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Analytics Rate Limiter - Prevents Tracking Abuse
 *
 * Protects analytics and tracking endpoints from abuse while allowing legitimate
 * automatic page view and event tracking. Has the highest limits since analytics
 * tracking can generate many requests during normal browsing.
 *
 * SECURITY CONSIDERATIONS:
 * - Always active to prevent analytics endpoint abuse
 * - Very generous limits (shorter window, higher max) to accommodate automatic tracking
 * - Prevents malicious actors from polluting analytics data with spam
 *
 * CONFIGURATION:
 * - Window: ANALYTICS_RATE_LIMIT_WINDOW_MS (default: 1 minute / 60000ms)
 * - Max Requests: ANALYTICS_RATE_LIMIT_MAX (default: 2000 in dev, 500 in production)
 *
 * PRODUCTION RECOMMENDATIONS:
 * - Set ANALYTICS_RATE_LIMIT_MAX to 500 or adjust based on your traffic patterns
 * - Monitor for unusual spikes that might indicate bot traffic
 * - Consider implementing client-side debouncing to reduce tracking requests
 * - Review analytics data quality regularly
 *
 * @example
 * // In your .env file for production:
 * ANALYTICS_RATE_LIMIT_WINDOW_MS=60000  # 1 minute
 * ANALYTICS_RATE_LIMIT_MAX=500          # 500 tracking events per minute
 */
export const analyticsRateLimiter = rateLimit({
  windowMs: env.ANALYTICS_RATE_LIMIT_WINDOW_MS,
  max: env.ANALYTICS_RATE_LIMIT_MAX,
  message: 'Too many analytics requests, please slow down',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Setup Rate Limiter - Prevents Setup Admin Endpoint Token Brute-Forcing
 *
 * Strict rate limiter for the setup admin endpoint to prevent token brute-force attacks.
 * This endpoint is critical and should be heavily protected since it allows initial admin creation.
 *
 * SECURITY CONSIDERATIONS:
 * - Always active with very strict limits to prevent brute-force attacks
 * - Lower max limit (5 attempts) compared to other limiters
 * - Logs all rate limit violations for security monitoring
 * - Counts all requests (including successful ones) against the limit
 *
 * CONFIGURATION:
 * - Window: SETUP_RATE_LIMIT_WINDOW_MS (default: 1 hour / 3600000ms)
 * - Max Attempts: SETUP_RATE_LIMIT_MAX (default: 5 per hour)
 *
 * PRODUCTION RECOMMENDATIONS:
 * - Keep SETUP_RATE_LIMIT_MAX at 5 or lower
 * - Monitor the console logs for rate limit violations
 * - Consider disabling the setup endpoint entirely after initial admin creation
 * - Implement additional security measures like TOTP/2FA for setup authentication
 *
 * @example
 * // In your .env file:
 * SETUP_RATE_LIMIT_WINDOW_MS=3600000  # 1 hour
 * SETUP_RATE_LIMIT_MAX=5              # 5 attempts per hour
 */
export const setupRateLimiter = rateLimit({
  windowMs: env.SETUP_RATE_LIMIT_WINDOW_MS,
  max: env.SETUP_RATE_LIMIT_MAX,
  message: 'Too many setup attempts from this IP, please try again after an hour',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    console.error('🚨 Setup endpoint rate limit exceeded:', {
      ip: req.ip,
      timestamp: new Date().toISOString(),
      path: req.path
    });

    res.status(429).json({
      success: false,
      error: 'Too many setup attempts from this IP, please try again after an hour',
      code: 'RATE_LIMIT_EXCEEDED'
    });
  }
});

/**
 * Rate Limit Configuration Logger
 *
 * Logs the current rate limit configuration at module load time to help developers
 * understand the security settings in their current environment. This is especially
 * useful for:
 *
 * 1. Verifying rate limits are correctly configured for the environment
 * 2. Understanding why rate limiting might be triggered during development
 * 3. Ensuring production has appropriate security settings
 *
 * The logger includes a warning when development-friendly limits are detected,
 * reminding teams to use stricter limits in production.
 */
(() => {
  console.log('\n============================================');
  console.log('🛡️  RATE LIMITER CONFIGURATION');
  console.log('============================================');
  console.log(`Environment: ${env.NODE_ENV}`);
  console.log('\nLogin Rate Limiter:');
  console.log(`  Max requests: ${env.LOGIN_RATE_LIMIT_MAX}`);
  console.log(`  Window: ${env.LOGIN_RATE_LIMIT_WINDOW_MS / 1000 / 60} minutes`);
  console.log('\nAPI Rate Limiter:');
  console.log(`  Max requests: ${env.API_RATE_LIMIT_MAX}`);
  console.log(`  Window: ${env.API_RATE_LIMIT_WINDOW_MS / 1000 / 60} minutes`);
  console.log('\nAnalytics Rate Limiter:');
  console.log(`  Max requests: ${env.ANALYTICS_RATE_LIMIT_MAX}`);
  console.log(`  Window: ${env.ANALYTICS_RATE_LIMIT_WINDOW_MS / 1000 / 60} minutes`);
  console.log('\nLead Form Rate Limiter:');
  console.log(`  Max requests: ${env.LEAD_RATE_LIMIT_MAX}`);
  console.log(`  Window: ${env.LEAD_RATE_LIMIT_WINDOW_MS / 1000 / 60} minutes`);
  console.log('\nSetup Rate Limiter:');
  console.log(`  Max requests: ${env.SETUP_RATE_LIMIT_MAX}`);
  console.log(`  Window: ${env.SETUP_RATE_LIMIT_WINDOW_MS / 1000 / 60} minutes`);

  // Warn if limits are set very high (development-friendly settings)
  const isDevelopmentLimits = (
    env.LOGIN_RATE_LIMIT_MAX >= 50 ||
    env.API_RATE_LIMIT_MAX >= 2500 ||
    env.ANALYTICS_RATE_LIMIT_MAX >= 1000 ||
    env.LEAD_RATE_LIMIT_MAX >= 30
  );

  if (isDevelopmentLimits) {
    console.log('\n⚠️  WARNING: Rate limits are set to development-friendly values');
    console.log('   These high limits are intended for local development.');
    console.log('   In production, consider using stricter limits:');
    console.log('     - LOGIN_RATE_LIMIT_MAX: 20 (currently: ' + env.LOGIN_RATE_LIMIT_MAX + ')');
    console.log('     - API_RATE_LIMIT_MAX: 1000 (currently: ' + env.API_RATE_LIMIT_MAX + ')');
    console.log('     - ANALYTICS_RATE_LIMIT_MAX: 500 (currently: ' + env.ANALYTICS_RATE_LIMIT_MAX + ')');
    console.log('     - LEAD_RATE_LIMIT_MAX: 10 (currently: ' + env.LEAD_RATE_LIMIT_MAX + ')');
    console.log('     - SETUP_RATE_LIMIT_MAX: 5 (currently: ' + env.SETUP_RATE_LIMIT_MAX + ')');
  } else {
    console.log('\n✅ Rate limiting configured with production-grade limits');
  }

  console.log('============================================\n');
})();

/**
 * Sanitize and validate email input
 */
export function sanitizeEmail(email: any) {
  if (!email || typeof email !== 'string') {
    return null;
  }

  const trimmed = email.trim().toLowerCase();

  if (!validator.isEmail(trimmed)) {
    return null;
  }

  return validator.normalizeEmail(trimmed);
}

/**
 * Sanitize text input to prevent XSS
 */
export function sanitizeText(text: any, maxLength = 10000) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Trim and limit length
  let sanitized = text.trim().substring(0, maxLength);

  // Remove potentially dangerous HTML tags and scripts
  sanitized = validator.escape(sanitized);

  return sanitized;
}

/**
 * Validate and sanitize phone number
 */
export function sanitizePhone(phone: any) {
  if (!phone || typeof phone !== 'string') {
    return null;
  }

  // Remove all non-numeric characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');

  // Basic validation - should have at least 7 digits
  if (cleaned.replace(/\+/g, '').length < 7) {
    return null;
  }

  return cleaned;
}

/**
 * Validate and sanitize URL
 */
export function sanitizeURL(url: any) {
  if (!url || typeof url !== 'string') {
    return null;
  }

  const trimmed = url.trim();

  if (!validator.isURL(trimmed, { require_protocol: true })) {
    return null;
  }

  return trimmed;
}

/**
 * Sanitize pathname/source field (no HTML escaping needed for paths)
 */
function sanitizePath(path: any) {
  if (!path || typeof path !== 'string') {
    return null;
  }

  // Trim and limit length
  let sanitized = path.trim().substring(0, 500);

  // Remove any script tags or dangerous content, but keep forward slashes
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');

  return sanitized;
}

/**
 * Middleware to sanitize lead form input
 */
export function sanitizeLeadInput(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, company, phone, message } = req.body;

    // Sanitize and validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required'
      });
    }

    const sanitizedEmail = sanitizeEmail(email);
    if (!sanitizedEmail) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address'
      });
    }

    // Sanitize all text fields
    req.body.name = sanitizeText(name, 100);
    req.body.email = sanitizedEmail;
    req.body.company = company ? sanitizeText(company, 200) : null;
    req.body.phone = phone ? sanitizePhone(phone) : null;
    req.body.message = message ? sanitizeText(message, 2000) : null;
    req.body.restaurantType = req.body.restaurantType ? sanitizeText(req.body.restaurantType, 100) : null;
    req.body.formType = req.body.formType ? sanitizeText(req.body.formType, 50) : 'contact';
    req.body.source = req.body.source ? sanitizePath(req.body.source) : null;

    next();
  } catch (error) {
    console.error('Input sanitization error:', error);
    res.status(400).json({
      success: false,
      error: 'Invalid input data'
    });
  }
}