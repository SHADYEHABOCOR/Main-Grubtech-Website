import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import authRouter from '../auth.js';
import db from '../../config/database.js';
import bcrypt from 'bcryptjs';
import * as authMiddleware from '../../middleware/auth.js';

// Mock the database module
vi.mock('../../config/database.js', () => ({
  default: {
    prepare: vi.fn(),
    exec: vi.fn(),
  },
}));

// Mock bcrypt
vi.mock('bcryptjs', () => ({
  default: {
    compareSync: vi.fn(),
  },
}));

// Mock the auth middleware module
vi.mock('../../middleware/auth.js', async () => {
  const actual = await vi.importActual('../../middleware/auth.js') as any;
  return {
    ...actual,
    generateTokenPair: vi.fn(),
    generateAccessToken: vi.fn(),
    setAuthCookies: vi.fn(),
    clearAuthCookies: vi.fn(),
    validateRefreshToken: vi.fn(),
    revokeRefreshToken: vi.fn(),
    revokeAllUserTokens: vi.fn(),
    cleanupExpiredTokens: vi.fn(),
    ACCESS_COOKIE_NAME: 'grubtech_auth',
    REFRESH_COOKIE_NAME: 'grubtech_refresh',
  };
});

// Mock the security middleware
vi.mock('../../middleware/security.js', () => ({
  loginRateLimiter: vi.fn((req: any, res: any, next: any) => next()),
}));

// Mock JWT
vi.mock('jsonwebtoken', () => ({
  default: {
    verify: vi.fn(),
    sign: vi.fn(),
  },
}));

