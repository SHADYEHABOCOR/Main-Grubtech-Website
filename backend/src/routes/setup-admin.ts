import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db from '../config/database.js';
import { env } from '../config/env.js';
import { setupRateLimiter } from '../middleware/security.js';

const router = express.Router();

// One-time setup endpoint to create admin user
// Should be disabled after first use or protected
router.post('/create-admin', setupRateLimiter, (req, res) => {
  try {
    // Validate setup token
    const setupToken = req.headers['x-setup-token'] as string;

    if (!setupToken) {
      console.error('❌ Setup admin attempt without token');
      return res.status(401).json({
        success: false,
        error: 'Setup token is required',
        code: 'NO_SETUP_TOKEN'
      });
    }

    // Use timing-safe comparison to prevent timing attacks
    const expectedToken = env.SETUP_SECRET_TOKEN || '';

    // Convert both strings to buffers of equal length for timing-safe comparison
    const expectedBuffer = Buffer.from(expectedToken, 'utf8');
    const providedBuffer = Buffer.from(setupToken, 'utf8');

    // If lengths don't match, compare against a dummy buffer to maintain constant time
    let tokensMatch = false;
    if (expectedBuffer.length === providedBuffer.length) {
      tokensMatch = crypto.timingSafeEqual(expectedBuffer, providedBuffer);
    } else {
      // Use a dummy comparison to prevent timing attacks based on length
      crypto.timingSafeEqual(expectedBuffer, expectedBuffer);
      tokensMatch = false;
    }

    if (!tokensMatch) {
      console.error('❌ Setup admin attempt with invalid token');
      return res.status(403).json({
        success: false,
        error: 'Invalid setup token',
        code: 'INVALID_SETUP_TOKEN'
      });
    }

    // Check if any admin user already exists (one-time setup only)
    const existingUsersCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };

    if (existingUsersCount.count > 0) {
      console.error('❌ Setup admin attempt blocked - admin user already exists');
      return res.status(409).json({
        success: false,
        error: 'Admin user already exists. Use the proper admin management flow to create additional users.',
        code: 'ADMIN_ALREADY_EXISTS'
      });
    }

    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Check if user already exists
    const existingUser = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (existingUser) {
      return res.json({
        success: false,
        message: 'User already exists',
        username: username
      });
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Insert new user
    const result = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hashedPassword);

    if (result.changes > 0) {
      res.json({
        success: true,
        message: 'Admin user created successfully',
        username: username,
        note: 'This endpoint should be disabled now'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to create user'
      });
    }
  } catch (error) {
    console.error('Setup admin error:', error);
    res.status(500).json({
      success: false,
      error: (error as any).message
    });
  }
});

export default router;
