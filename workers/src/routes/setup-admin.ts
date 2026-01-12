/**
 * Setup Admin Route for Cloudflare Workers
 *
 * One-time setup endpoint to create the initial admin user.
 * This endpoint should be disabled after first use or protected.
 *
 * Endpoints:
 * - POST /create-admin - Create initial admin user with setup token validation
 *
 * Security:
 * - Requires X-Setup-Token header with valid setup token
 * - Uses timing-safe comparison to prevent timing attacks
 * - Only allows creation if no users exist (one-time setup)
 * - Protected by strict rate limiting (5 attempts per hour)
 */

import { Hono } from 'hono';
import type { Env, Variables } from '../types/bindings';
import { createDatabaseService } from '../db';
import { setupRateLimiter } from '../middleware/rateLimiter';

// Create setup admin router
const setupAdminRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

/**
 * Timing-safe string comparison to prevent timing attacks
 * Uses Web Crypto API compatible approach
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Compare against self to maintain constant time
    let dummy = 0;
    for (let i = 0; i < a.length; i++) {
      dummy |= a.charCodeAt(i) ^ a.charCodeAt(i);
    }
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Hash password using SHA-256 (Web Crypto API compatible)
 * Note: For production, consider using bcrypt-edge or similar
 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hashBuffer);
  return Array.from(hashArray)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * POST /api/setup/create-admin
 * Creates the initial admin user with setup token validation
 *
 * Headers:
 * - X-Setup-Token: Required setup token for authentication
 *
 * Body:
 * - username: Admin username
 * - password: Admin password (min 8 characters)
 */
setupAdminRoutes.post('/create-admin', setupRateLimiter(), async (c) => {
  try {
    // Validate setup token
    const setupToken = c.req.header('X-Setup-Token');

    if (!setupToken) {
      return c.json(
        {
          success: false,
          error: 'Setup token is required',
          code: 'NO_SETUP_TOKEN',
        },
        401
      );
    }

    // Get expected token from environment secrets
    const expectedToken = c.env.SETUP_SECRET_TOKEN || '';

    // Use timing-safe comparison to prevent timing attacks
    const tokensMatch = timingSafeEqual(setupToken, expectedToken);

    if (!tokensMatch) {
      return c.json(
        {
          success: false,
          error: 'Invalid setup token',
          code: 'INVALID_SETUP_TOKEN',
        },
        403
      );
    }

    // Check if any admin user already exists (one-time setup only)
    const db = createDatabaseService(c.env);
    const existingUsersCount = await db.queryFirst<{ count: number }>(
      'SELECT COUNT(*) as count FROM users'
    );

    if (existingUsersCount && existingUsersCount.count > 0) {
      return c.json(
        {
          success: false,
          error:
            'Admin user already exists. Use the proper admin management flow to create additional users.',
          code: 'ADMIN_ALREADY_EXISTS',
        },
        409
      );
    }

    // Parse request body
    const body = await c.req.json<{ username?: string; password?: string }>();
    const { username, password } = body;

    // Validate input
    if (!username || !password) {
      return c.json(
        {
          success: false,
          message: 'Username and password are required',
        },
        400
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return c.json(
        {
          success: false,
          message: 'Password must be at least 8 characters long',
        },
        400
      );
    }

    // Check if user already exists
    const existingUser = await db.queryFirst<{ id: string }>(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (existingUser) {
      return c.json({
        success: false,
        message: 'User already exists',
        username: username,
      });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Insert new user
    const result = await db.execute(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );

    if (result.changes && result.changes > 0) {
      return c.json({
        success: true,
        message: 'Admin user created successfully',
        username: username,
        note: 'This endpoint should be disabled now',
      });
    } else {
      return c.json(
        {
          success: false,
          message: 'Failed to create user',
        },
        500
      );
    }
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      500
    );
  }
});

export { setupAdminRoutes };
export default setupAdminRoutes;
