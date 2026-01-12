import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import db from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
  console.error('❌ FATAL ERROR: JWT_SECRET is not defined in environment variables.');
  process.exit(1);
}

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '15m'; // Short-lived access token (15 minutes)
const REFRESH_TOKEN_EXPIRY_DAYS = 7; // Long-lived refresh token (7 days)

// Cookie names
export const ACCESS_COOKIE_NAME = 'grubtech_auth';
export const REFRESH_COOKIE_NAME = 'grubtech_refresh';

// Cookie configuration for access token (short-lived)
export const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 15 * 60 * 1000, // 15 minutes
  path: '/',
};

// Cookie configuration for refresh token (long-lived, more restrictive path)
export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000, // 7 days
  path: '/api/auth', // Only sent to auth endpoints
};

/**
 * Generate a cryptographically secure refresh token
 */
function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

/**
 * Hash a refresh token for storage (we never store plain tokens)
 */
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Store a refresh token in the database
 */
export function storeRefreshToken(userId: number, token: string): void {
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  db.prepare(`
    INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
    VALUES (?, ?, ?)
  `).run(userId, tokenHash, expiresAt.toISOString());
}

/**
 * Validate a refresh token
 */
export function validateRefreshToken(token: string): { valid: boolean; userId?: number } {
  const tokenHash = hashToken(token);

  const record = db.prepare(`
    SELECT user_id, expires_at, revoked_at
    FROM refresh_tokens
    WHERE token_hash = ?
  `).get(tokenHash) as { user_id: number; expires_at: string; revoked_at: string | null } | undefined;

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
export function revokeRefreshToken(token: string): void {
  const tokenHash = hashToken(token);
  db.prepare(`
    UPDATE refresh_tokens
    SET revoked_at = CURRENT_TIMESTAMP
    WHERE token_hash = ?
  `).run(tokenHash);
}

/**
 * Revoke all refresh tokens for a user (for logout from all devices)
 */
export function revokeAllUserTokens(userId: number): void {
  db.prepare(`
    UPDATE refresh_tokens
    SET revoked_at = CURRENT_TIMESTAMP
    WHERE user_id = ? AND revoked_at IS NULL
  `).run(userId);
}

/**
 * Clean up expired refresh tokens (should be run periodically)
 */
export function cleanupExpiredTokens(): void {
  db.prepare(`
    DELETE FROM refresh_tokens
    WHERE expires_at < CURRENT_TIMESTAMP OR revoked_at IS NOT NULL
  `).run();
}

/**
 * Authentication middleware that validates access tokens
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // Try to get token from httpOnly cookie first
  let token = req.cookies?.[ACCESS_COOKIE_NAME];

  // Fallback to Authorization header for backwards compatibility
  if (!token) {
    const authHeader = req.headers['authorization'];
    token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;
  }

  if (!token) {
    return res.status(401).json({ error: 'No token provided', code: 'NO_TOKEN' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch (err: any) {
    // Clear invalid cookie if present
    if (req.cookies?.[ACCESS_COOKIE_NAME]) {
      res.clearCookie(ACCESS_COOKIE_NAME, { path: '/' });
    }

    // Check if token is expired (client should try to refresh)
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        code: 'TOKEN_EXPIRED',
        message: 'Access token has expired. Please refresh your token.'
      });
    }

    return res.status(401).json({ error: 'Invalid token', code: 'INVALID_TOKEN' });
  }
};

/**
 * Generate access token (short-lived JWT)
 */
export function generateAccessToken(user: { id: number | string; username: string }): string {
  return jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokenPair(user: { id: number; username: string }): {
  accessToken: string;
  refreshToken: string;
} {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();

  // Store refresh token hash in database
  storeRefreshToken(user.id, refreshToken);

  return { accessToken, refreshToken };
}

/**
 * Set auth cookies on response
 */
export function setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
  res.cookie(ACCESS_COOKIE_NAME, accessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);
}

/**
 * Clear auth cookies on response
 */
export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_COOKIE_NAME, { path: '/' });
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
}

// Legacy exports for backwards compatibility
export const COOKIE_NAME = ACCESS_COOKIE_NAME;
export const COOKIE_OPTIONS = ACCESS_COOKIE_OPTIONS;
export const generateToken = generateAccessToken;
export function setAuthCookie(res: Response, token: string): void {
  res.cookie(ACCESS_COOKIE_NAME, token, ACCESS_COOKIE_OPTIONS);
}
export function clearAuthCookie(res: Response): void {
  clearAuthCookies(res);
}
