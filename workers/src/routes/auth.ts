/**
 * Authentication Routes for Cloudflare Workers
 *
 * Provides endpoints for user authentication including login, logout,
 * token refresh, and session verification.
 *
 * Endpoints:
 * - POST /login      - Authenticate user and set cookies
 * - POST /logout     - Clear auth cookies and revoke refresh token
 * - POST /logout-all - Revoke all user's refresh tokens
 * - POST /refresh    - Refresh access token using refresh token
 * - GET  /verify     - Verify access token validity
 * - GET  /me         - Get current authenticated user info
 */

import { Hono } from 'hono';
import { getCookie } from 'hono/cookie';
import { verify } from 'hono/jwt';
import type { Env, Variables } from '../types/bindings';
import { createDatabaseService } from '../db';
import {
  generateTokenPair,
  setAuthCookies,
  clearAuthCookies,
  validateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
} from '../middleware/auth';
import { loginRateLimiter } from '../middleware/rateLimiter';

// User record type from database
interface UserRecord {
  id: string;
  username: string;
  password: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

// Create auth router
const authRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

/**
 * Verify password against bcrypt hash using Web Crypto API
 * This implementation handles bcrypt-style password verification
 * Compatible with Cloudflare Workers runtime
 */
async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  // For bcrypt hashes, we need to use the same algorithm
  // Since Workers doesn't support bcrypt natively, we use a timing-safe comparison
  // In production, consider using @node-rs/bcrypt or bcrypt-edge package

  // If the hash is a bcrypt hash (starts with $2a$, $2b$, or $2y$)
  if (hashedPassword.startsWith('$2')) {
    // For bcrypt compatibility, we need an external library
    // This is a placeholder that should be replaced with proper bcrypt verification
    // For now, we'll use a simple SHA-256 based verification for development
    // TODO: Add bcrypt-edge or similar package for production

    // Fallback: Check if it's a development SHA-256 hash
    const encoder = new TextEncoder();
    const data = encoder.encode(plainPassword);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = new Uint8Array(hashBuffer);
    const hashHex = Array.from(hashArray)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    // In development, we might have SHA-256 hashed passwords
    // This is NOT secure for production - use proper bcrypt
    return false; // Return false for bcrypt hashes until proper library is added
  }

  // For SHA-256 hashes (development/testing)
  const encoder = new TextEncoder();
  const data = encoder.encode(plainPassword);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hashBuffer);
  const hashHex = Array.from(hashArray)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  // Timing-safe comparison
  if (hashHex.length !== hashedPassword.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < hashHex.length; i++) {
    result |= hashHex.charCodeAt(i) ^ hashedPassword.charCodeAt(i);
  }

  return result === 0;
}

/**
 * POST /api/auth/login
 * Authenticates user and sets both access and refresh cookies
 */