describe('Auth API', () => {
  let app: Express;
  let mockPrepare: Mock;
  let mockGet: Mock;
  let mockRun: Mock;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use('/api/auth', authRouter);

    // Reset all mocks
    vi.clearAllMocks();

    // Setup mock functions for database
    mockGet = vi.fn();
    mockRun = vi.fn();
    mockPrepare = vi.fn(() => ({
      get: mockGet,
      run: mockRun,
    }));

    (db.prepare as Mock) = mockPrepare;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /login', () => {
    const validCredentials = {
      username: 'testuser',
      password: 'password123',
    };

    const mockUser = {
      id: 1,
      username: 'testuser',
      password: '$2a$10$hashedpassword',
    };

    beforeEach(() => {
      // Mock generateTokenPair
      (authMiddleware.generateTokenPair as Mock).mockReturnValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });

      // Mock setAuthCookies
      (authMiddleware.setAuthCookies as Mock).mockImplementation(() => {});
    });

    it('should login successfully with valid credentials', async () => {
      mockGet.mockReturnValueOnce(mockUser);
      (bcrypt.compareSync as Mock).mockReturnValueOnce(true);

      const response = await request(app)
        .post('/api/auth/login')
        .send(validCredentials);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toEqual({
        id: mockUser.id,
        username: mockUser.username,
      });
      expect(mockPrepare).toHaveBeenCalledWith('SELECT * FROM users WHERE username = ?');
      expect(mockGet).toHaveBeenCalledWith(validCredentials.username);
      expect(authMiddleware.generateTokenPair).toHaveBeenCalledWith({
        id: mockUser.id,
        username: mockUser.username,
      });
      expect(authMiddleware.setAuthCookies).toHaveBeenCalled();
    });

    it('should return 400 when username is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Username and password are required');
      expect(mockPrepare).not.toHaveBeenCalled();
    });

    it('should return 400 when password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Username and password are required');
      expect(mockPrepare).not.toHaveBeenCalled();
    });

    it('should return 400 when both username and password are missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Username and password are required');
      expect(mockPrepare).not.toHaveBeenCalled();
    });

    it('should return 401 when user does not exist', async () => {
      mockGet.mockReturnValueOnce(undefined);

      const response = await request(app)
        .post('/api/auth/login')
        .send(validCredentials);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
      expect(mockGet).toHaveBeenCalledWith(validCredentials.username);
    });

    it('should return 401 when password is invalid', async () => {
      mockGet.mockReturnValueOnce(mockUser);
      (bcrypt.compareSync as Mock).mockReturnValueOnce(false);

      const response = await request(app)
        .post('/api/auth/login')
        .send(validCredentials);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
      expect(bcrypt.compareSync).toHaveBeenCalledWith(
        validCredentials.password,
        mockUser.password
      );
    });

    it('should handle database errors gracefully', async () => {
      mockPrepare.mockImplementationOnce(() => {
        throw new Error('Database connection error');
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send(validCredentials);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Server error');
    });

    it('should not expose user password in response', async () => {
      mockGet.mockReturnValueOnce(mockUser);
      (bcrypt.compareSync as Mock).mockReturnValueOnce(true);

      const response = await request(app)
        .post('/api/auth/login')
        .send(validCredentials);

      expect(response.status).toBe(200);
      expect(response.body.user).not.toHaveProperty('password');
    });
  });

  describe('POST /refresh', () => {
    const mockRefreshToken = 'valid-refresh-token';
    const mockUser = {
      id: 1,
      username: 'testuser',
    };

    beforeEach(() => {
      (authMiddleware.generateTokenPair as Mock).mockReturnValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
      (authMiddleware.setAuthCookies as Mock).mockImplementation(() => {});
      (authMiddleware.revokeRefreshToken as Mock).mockImplementation(() => {});
      (authMiddleware.clearAuthCookies as Mock).mockImplementation(() => {});
    });

    it('should refresh token successfully with valid refresh token', async () => {
      (authMiddleware.validateRefreshToken as Mock).mockReturnValueOnce({
        valid: true,
        userId: mockUser.id,
      });
      mockGet.mockReturnValueOnce(mockUser);

      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`grubtech_refresh=${mockRefreshToken}`]);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Token refreshed successfully');
      expect(authMiddleware.validateRefreshToken).toHaveBeenCalledWith(mockRefreshToken);
      expect(authMiddleware.revokeRefreshToken).toHaveBeenCalledWith(mockRefreshToken);
      expect(authMiddleware.generateTokenPair).toHaveBeenCalledWith({
        id: mockUser.id,
        username: mockUser.username,
      });
      expect(authMiddleware.setAuthCookies).toHaveBeenCalled();
    });

    it('should return 401 when no refresh token provided', async () => {
      const response = await request(app).post('/api/auth/refresh');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'No refresh token provided');
      expect(response.body).toHaveProperty('code', 'NO_REFRESH_TOKEN');
    });

    it('should return 401 when refresh token is invalid', async () => {
      (authMiddleware.validateRefreshToken as Mock).mockReturnValueOnce({
        valid: false,
      });

      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`grubtech_refresh=${mockRefreshToken}`]);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid or expired refresh token');
      expect(response.body).toHaveProperty('code', 'INVALID_REFRESH_TOKEN');
      expect(authMiddleware.clearAuthCookies).toHaveBeenCalled();
    });

    it('should return 401 when refresh token has no userId', async () => {
      (authMiddleware.validateRefreshToken as Mock).mockReturnValueOnce({
        valid: true,
        userId: undefined,
      });

      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`grubtech_refresh=${mockRefreshToken}`]);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid or expired refresh token');
      expect(response.body).toHaveProperty('code', 'INVALID_REFRESH_TOKEN');
      expect(authMiddleware.clearAuthCookies).toHaveBeenCalled();
    });

    it('should return 401 when user is not found', async () => {
      (authMiddleware.validateRefreshToken as Mock).mockReturnValueOnce({
        valid: true,
        userId: mockUser.id,
      });
      mockGet.mockReturnValueOnce(undefined);

      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`grubtech_refresh=${mockRefreshToken}`]);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'User not found');
      expect(response.body).toHaveProperty('code', 'USER_NOT_FOUND');
      expect(authMiddleware.clearAuthCookies).toHaveBeenCalled();
    });

    it('should handle server errors gracefully', async () => {
      (authMiddleware.validateRefreshToken as Mock).mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`grubtech_refresh=${mockRefreshToken}`]);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Server error');
    });
  });

  describe('POST /logout', () => {
    const mockRefreshToken = 'valid-refresh-token';

    beforeEach(() => {
      (authMiddleware.revokeRefreshToken as Mock).mockImplementation(() => {});
      (authMiddleware.clearAuthCookies as Mock).mockImplementation(() => {});
    });

    it('should logout successfully with refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', [`grubtech_refresh=${mockRefreshToken}`]);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Logged out successfully');
      expect(authMiddleware.revokeRefreshToken).toHaveBeenCalledWith(mockRefreshToken);
      expect(authMiddleware.clearAuthCookies).toHaveBeenCalled();
    });

    it('should logout successfully without refresh token', async () => {
      const response = await request(app).post('/api/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Logged out successfully');
      expect(authMiddleware.revokeRefreshToken).not.toHaveBeenCalled();
      expect(authMiddleware.clearAuthCookies).toHaveBeenCalled();
    });

    it('should still clear cookies even when revoke fails', async () => {
      (authMiddleware.revokeRefreshToken as Mock).mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', [`grubtech_refresh=${mockRefreshToken}`]);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Logged out');
      expect(authMiddleware.clearAuthCookies).toHaveBeenCalled();
    });
  });

  describe('POST /logout-all', () => {
    const mockAccessToken = 'valid-access-token';
    const mockDecodedToken = {
      id: 1,
      username: 'testuser',
    };

    beforeEach(() => {
      (authMiddleware.revokeAllUserTokens as Mock).mockImplementation(() => {});
      (authMiddleware.clearAuthCookies as Mock).mockImplementation(() => {});
    });

    it('should logout from all devices successfully', async () => {
      const jwt = await import('jsonwebtoken');
      (jwt.default.verify as Mock).mockReturnValueOnce(mockDecodedToken);

      const response = await request(app)
        .post('/api/auth/logout-all')
        .set('Cookie', [`grubtech_auth=${mockAccessToken}`]);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Logged out from all devices');
      expect(authMiddleware.revokeAllUserTokens).toHaveBeenCalledWith(mockDecodedToken.id);
      expect(authMiddleware.clearAuthCookies).toHaveBeenCalled();
    });

    it('should return 401 when no access token provided', async () => {
      const response = await request(app).post('/api/auth/logout-all');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Not authenticated');
    });

    it('should return 401 when access token is invalid', async () => {
      const jwt = await import('jsonwebtoken');
      (jwt.default.verify as Mock).mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      const response = await request(app)
        .post('/api/auth/logout-all')
        .set('Cookie', [`grubtech_auth=${mockAccessToken}`]);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid token');
      expect(authMiddleware.clearAuthCookies).toHaveBeenCalled();
    });

    it('should handle server errors gracefully', async () => {
      const jwt = await import('jsonwebtoken');
      (jwt.default.verify as Mock).mockReturnValueOnce(mockDecodedToken);
      (authMiddleware.revokeAllUserTokens as Mock).mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const response = await request(app)
        .post('/api/auth/logout-all')
        .set('Cookie', [`grubtech_auth=${mockAccessToken}`]);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Server error');
    });
  });

  describe('GET /verify', () => {
    const mockAccessToken = 'valid-access-token';
    const mockDecodedToken = {
      id: 1,
      username: 'testuser',
    };

    beforeEach(() => {
      (authMiddleware.clearAuthCookies as Mock).mockImplementation(() => {});
    });

    it('should verify valid token from cookie', async () => {
      const jwt = await import('jsonwebtoken');
      (jwt.default.verify as Mock).mockReturnValueOnce(mockDecodedToken);

      const response = await request(app)
        .get('/api/auth/verify')
        .set('Cookie', [`grubtech_auth=${mockAccessToken}`]);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('valid', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toEqual(mockDecodedToken);
    });

    it('should verify valid token from Authorization header', async () => {
      const jwt = await import('jsonwebtoken');
      (jwt.default.verify as Mock).mockReturnValueOnce(mockDecodedToken);

      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${mockAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('valid', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toEqual(mockDecodedToken);
    });

    it('should return 401 when no token provided', async () => {
      const response = await request(app).get('/api/auth/verify');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('valid', false);
      expect(response.body).toHaveProperty('error', 'No token provided');
    });

    it('should return 401 when token is expired', async () => {
      const jwt = await import('jsonwebtoken');
      const expiredError = new Error('Token expired');
      (expiredError as any).name = 'TokenExpiredError';
      (jwt.default.verify as Mock).mockImplementationOnce(() => {
        throw expiredError;
      });

      const response = await request(app)
        .get('/api/auth/verify')
        .set('Cookie', [`grubtech_auth=${mockAccessToken}`]);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('valid', false);
      expect(response.body).toHaveProperty('error', 'Token expired');
      expect(response.body).toHaveProperty('code', 'TOKEN_EXPIRED');
    });

    it('should return 401 when token is invalid', async () => {
      const jwt = await import('jsonwebtoken');
      (jwt.default.verify as Mock).mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      const response = await request(app)
        .get('/api/auth/verify')
        .set('Cookie', [`grubtech_auth=${mockAccessToken}`]);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('valid', false);
      expect(response.body).toHaveProperty('error', 'Invalid token');
      expect(authMiddleware.clearAuthCookies).toHaveBeenCalled();
    });
  });

  describe('GET /me', () => {
    const mockAccessToken = 'valid-access-token';
    const mockDecodedToken = {
      id: 1,
      username: 'testuser',
    };

    beforeEach(() => {
      (authMiddleware.clearAuthCookies as Mock).mockImplementation(() => {});
    });

    it('should return authenticated user info from cookie', async () => {
      const jwt = await import('jsonwebtoken');
      (jwt.default.verify as Mock).mockReturnValueOnce(mockDecodedToken);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', [`grubtech_auth=${mockAccessToken}`]);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('authenticated', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toEqual({
        id: mockDecodedToken.id,
        username: mockDecodedToken.username,
      });
    });

    it('should return authenticated user info from Authorization header', async () => {
      const jwt = await import('jsonwebtoken');
      (jwt.default.verify as Mock).mockReturnValueOnce(mockDecodedToken);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${mockAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('authenticated', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toEqual({
        id: mockDecodedToken.id,
        username: mockDecodedToken.username,
      });
    });

    it('should return 401 when no token provided', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('authenticated', false);
    });

    it('should return 401 when token is expired', async () => {
      const jwt = await import('jsonwebtoken');
      const expiredError = new Error('Token expired');
      (expiredError as any).name = 'TokenExpiredError';
      (jwt.default.verify as Mock).mockImplementationOnce(() => {
        throw expiredError;
      });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', [`grubtech_auth=${mockAccessToken}`]);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('authenticated', false);
      expect(response.body).toHaveProperty('code', 'TOKEN_EXPIRED');
    });

    it('should return 401 when token is invalid', async () => {
      const jwt = await import('jsonwebtoken');
      (jwt.default.verify as Mock).mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', [`grubtech_auth=${mockAccessToken}`]);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('authenticated', false);
      expect(authMiddleware.clearAuthCookies).toHaveBeenCalled();
    });

    it('should not expose sensitive user data', async () => {
      const jwt = await import('jsonwebtoken');
      const tokenWithExtraData = {
        id: 1,
        username: 'testuser',
        password: 'should-not-be-exposed',
        iat: 1234567890,
      };
      (jwt.default.verify as Mock).mockReturnValueOnce(tokenWithExtraData);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', [`grubtech_auth=${mockAccessToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.user).toEqual({
        id: tokenWithExtraData.id,
        username: tokenWithExtraData.username,
      });
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.user).not.toHaveProperty('iat');
    });
  });
});
