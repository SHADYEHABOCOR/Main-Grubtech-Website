import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';
import {
  generateTokenPair,
  generateAccessToken,
  setAuthCookies,
  clearAuthCookies,
  validateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  cleanupExpiredTokens,
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
} from '../middleware/auth.js';
import { loginRateLimiter } from '../middleware/security.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('❌ FATAL ERROR: JWT_SECRET is not defined in environment variables.');
  process.exit(1);
}

/**
 * POST /api/auth/login
 * Authenticates user and sets both access and refresh cookies
 */
router.post('/login', loginRateLimiter, (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = bcrypt.compareSync(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token pair (access + refresh)
    const { accessToken, refreshToken } = generateTokenPair({
      id: user.id,
      username: user.username
    });

    // Set both cookies
    setAuthCookies(res, accessToken, refreshToken);

    // Return user info (tokens are in httpOnly cookies)
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/auth/refresh
 * Refreshes the access token using the refresh token
 */
router.post('/refresh', (req, res) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

    if (!refreshToken) {
      return res.status(401).json({
        error: 'No refresh token provided',
        code: 'NO_REFRESH_TOKEN'
      });
    }

    // Validate the refresh token
    const validation = validateRefreshToken(refreshToken);

    if (!validation.valid || !validation.userId) {
      clearAuthCookies(res);
      return res.status(401).json({
        error: 'Invalid or expired refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    // Get user info
    const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(validation.userId) as any;

    if (!user) {
      clearAuthCookies(res);
      return res.status(401).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Rotate refresh token for security (revoke old, issue new)
    revokeRefreshToken(refreshToken);

    // Generate new token pair
    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair({
      id: user.id,
      username: user.username
    });

    // Set new cookies
    setAuthCookies(res, accessToken, newRefreshToken);

    res.json({
      success: true,
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/auth/logout
 * Logs out the user by revoking refresh token and clearing cookies
 */
router.post('/logout', (req, res) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

    // Revoke the refresh token if it exists
    if (refreshToken) {
      revokeRefreshToken(refreshToken);
    }

    // Clear all auth cookies
    clearAuthCookies(res);

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    // Still clear cookies even if there's an error
    clearAuthCookies(res);
    res.json({ success: true, message: 'Logged out' });
  }
});

/**
 * POST /api/auth/logout-all
 * Logs out from all devices by revoking all refresh tokens
 */
router.post('/logout-all', (req, res) => {
  try {
    const accessToken = req.cookies?.[ACCESS_COOKIE_NAME];

    if (!accessToken) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
      const decoded = jwt.verify(accessToken, JWT_SECRET) as any;
      revokeAllUserTokens(decoded.id);
      clearAuthCookies(res);
      res.json({ success: true, message: 'Logged out from all devices' });
    } catch {
      clearAuthCookies(res);
      res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/auth/verify
 * Verifies the access token is valid
 */
router.get('/verify', (req, res) => {
  let token = req.cookies?.[ACCESS_COOKIE_NAME];

  if (!token) {
    const authHeader = req.headers['authorization'];
    token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  }

  if (!token) {
    return res.status(401).json({ valid: false, error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        valid: false,
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    clearAuthCookies(res);
    res.status(401).json({ valid: false, error: 'Invalid token' });
  }
});

/**
 * GET /api/auth/me
 * Returns current authenticated user info
 */
router.get('/me', (req, res) => {
  let token = req.cookies?.[ACCESS_COOKIE_NAME];

  if (!token) {
    const authHeader = req.headers['authorization'];
    token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  }

  if (!token) {
    return res.status(401).json({ authenticated: false });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    res.json({
      authenticated: true,
      user: {
        id: decoded.id,
        username: decoded.username
      }
    });
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        authenticated: false,
        code: 'TOKEN_EXPIRED'
      });
    }
    clearAuthCookies(res);
    res.status(401).json({ authenticated: false });
  }
});

// Clean up expired tokens periodically (every hour)
setInterval(() => {
  try {
    cleanupExpiredTokens();
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
  }
}, 60 * 60 * 1000);

export default router;