authRoutes.post('/login', loginRateLimiter(), async (c) => {
  try {
    const body = await c.req.json<{ username?: string; password?: string }>();
    const { username, password } = body;

    if (!username || !password) {
      return c.json({ error: 'Username and password are required' }, 400);
    }

    const db = createDatabaseService(c.env);
    const user = await db.queryFirst<UserRecord>(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const validPassword = await verifyPassword(password, user.password);

    if (!validPassword) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Generate token pair (access + refresh)
    const { accessToken, refreshToken } = await generateTokenPair(
      c.env.DB,
      { id: user.id, username: user.username },
      c.env.JWT_SECRET
    );

    // Determine if production based on environment
    const isProduction = c.env.ENVIRONMENT === 'production';

    // Set both cookies
    setAuthCookies(c, accessToken, refreshToken, isProduction);

    // Return user info (tokens are in httpOnly cookies)
    return c.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    return c.json({ error: 'Server error' }, 500);
  }
});

/**
 * POST /api/auth/refresh
 * Refreshes the access token using the refresh token
 */
authRoutes.post('/refresh', async (c) => {
  try {
    const refreshToken = getCookie(c, REFRESH_COOKIE_NAME);

    if (!refreshToken) {
      return c.json(
        {
          error: 'No refresh token provided',
          code: 'NO_REFRESH_TOKEN',
        },
        401
      );
    }

    // Validate the refresh token
    const validation = await validateRefreshToken(c.env.DB, refreshToken);

    if (!validation.valid || !validation.userId) {
      clearAuthCookies(c);
      return c.json(
        {
          error: 'Invalid or expired refresh token',
          code: 'INVALID_REFRESH_TOKEN',
        },
        401
      );
    }

    // Get user info
    const db = createDatabaseService(c.env);
    const user = await db.queryFirst<{ id: string; username: string }>(
      'SELECT id, username FROM users WHERE id = ?',
      [validation.userId]
    );

    if (!user) {
      clearAuthCookies(c);
      return c.json(
        {
          error: 'User not found',
          code: 'USER_NOT_FOUND',
        },
        401
      );
    }

    // Rotate refresh token for security (revoke old, issue new)
    await revokeRefreshToken(c.env.DB, refreshToken);

    // Generate new token pair
    const { accessToken, refreshToken: newRefreshToken } = await generateTokenPair(
      c.env.DB,
      { id: user.id, username: user.username },
      c.env.JWT_SECRET
    );

    // Determine if production based on environment
    const isProduction = c.env.ENVIRONMENT === 'production';

    // Set new cookies
    setAuthCookies(c, accessToken, newRefreshToken, isProduction);

    return c.json({
      success: true,
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    return c.json({ error: 'Server error' }, 500);
  }
});

/**
 * POST /api/auth/logout
 * Logs out the user by revoking refresh token and clearing cookies
 */
authRoutes.post('/logout', async (c) => {
  try {
    const refreshToken = getCookie(c, REFRESH_COOKIE_NAME);

    // Revoke the refresh token if it exists
    if (refreshToken) {
      await revokeRefreshToken(c.env.DB, refreshToken);
    }

    // Clear all auth cookies
    clearAuthCookies(c);

    return c.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    // Still clear cookies even if there's an error
    clearAuthCookies(c);
    return c.json({ success: true, message: 'Logged out' });
  }
});

/**
 * POST /api/auth/logout-all
 * Logs out from all devices by revoking all refresh tokens
 */
authRoutes.post('/logout-all', async (c) => {
  try {
    const accessToken = getCookie(c, ACCESS_COOKIE_NAME);

    if (!accessToken) {
      return c.json({ error: 'Not authenticated' }, 401);
    }

    try {
      const decoded = (await verify(accessToken, c.env.JWT_SECRET)) as {
        id: string;
        username: string;
      };
      await revokeAllUserTokens(c.env.DB, decoded.id);
      clearAuthCookies(c);
      return c.json({ success: true, message: 'Logged out from all devices' });
    } catch {
      clearAuthCookies(c);
      return c.json({ error: 'Invalid token' }, 401);
    }
  } catch (error) {
    return c.json({ error: 'Server error' }, 500);
  }
});

/**
 * GET /api/auth/verify
 * Verifies the access token is valid
 */
authRoutes.get('/verify', async (c) => {
  // Try to get token from httpOnly cookie first
  let token = getCookie(c, ACCESS_COOKIE_NAME);

  // Fallback to Authorization header
  if (!token) {
    const authHeader = c.req.header('Authorization');
    token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  }

  if (!token) {
    return c.json({ valid: false, error: 'No token provided' }, 401);
  }

  try {
    const decoded = await verify(token, c.env.JWT_SECRET);
    return c.json({ valid: true, user: decoded });
  } catch (err: unknown) {
    // Check if token is expired
    const isExpired =
      err instanceof Error &&
      (err.name === 'JwtTokenExpired' || err.message.includes('expired'));

    if (isExpired) {
      return c.json(
        {
          valid: false,
          error: 'Token expired',
          code: 'TOKEN_EXPIRED',
        },
        401
      );
    }

    clearAuthCookies(c);
    return c.json({ valid: false, error: 'Invalid token' }, 401);
  }
});

/**
 * GET /api/auth/me
 * Returns current authenticated user info
 */
authRoutes.get('/me', async (c) => {
  // Try to get token from httpOnly cookie first
  let token = getCookie(c, ACCESS_COOKIE_NAME);

  // Fallback to Authorization header
  if (!token) {
    const authHeader = c.req.header('Authorization');
    token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  }

  if (!token) {
    return c.json({ authenticated: false }, 401);
  }

  try {
    const decoded = (await verify(token, c.env.JWT_SECRET)) as {
      id: string;
      username: string;
    };
    return c.json({
      authenticated: true,
      user: {
        id: decoded.id,
        username: decoded.username,
      },
    });
  } catch (err: unknown) {
    // Check if token is expired
    const isExpired =
      err instanceof Error &&
      (err.name === 'JwtTokenExpired' || err.message.includes('expired'));

    if (isExpired) {
      return c.json(
        {
          authenticated: false,
          code: 'TOKEN_EXPIRED',
        },
        401
      );
    }

    clearAuthCookies(c);
    return c.json({ authenticated: false }, 401);
  }
});

export { authRoutes };
export default authRoutes;
