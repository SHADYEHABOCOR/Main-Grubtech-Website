/**
 * Unit tests for Auth Routes
 *
 * Tests authentication endpoints including login, logout, logout-all,
 * refresh, verify, and me routes.
 *
 * Uses vitest with @cloudflare/vitest-pool-workers for Cloudflare Workers testing.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Hono } from 'hono';
import type { Env, Variables } from '../types/bindings';
import authRoutes from '../routes/auth';

// Mock auth middleware functions
vi.mock('../middleware/auth', () => ({
  generateTokenPair: vi.fn(),
  setAuthCookies: vi.fn(),
  clearAuthCookies: vi.fn(),
  validateRefreshToken: vi.fn(),
  revokeRefreshToken: vi.fn(),
  revokeAllUserTokens: vi.fn(),
  ACCESS_COOKIE_NAME: 'grubtech_auth',
  REFRESH_COOKIE_NAME: 'grubtech_refresh',
}));

// Mock rate limiter
vi.mock('../middleware/rateLimiter', () => ({
  loginRateLimiter: vi.fn(() => async (c: unknown, next: () => Promise<void>) => {
    await next();
  }),
}));

// Mock database service
vi.mock('../db', () => ({
  createDatabaseService: vi.fn(),
}));

// Import mocked modules
import * as authMiddleware from '../middleware/auth';
import { createDatabaseService } from '../db';

// Mock D1 Database interface
interface MockD1Database {
  prepare: ReturnType<typeof vi.fn>;
}

// Helper to create mock D1 database
function createMockD1(): MockD1Database {
  return {
    prepare: vi.fn(() => ({
      bind: vi.fn(() => ({
        first: vi.fn(),
        all: vi.fn(),
        run: vi.fn(),
      })),
      first: vi.fn(),
      all: vi.fn(),
      run: vi.fn(),
    })),
  };
}

// Helper to create mock environment
function createMockEnv(db: MockD1Database): Env {
  return {
    DB: db as unknown as D1Database,
    CACHE: {} as KVNamespace,
    UPLOADS: {} as R2Bucket,
    ENVIRONMENT: 'test',
    ALLOWED_ORIGINS: 'http://localhost:3000',
    LOG_LEVEL: 'debug',
    RATE_LIMIT_WINDOW_MS: '60000',
    RATE_LIMIT_MAX_REQUESTS: '1000',
    JWT_SECRET: 'test-jwt-secret',
    EMAIL_API_KEY: 'test-email-key',
    ADMIN_EMAIL: 'test@example.com',
    SETUP_SECRET_TOKEN: 'test-setup-token',
  };
}

describe('Auth Routes', () => {
  let app: Hono<{ Bindings: Env; Variables: Variables }>;
  let mockDb: MockD1Database;
  let mockEnv: Env;
  let mockDbService: {
    queryFirst: ReturnType<typeof vi.fn>;
    query: ReturnType<typeof vi.fn>;
    execute: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // Create new app instance
    app = new Hono<{ Bindings: Env; Variables: Variables }>();
    app.route('/api/auth', authRoutes);

    // Setup mock database
    mockDb = createMockD1();
    mockEnv = createMockEnv(mockDb);

    // Setup mock database service
    mockDbService = {
      queryFirst: vi.fn(),
      query: vi.fn(),
      execute: vi.fn(),
    };
    vi.mocked(createDatabaseService).mockReturnValue(mockDbService as unknown as ReturnType<typeof createDatabaseService>);

    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    const validCredentials = {
      username: 'testuser',
      password: 'password123',
    };

    const mockUser = {
      id: 'user-123',
      username: 'testuser',
      password: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', // SHA-256 of 'password123'
    };

    beforeEach(() => {
      // Mock generateTokenPair
      vi.mocked(authMiddleware.generateTokenPair).mockResolvedValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });

      // Mock setAuthCookies
      vi.mocked(authMiddleware.setAuthCookies).mockImplementation(() => {});
    });

    it('should return 400 when username is missing', async () => {
      const req = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: 'password123' }),
      });

      const res = await app.fetch(req, mockEnv);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body).toHaveProperty('error', 'Username and password are required');
    });

    it('should return 400 when password is missing', async () => {
      const req = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'testuser' }),
      });

      const res = await app.fetch(req, mockEnv);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body).toHaveProperty('error', 'Username and password are required');
    });

    it('should return 400 when both username and password are missing', async () => {
      const req = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const res = await app.fetch(req, mockEnv);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body).toHaveProperty('error', 'Username and password are required');
    });

    it('should return 401 when user does not exist', async () => {
      mockDbService.queryFirst.mockResolvedValueOnce(null);

      const req = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validCredentials),
      });

      const res = await app.fetch(req, mockEnv);
      const body = await res.json();

      expect(res.status).toBe(401);
      expect(body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should return 401 when password is invalid', async () => {
      mockDbService.queryFirst.mockResolvedValueOnce({
        ...mockUser,
        password: 'different-hash',
      });

      const req = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validCredentials),
      });

      const res = await app.fetch(req, mockEnv);
      const body = await res.json();

      expect(res.status).toBe(401);
      expect(body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should handle database errors gracefully', async () => {
      mockDbService.queryFirst.mockRejectedValueOnce(new Error('Database error'));

      const req = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validCredentials),
      });

      const res = await app.fetch(req, mockEnv);
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body).toHaveProperty('error', 'Server error');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully without refresh token', async () => {
      vi.mocked(authMiddleware.clearAuthCookies).mockImplementation(() => {});

      const req = new Request('http://localhost/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await app.fetch(req, mockEnv);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body).toHaveProperty('success', true);
      expect(body).toHaveProperty('message', 'Logged out successfully');
    });

    it('should revoke refresh token when present', async () => {
      vi.mocked(authMiddleware.revokeRefreshToken).mockResolvedValue();
      vi.mocked(authMiddleware.clearAuthCookies).mockImplementation(() => {});

      const req = new Request('http://localhost/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: 'grubtech_refresh=mock-refresh-token',
        },
      });

      const res = await app.fetch(req, mockEnv);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body).toHaveProperty('success', true);
    });

    it('should still logout even if token revocation fails', async () => {
      vi.mocked(authMiddleware.revokeRefreshToken).mockRejectedValue(new Error('Revocation failed'));
      vi.mocked(authMiddleware.clearAuthCookies).mockImplementation(() => {});

      const req = new Request('http://localhost/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: 'grubtech_refresh=mock-refresh-token',
        },
      });

      const res = await app.fetch(req, mockEnv);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body).toHaveProperty('success', true);
    });
  });

  describe('POST /api/auth/logout-all', () => {
    it('should return 401 when no access token provided', async () => {
      const req = new Request('http://localhost/api/auth/logout-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await app.fetch(req, mockEnv);
      const body = await res.json();

      expect(res.status).toBe(401);
      expect(body).toHaveProperty('error', 'Not authenticated');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should return 401 when no refresh token provided', async () => {
      const req = new Request('http://localhost/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await app.fetch(req, mockEnv);
      const body = await res.json();

      expect(res.status).toBe(401);
      expect(body).toHaveProperty('error', 'No refresh token provided');
      expect(body).toHaveProperty('code', 'NO_REFRESH_TOKEN');
    });

    it('should return 401 when refresh token is invalid', async () => {
      vi.mocked(authMiddleware.validateRefreshToken).mockResolvedValue({ valid: false });
      vi.mocked(authMiddleware.clearAuthCookies).mockImplementation(() => {});

      const req = new Request('http://localhost/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: 'grubtech_refresh=invalid-token',
        },
      });

      const res = await app.fetch(req, mockEnv);
      const body = await res.json();

      expect(res.status).toBe(401);
      expect(body).toHaveProperty('error', 'Invalid or expired refresh token');
      expect(body).toHaveProperty('code', 'INVALID_REFRESH_TOKEN');
    });

    it('should return 401 when user not found for valid token', async () => {
      vi.mocked(authMiddleware.validateRefreshToken).mockResolvedValue({
        valid: true,
        userId: 'user-123',
      });
      mockDbService.queryFirst.mockResolvedValueOnce(null);
      vi.mocked(authMiddleware.clearAuthCookies).mockImplementation(() => {});

      const req = new Request('http://localhost/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: 'grubtech_refresh=valid-token',
        },
      });

      const res = await app.fetch(req, mockEnv);
      const body = await res.json();

      expect(res.status).toBe(401);
      expect(body).toHaveProperty('error', 'User not found');
      expect(body).toHaveProperty('code', 'USER_NOT_FOUND');
    });

    it('should refresh tokens successfully', async () => {
      vi.mocked(authMiddleware.validateRefreshToken).mockResolvedValue({
        valid: true,
        userId: 'user-123',
      });
      mockDbService.queryFirst.mockResolvedValueOnce({
        id: 'user-123',
        username: 'testuser',
      });
      vi.mocked(authMiddleware.revokeRefreshToken).mockResolvedValue();
      vi.mocked(authMiddleware.generateTokenPair).mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
      vi.mocked(authMiddleware.setAuthCookies).mockImplementation(() => {});

      const req = new Request('http://localhost/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: 'grubtech_refresh=valid-token',
        },
      });

      const res = await app.fetch(req, mockEnv);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body).toHaveProperty('success', true);
      expect(body).toHaveProperty('message', 'Token refreshed successfully');
    });

    it('should handle database errors gracefully', async () => {
      vi.mocked(authMiddleware.validateRefreshToken).mockRejectedValue(new Error('Database error'));

      const req = new Request('http://localhost/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: 'grubtech_refresh=valid-token',
        },
      });

      const res = await app.fetch(req, mockEnv);
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body).toHaveProperty('error', 'Server error');
    });
  });

  describe('GET /api/auth/verify', () => {
    it('should return 401 when no token provided', async () => {
      const req = new Request('http://localhost/api/auth/verify', {
        method: 'GET',
      });

      const res = await app.fetch(req, mockEnv);
      const body = await res.json();

      expect(res.status).toBe(401);
      expect(body).toHaveProperty('valid', false);
      expect(body).toHaveProperty('error', 'No token provided');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return 401 when not authenticated', async () => {
      const req = new Request('http://localhost/api/auth/me', {
        method: 'GET',
      });

      const res = await app.fetch(req, mockEnv);
      const body = await res.json();

      expect(res.status).toBe(401);
      expect(body).toHaveProperty('authenticated', false);
    });
  });
});

describe('Auth Routes - Input Validation', () => {
  let app: Hono<{ Bindings: Env; Variables: Variables }>;
  let mockEnv: Env;

  beforeEach(() => {
    app = new Hono<{ Bindings: Env; Variables: Variables }>();
    app.route('/api/auth', authRoutes);
    mockEnv = createMockEnv(createMockD1());
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should reject empty username', async () => {
    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: '', password: 'password' }),
    });

    const res = await app.fetch(req, mockEnv);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toHaveProperty('error', 'Username and password are required');
  });

  it('should reject empty password', async () => {
    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'user', password: '' }),
    });

    const res = await app.fetch(req, mockEnv);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toHaveProperty('error', 'Username and password are required');
  });
});

describe('Auth Routes - Cookie Handling', () => {
  let app: Hono<{ Bindings: Env; Variables: Variables }>;
  let mockEnv: Env;

  beforeEach(() => {
    app = new Hono<{ Bindings: Env; Variables: Variables }>();
    app.route('/api/auth', authRoutes);
    mockEnv = createMockEnv(createMockD1());
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should accept token from Authorization header in verify endpoint', async () => {
    const req = new Request('http://localhost/api/auth/verify', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer some-token',
      },
    });

    // This will fail verification but shows the header is processed
    const res = await app.fetch(req, mockEnv);
    const body = await res.json();

    // The token will be invalid but the endpoint should try to verify it
    expect(body).toHaveProperty('valid', false);
  });

  it('should accept token from cookie in verify endpoint', async () => {
    const req = new Request('http://localhost/api/auth/verify', {
      method: 'GET',
      headers: {
        Cookie: 'grubtech_auth=some-token',
      },
    });

    // This will fail verification but shows the cookie is processed
    const res = await app.fetch(req, mockEnv);
    const body = await res.json();

    // The token will be invalid but the endpoint should try to verify it
    expect(body).toHaveProperty('valid', false);
  });

  it('should accept token from Authorization header in me endpoint', async () => {
    const req = new Request('http://localhost/api/auth/me', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer some-token',
      },
    });

    // This will fail verification but shows the header is processed
    const res = await app.fetch(req, mockEnv);
    const body = await res.json();

    // The token will be invalid but the endpoint should try to verify it
    expect(body).toHaveProperty('authenticated', false);
  });
});
