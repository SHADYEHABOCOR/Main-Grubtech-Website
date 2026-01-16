import { Context, Next } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { sign, verify } from 'hono/jwt';
import type { Env, Variables, JWTPayload } from '../types/bindings';

// Token expiration times (in seconds for Hono JWT)
const ACCESS_TOKEN_EXPIRY_SECONDS = 15 * 60; // 15 minutes
const REFRESH_TOKEN_EXPIRY_DAYS = 7;
const REFRESH_TOKEN_EXPIRY_SECONDS = REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60;

// Cookie names (matching backend)
export const ACCESS_COOKIE_NAME = 'grubtech_auth';
export const REFRESH_COOKIE_NAME = 'grubtech_refresh';

// Cookie configuration for access token (short-lived)
export const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true, // Always secure in Workers (production environment)
  sameSite: 'None' as const, // Changed from Strict to None for cross-site requests
  maxAge: ACCESS_TOKEN_EXPIRY_SECONDS,
  path: '/',
};

// Cookie configuration for refresh token (long-lived, more restrictive path)
export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'None' as const, // Changed from Strict to None for cross-site requests
  maxAge: REFRESH_TOKEN_EXPIRY_SECONDS,
  path: '/api/auth', // Only sent to auth endpoints
};

type AppContext = Context<{ Bindings: Env; Variables: Variables }>;

/**
 * Generate a cryptographically secure refresh token using Web Crypto API
 */
export async function generateRefreshToken(): Promise<string> {
  const bytes = new Uint8Array(64);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Hash a refresh token for storage using Web Crypto API (we never store plain tokens)
 */
export async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hashBuffer);
  return Array.from(hashArray)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Store a refresh token in the database (D1)
 */
export async function storeRefreshToken(
  db: D1Database,
  userId: string,
  token: string
): Promise<void> {
  const tokenHash = await hashToken(token);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_SECONDS * 1000);

  await db
    .prepare(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES (?, ?, ?)`
    )
    .bind(userId, tokenHash, expiresAt.toISOString())
    .run();
}

/**
 * Validate a refresh token against the database
 */
export async function validateRefreshToken(
  db: D1Database,
  token: string
): Promise<{ valid: boolean; userId?: string }> {
  const tokenHash = await hashToken(token);

  const record = await db
    .prepare(
      `SELECT user_id, expires_at, revoked_at
       FROM refresh_tokens
       WHERE token_hash = ?`
    )
    .bind(tokenHash)
    .first<{ user_id: string; expires_at: string; revoked_at: string | null }>();

  if (!record) {
    return { valid: false };
  }

  // Check if revoked
  if (record.revoked_at) {
    return { valid: false };
  }

  // Check if expired
  if (new Date(record.expires_at) < new Date()) {
    return { valid: false };
  }

  return { valid: true, userId: record.user_id };
}

/**
 * Revoke a specific refresh token
 */
export async function revokeRefreshToken(db: D1Database, token: string): Promise<void> {
  const tokenHash = await hashToken(token);
  await db
    .prepare(
      `UPDATE refresh_tokens
       SET revoked_at = CURRENT_TIMESTAMP
       WHERE token_hash = ?`
    )
    .bind(tokenHash)
    .run();
}

/**
 * Revoke all refresh tokens for a user (for logout from all devices)
 */
export async function revokeAllUserTokens(db: D1Database, userId: string): Promise<void> {
  await db
    .prepare(
      `UPDATE refresh_tokens
       SET revoked_at = CURRENT_TIMESTAMP
       WHERE user_id = ? AND revoked_at IS NULL`
    )
    .bind(userId)
    .run();
}

/**
 * Clean up expired refresh tokens (should be run periodically via scheduled task)
 */
export async function cleanupExpiredTokens(db: D1Database): Promise<void> {
  await db
    .prepare(
      `DELETE FROM refresh_tokens
       WHERE expires_at < CURRENT_TIMESTAMP OR revoked_at IS NOT NULL`
    )
    .run();
}

/**
 * Authentication middleware that validates access tokens
 * This is the main middleware to protect routes
 */
export async function authenticateToken(c: AppContext, next: Next) {
  // Try to get token from httpOnly cookie first
  let token = getCookie(c, ACCESS_COOKIE_NAME);

  // Fallback to Authorization header for backwards compatibility
  if (!token) {
    const authHeader = c.req.header('Authorization');
    token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  }

  if (!token) {
    return c.json({ error: 'No token provided', code: 'NO_TOKEN' }, 401);
  }

  try {
    const payload = await verify(token, c.env.JWT_SECRET);

    // Set user in context for downstream handlers
    c.set('user', payload as unknown as JWTPayload);

    await next();
  } catch (err: unknown) {
    // Clear invalid cookie if present
    if (getCookie(c, ACCESS_COOKIE_NAME)) {
      deleteCookie(c, ACCESS_COOKIE_NAME, { path: '/' });
    }

    // Check if token is expired
    const isExpired =
      err instanceof Error &&
      (err.name === 'JwtTokenExpired' || err.message.includes('expired'));

    if (isExpired) {
      return c.json(
        {
          error: 'Token expired',
          code: 'TOKEN_EXPIRED',
          message: 'Access token has expired. Please refresh your token.',
        },
        401
      );
    }

    return c.json({ error: 'Invalid token', code: 'INVALID_TOKEN' }, 401);
  }
}

/**
 * Generate access token (short-lived JWT) using Hono JWT
 */
export async function generateAccessToken(
  user: { id: string; username: string },
  jwtSecret: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  const payload = {
    id: user.id,
    username: user.username,
    iat: now,
    exp: now + ACCESS_TOKEN_EXPIRY_SECONDS,
  };

  return await sign(payload, jwtSecret);
}

/**
 * Generate both access and refresh tokens
 */
export async function generateTokenPair(
  db: D1Database,
  user: { id: string; username: string },
  jwtSecret: string
): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const accessToken = await generateAccessToken(user, jwtSecret);
  const refreshToken = await generateRefreshToken();

  // Store refresh token hash in database
  await storeRefreshToken(db, user.id, refreshToken);

  return { accessToken, refreshToken };
}

/**
 * Set auth cookies on response using Hono cookie helpers
 */
export function setAuthCookies(
  c: AppContext,
  accessToken: string,
  refreshToken: string,
  isProduction = true
): void {
  setCookie(c, ACCESS_COOKIE_NAME, accessToken, {
    ...ACCESS_COOKIE_OPTIONS,
    secure: isProduction,
  });

  setCookie(c, REFRESH_COOKIE_NAME, refreshToken, {
    ...REFRESH_COOKIE_OPTIONS,
    secure: isProduction,
  });
}

/**
 * Clear auth cookies on response
 */
export function clearAuthCookies(c: AppContext): void {
  deleteCookie(c, ACCESS_COOKIE_NAME, { path: '/' });
  deleteCookie(c, REFRESH_COOKIE_NAME, { path: '/api/auth' });
}

// Legacy exports for backwards compatibility
export const COOKIE_NAME = ACCESS_COOKIE_NAME;
export const COOKIE_OPTIONS = ACCESS_COOKIE_OPTIONS;
export const generateToken = generateAccessToken;

export function setAuthCookie(
  c: AppContext,
  token: string,
  isProduction = true
): void {
  setCookie(c, ACCESS_COOKIE_NAME, token, {
    ...ACCESS_COOKIE_OPTIONS,
    secure: isProduction,
  });
}

export function clearAuthCookie(c: AppContext): void {
  clearAuthCookies(c);
}
