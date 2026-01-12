/**
 * Unit tests for Leads Routes
 *
 * Tests lead management endpoints including create, list, get, delete,
 * and statistics routes.
 *
 * Uses vitest with @cloudflare/vitest-pool-workers for Cloudflare Workers testing.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Hono } from 'hono';
import type { Env, Variables } from '../types/bindings';
import leadsRoutes from '../routes/leads';

// Mock rate limiter
vi.mock('../middleware/rateLimiter', () => ({
  leadRateLimiter: vi.fn(() => async (c: unknown, next: () => Promise<void>) => {
    await next();
  }),
}));

// Mock auth middleware
vi.mock('../middleware/auth', () => ({
  authenticateToken: vi.fn(async (c: unknown, next: () => Promise<void>) => {
    await next();
  }),
}));

// Mock database service
vi.mock('../db', () => ({
  createDatabaseService: vi.fn(),
}));

// Mock email service
vi.mock('../services/email', () => ({
  createEmailService: vi.fn(() => ({
    sendLeadEmails: vi.fn().mockResolvedValue({
      adminNotification: { success: true, message: 'Sent' },
      autoReply: { success: true, message: 'Sent' },
    }),
  })),
}));

// Import mocked modules
import * as authMiddleware from '../middleware/auth';
import * as rateLimiterModule from '../middleware/rateLimiter';
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
    CACHE: {
      get: vi.fn(),
      put: vi.fn(),
    } as unknown as KVNamespace,
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

describe('Leads Routes', () => {
  let app: Hono<{ Bindings: Env; Variables: Variables }>;
  let mockDb: MockD1Database;
  let mockEnv: Env;
  let mockDbService: {
    queryFirst: ReturnType<typeof vi.fn>;
    query: ReturnType<typeof vi.fn>;
    execute: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // Create new app instance
    app = new Hono<{ Bindings: Env; Variables: Variables }>();
    app.route('/api/leads', leadsRoutes);

    // Setup mock database
    mockDb = createMockD1();
    mockEnv = createMockEnv(mockDb);

    // Setup mock database service
    mockDbService = {
      queryFirst: vi.fn(),
      query: vi.fn(),
      execute: vi.fn(),
      insert: vi.fn(),
      delete: vi.fn(),
    };
    vi.mocked(createDatabaseService).mockReturnValue(
      mockDbService as unknown as ReturnType<typeof createDatabaseService>
    );

    // Default: Allow authenticated requests
    vi.mocked(authMiddleware.authenticateToken).mockImplementation(
      async (c: unknown, next: () => Promise<void>) => {
        const ctx = c as { set: (key: string, value: unknown) => void };
        ctx.set('user', { id: 'user-123', username: 'testuser' });
        await next();
      }
    );

    // Default: Allow rate-limited requests
    vi.mocked(rateLimiterModule.leadRateLimiter).mockReturnValue(
      async (c: unknown, next: () => Promise<void>) => {
        await next();
      }
    );

    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/leads', () => {
    const validLead = {
      name: 'John Doe',
      email: 'john@example.com',
      company: 'Example Corp',
      phone: '+1234567890',
      restaurant_type: 'Fine Dining',
      message: 'I am interested in your services',
      form_type: 'contact',
      source_page: '/contact',
    };

    beforeEach(() => {
      mockDbService.insert.mockResolvedValue(1);
    });

    it('should create a new lead with all fields', async () => {
      const req = new Request('http://localhost/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validLead),
      });

      const res = await app.fetch(req, mockEnv);
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body).toEqual({
        success: true,
        message: 'Lead captured successfully',
        leadId: 1,
      });
      expect(mockDbService.insert).toHaveBeenCalledWith('leads', {
        name: validLead.name,
        email: validLead.email,
        company: validLead.company,
        phone: validLead.phone,
        restaurant_type: validLead.restaurant_type,
        message: validLead.message,
        form_type: validLead.form_type,
        source_page: validLead.source_page,
      });
    });

    it('should create a lead with only required fields (name and email)', async () => {
      const minimalLead = {
        name: 'Jane Smith',
        email: 'jane@example.com',
      };

      const req = new Request('http://localhost/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(minimalLead),
      });

      const res = await app.fetch(req, mockEnv);
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.leadId).toBe(1);

      expect(mockDbService.insert).toHaveBeenCalledWith('leads', {
        name: minimalLead.name,
        email: minimalLead.email,
        company: null,
        phone: null,
        restaurant_type: null,
        message: null,
        form_type: 'contact',
        source_page: null,
      });
    });

    it('should return 400 when name is missing', async () => {
      const leadWithoutName = {
        email: 'john@example.com',
        company: 'Example Corp',
      };

      const req = new Request('http://localhost/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadWithoutName),
      });

      const res = await app.fetch(req, mockEnv);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Validation failed');
      expect(mockDbService.insert).not.toHaveBeenCalled();
    });

    it('should return 400 when email is missing', async () => {
      const leadWithoutEmail = {
        name: 'John Doe',
        company: 'Example Corp',
      };

      const req = new Request('http://localhost/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadWithoutEmail),
      });

      const res = await app.fetch(req, mockEnv);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Validation failed');
      expect(mockDbService.insert).not.toHaveBeenCalled();
    });

    it('should return 400 when both name and email are missing', async () => {
      const leadWithoutRequired = {
        company: 'Example Corp',
        phone: '+1234567890',
      };

      const req = new Request('http://localhost/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadWithoutRequired),
      });

      const res = await app.fetch(req, mockEnv);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.success).toBe(false);
      expect(mockDbService.insert).not.toHaveBeenCalled();
    });

    it('should return 400 when email is invalid', async () => {
      const leadWithInvalidEmail = {
        name: 'John Doe',
        email: 'not-an-email',
      };

      const req = new Request('http://localhost/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadWithInvalidEmail),
      });

      const res = await app.fetch(req, mockEnv);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Validation failed');
    });

    it('should apply rate limiting middleware', async () => {
      const req = new Request('http://localhost/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validLead),
      });

      await app.fetch(req, mockEnv);

      expect(rateLimiterModule.leadRateLimiter).toHaveBeenCalled();
    });

    it('should handle rate limit exceeded', async () => {
      vi.mocked(rateLimiterModule.leadRateLimiter).mockReturnValueOnce(
        async (c: { json: (body: unknown, status: number) => Response }) => {
          return c.json(
            {
              success: false,
              error: 'Too many form submissions from this IP, please try again later',
              code: 'RATE_LIMIT_EXCEEDED',
            },
            429
          );
        }
      );

      // Need to recreate app with new mock
      app = new Hono<{ Bindings: Env; Variables: Variables }>();
      app.route('/api/leads', leadsRoutes);

      const req = new Request('http://localhost/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validLead),
      });

      const res = await app.fetch(req, mockEnv);
      const body = await res.json();

      expect(res.status).toBe(429);
      expect(body.error).toContain('Too many');
    });

    it('should handle database errors gracefully', async () => {
      mockDbService.insert.mockRejectedValueOnce(new Error('Database connection error'));

      const req = new Request('http://localhost/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validLead),
      });

      const res = await app.fetch(req, mockEnv);
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body).toEqual({
        success: false,
        error: 'Failed to capture lead',
      });
    });

    it('should handle database insert returning null', async () => {
      mockDbService.insert.mockResolvedValueOnce(null);

      const req = new Request('http://localhost/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validLead),
      });

      const res = await app.fetch(req, mockEnv);
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body).toEqual({
        success: false,
        error: 'Failed to capture lead',
      });
    });

    it('should default form_type to "contact" when not provided', async () => {
      const leadWithoutFormType = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      const req = new Request('http://localhost/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadWithoutFormType),
      });

      await app.fetch(req, mockEnv);

      expect(mockDbService.insert).toHaveBeenCalledWith(
        'leads',
        expect.objectContaining({
          form_type: 'contact',
        })
      );
    });

    it('should accept valid form_type values', async () => {
      const leadWithFormType = {
        name: 'John Doe',
        email: 'john@example.com',
        form_type: 'demo',
      };

      const req = new Request('http://localhost/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadWithFormType),
      });

      await app.fetch(req, mockEnv);

      expect(mockDbService.insert).toHaveBeenCalledWith(
        'leads',
        expect.objectContaining({
          form_type: 'demo',
        })
      );
    });

    it('should reject invalid form_type values', async () => {
      const leadWithInvalidFormType = {
        name: 'John Doe',
        email: 'john@example.com',
        form_type: 'invalid-type',
      };

      const req = new Request('http://localhost/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadWithInvalidFormType),
      });

      const res = await app.fetch(req, mockEnv);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.success).toBe(false);
    });
  });

  describe('GET /api/leads', () => {
    const mockLeads = [
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        company: 'Example Corp',
        phone: '+1234567890',
        restaurant_type: 'Fine Dining',
        message: 'Interested in services',
        form_type: 'contact',
        source_page: '/contact',
        created_at: '2026-01-10T10:00:00Z',
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        company: 'Smith Restaurant',
        phone: '+0987654321',
        restaurant_type: 'Casual Dining',
        message: 'Need more info',
        form_type: 'demo',
        source_page: '/integrations',
        created_at: '2026-01-10T09:00:00Z',
      },
    ];

    describe('Authentication', () => {
      beforeEach(() => {
        vi.mocked(authMiddleware.authenticateToken).mockImplementation(
          async (c: { json: (body: unknown, status: number) => Response }) => {
            return c.json({ error: 'No token provided', code: 'NO_TOKEN' }, 401);
          }
        );
        // Recreate app with new mock
        app = new Hono<{ Bindings: Env; Variables: Variables }>();
        app.route('/api/leads', leadsRoutes);
      });

      it('should return 401 without authentication', async () => {
        const req = new Request('http://localhost/api/leads', {
          method: 'GET',
        });

        const res = await app.fetch(req, mockEnv);
        const body = await res.json();

        expect(res.status).toBe(401);
        expect(body).toHaveProperty('error');
        expect(authMiddleware.authenticateToken).toHaveBeenCalled();
      });
    });

    describe('Authenticated Requests', () => {
      beforeEach(() => {
        vi.mocked(authMiddleware.authenticateToken).mockImplementation(
          async (c: unknown, next: () => Promise<void>) => {
            const ctx = c as { set: (key: string, value: unknown) => void };
            ctx.set('user', { id: 'user-123', username: 'testuser' });
            await next();
          }
        );
        // Recreate app with new mock
        app = new Hono<{ Bindings: Env; Variables: Variables }>();
        app.route('/api/leads', leadsRoutes);
      });

      it('should return leads with default pagination (page 1, limit 50)', async () => {
        mockDbService.query.mockResolvedValueOnce(mockLeads);
        mockDbService.queryFirst.mockResolvedValueOnce({ count: 2 });

        const req = new Request('http://localhost/api/leads', {
          method: 'GET',
        });

        const res = await app.fetch(req, mockEnv);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body).toEqual({
          success: true,
          leads: mockLeads,
          pagination: {
            page: 1,
            limit: 50,
            total: 2,
            pages: 1,
          },
        });
      });

      it('should return leads with custom pagination (page 2, limit 10)', async () => {
        mockDbService.query.mockResolvedValueOnce(mockLeads);
        mockDbService.queryFirst.mockResolvedValueOnce({ count: 25 });

        const req = new Request('http://localhost/api/leads?page=2&limit=10', {
          method: 'GET',
        });

        const res = await app.fetch(req, mockEnv);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.pagination).toEqual({
          page: 2,
          limit: 10,
          total: 25,
          pages: 3,
        });
      });

      it('should return leads with page 3, limit 20', async () => {
        mockDbService.query.mockResolvedValueOnce([]);
        mockDbService.queryFirst.mockResolvedValueOnce({ count: 100 });

        const req = new Request('http://localhost/api/leads?page=3&limit=20', {
          method: 'GET',
        });

        const res = await app.fetch(req, mockEnv);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.pagination).toEqual({
          page: 3,
          limit: 20,
          total: 100,
          pages: 5,
        });
      });

      it('should return empty array when no leads exist', async () => {
        mockDbService.query.mockResolvedValueOnce([]);
        mockDbService.queryFirst.mockResolvedValueOnce({ count: 0 });

        const req = new Request('http://localhost/api/leads', {
          method: 'GET',
        });

        const res = await app.fetch(req, mockEnv);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body).toEqual({
          success: true,
          leads: [],
          pagination: {
            page: 1,
            limit: 50,
            total: 0,
            pages: 0,
          },
        });
      });

      it('should handle database errors gracefully', async () => {
        mockDbService.query.mockRejectedValueOnce(new Error('Database connection error'));

        const req = new Request('http://localhost/api/leads', {
          method: 'GET',
        });

        const res = await app.fetch(req, mockEnv);
        const body = await res.json();

        expect(res.status).toBe(500);
        expect(body).toEqual({
          success: false,
          error: 'Failed to fetch leads',
        });
      });

      it('should cap limit at 100', async () => {
        mockDbService.query.mockResolvedValueOnce([]);
        mockDbService.queryFirst.mockResolvedValueOnce({ count: 0 });

        const req = new Request('http://localhost/api/leads?limit=500', {
          method: 'GET',
        });

        const res = await app.fetch(req, mockEnv);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.pagination.limit).toBe(100);
      });
    });
  });

  describe('GET /api/leads/stats', () => {
    const mockStats = {
      total: { count: 100 },
      today: { count: 5 },
      thisWeek: { count: 15 },
      thisMonth: { count: 30 },
      byType: [
        { form_type: 'contact', count: 60 },
        { form_type: 'demo', count: 40 },
      ],
      bySource: [
        { source: '/contact', count: 45 },
        { source: '/integrations', count: 30 },
        { source: '/home', count: 15 },
        { source: '/pricing', count: 10 },
      ],
    };

    describe('Authentication', () => {
      beforeEach(() => {
        vi.mocked(authMiddleware.authenticateToken).mockImplementation(
          async (c: { json: (body: unknown, status: number) => Response }) => {
            return c.json({ error: 'No token provided', code: 'NO_TOKEN' }, 401);
          }
        );
        app = new Hono<{ Bindings: Env; Variables: Variables }>();
        app.route('/api/leads', leadsRoutes);
      });

      it('should return 401 without authentication', async () => {
        const req = new Request('http://localhost/api/leads/stats', {
          method: 'GET',
        });

        const res = await app.fetch(req, mockEnv);
        const body = await res.json();

        expect(res.status).toBe(401);
        expect(body).toHaveProperty('error');
        expect(authMiddleware.authenticateToken).toHaveBeenCalled();
      });
    });

    describe('Authenticated Requests', () => {
      beforeEach(() => {
        vi.mocked(authMiddleware.authenticateToken).mockImplementation(
          async (c: unknown, next: () => Promise<void>) => {
            const ctx = c as { set: (key: string, value: unknown) => void };
            ctx.set('user', { id: 'user-123', username: 'testuser' });
            await next();
          }
        );
        app = new Hono<{ Bindings: Env; Variables: Variables }>();
        app.route('/api/leads', leadsRoutes);
      });

      it('should return lead statistics', async () => {
        mockDbService.queryFirst
          .mockResolvedValueOnce(mockStats.total)
          .mockResolvedValueOnce(mockStats.today)
          .mockResolvedValueOnce(mockStats.thisWeek)
          .mockResolvedValueOnce(mockStats.thisMonth);
        mockDbService.query
          .mockResolvedValueOnce(mockStats.byType)
          .mockResolvedValueOnce(mockStats.bySource);

        const req = new Request('http://localhost/api/leads/stats', {
          method: 'GET',
        });

        const res = await app.fetch(req, mockEnv);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body).toEqual({
          success: true,
          stats: {
            total: 100,
            today: 5,
            thisWeek: 15,
            thisMonth: 30,
            byType: mockStats.byType,
            bySource: mockStats.bySource,
          },
        });
      });

      it('should return zero values when no leads exist', async () => {
        mockDbService.queryFirst
          .mockResolvedValueOnce({ count: 0 })
          .mockResolvedValueOnce({ count: 0 })
          .mockResolvedValueOnce({ count: 0 })
          .mockResolvedValueOnce({ count: 0 });
        mockDbService.query.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

        const req = new Request('http://localhost/api/leads/stats', {
          method: 'GET',
        });

        const res = await app.fetch(req, mockEnv);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.stats).toEqual({
          total: 0,
          today: 0,
          thisWeek: 0,
          thisMonth: 0,
          byType: [],
          bySource: [],
        });
      });

      it('should handle database errors gracefully', async () => {
        mockDbService.queryFirst.mockRejectedValueOnce(new Error('Database connection error'));

        const req = new Request('http://localhost/api/leads/stats', {
          method: 'GET',
        });

        const res = await app.fetch(req, mockEnv);
        const body = await res.json();

        expect(res.status).toBe(500);
        expect(body).toEqual({
          success: false,
          error: 'Failed to fetch stats',
        });
      });
    });
  });

  describe('GET /api/leads/:id', () => {
    const mockLead = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      company: 'Example Corp',
      phone: '+1234567890',
      restaurant_type: 'Fine Dining',
      message: 'Interested in services',
      form_type: 'contact',
      source_page: '/contact',
      created_at: '2026-01-10T10:00:00Z',
    };

    describe('Authentication', () => {
      beforeEach(() => {
        vi.mocked(authMiddleware.authenticateToken).mockImplementation(
          async (c: { json: (body: unknown, status: number) => Response }) => {
            return c.json({ error: 'No token provided', code: 'NO_TOKEN' }, 401);
          }
        );
        app = new Hono<{ Bindings: Env; Variables: Variables }>();
        app.route('/api/leads', leadsRoutes);
      });

      it('should return 401 without authentication', async () => {
        const req = new Request('http://localhost/api/leads/1', {
          method: 'GET',
        });

        const res = await app.fetch(req, mockEnv);
        const body = await res.json();

        expect(res.status).toBe(401);
        expect(body).toHaveProperty('error');
        expect(authMiddleware.authenticateToken).toHaveBeenCalled();
      });
    });

    describe('Authenticated Requests', () => {
      beforeEach(() => {
        vi.mocked(authMiddleware.authenticateToken).mockImplementation(
          async (c: unknown, next: () => Promise<void>) => {
            const ctx = c as { set: (key: string, value: unknown) => void };
            ctx.set('user', { id: 'user-123', username: 'testuser' });
            await next();
          }
        );
        app = new Hono<{ Bindings: Env; Variables: Variables }>();
        app.route('/api/leads', leadsRoutes);
      });

      it('should return a single lead by id', async () => {
        mockDbService.queryFirst.mockResolvedValueOnce(mockLead);

        const req = new Request('http://localhost/api/leads/1', {
          method: 'GET',
        });

        const res = await app.fetch(req, mockEnv);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body).toEqual({
          success: true,
          lead: mockLead,
        });
      });

      it('should return 404 when lead is not found', async () => {
        mockDbService.queryFirst.mockResolvedValueOnce(null);

        const req = new Request('http://localhost/api/leads/999', {
          method: 'GET',
        });

        const res = await app.fetch(req, mockEnv);
        const body = await res.json();

        expect(res.status).toBe(404);
        expect(body).toEqual({
          success: false,
          error: 'Lead not found',
        });
      });

      it('should return 400 for invalid lead ID format', async () => {
        const req = new Request('http://localhost/api/leads/abc', {
          method: 'GET',
        });

        const res = await app.fetch(req, mockEnv);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.success).toBe(false);
        expect(body.error).toBe('Invalid lead ID');
      });

      it('should handle database errors gracefully', async () => {
        mockDbService.queryFirst.mockRejectedValueOnce(new Error('Database connection error'));

        const req = new Request('http://localhost/api/leads/1', {
          method: 'GET',
        });

        const res = await app.fetch(req, mockEnv);
        const body = await res.json();

        expect(res.status).toBe(500);
        expect(body).toEqual({
          success: false,
          error: 'Failed to fetch lead',
        });
      });
    });
  });

  describe('DELETE /api/leads/:id', () => {
    describe('Authentication', () => {
      beforeEach(() => {
        vi.mocked(authMiddleware.authenticateToken).mockImplementation(
          async (c: { json: (body: unknown, status: number) => Response }) => {
            return c.json({ error: 'No token provided', code: 'NO_TOKEN' }, 401);
          }
        );
        app = new Hono<{ Bindings: Env; Variables: Variables }>();
        app.route('/api/leads', leadsRoutes);
      });

      it('should return 401 without authentication', async () => {
        const req = new Request('http://localhost/api/leads/1', {
          method: 'DELETE',
        });

        const res = await app.fetch(req, mockEnv);
        const body = await res.json();

        expect(res.status).toBe(401);
        expect(body).toHaveProperty('error');
        expect(authMiddleware.authenticateToken).toHaveBeenCalled();
      });
    });

    describe('Authenticated Requests', () => {
      beforeEach(() => {
        vi.mocked(authMiddleware.authenticateToken).mockImplementation(
          async (c: unknown, next: () => Promise<void>) => {
            const ctx = c as { set: (key: string, value: unknown) => void };
            ctx.set('user', { id: 'user-123', username: 'testuser' });
            await next();
          }
        );
        app = new Hono<{ Bindings: Env; Variables: Variables }>();
        app.route('/api/leads', leadsRoutes);
      });

      it('should delete a lead successfully', async () => {
        mockDbService.delete.mockResolvedValueOnce(1);

        const req = new Request('http://localhost/api/leads/1', {
          method: 'DELETE',
        });

        const res = await app.fetch(req, mockEnv);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body).toEqual({
          success: true,
          message: 'Lead deleted successfully',
        });
        expect(mockDbService.delete).toHaveBeenCalledWith('leads', 'id = ?', ['1']);
      });

      it('should return 404 when lead to delete is not found', async () => {
        mockDbService.delete.mockResolvedValueOnce(0);

        const req = new Request('http://localhost/api/leads/999', {
          method: 'DELETE',
        });

        const res = await app.fetch(req, mockEnv);
        const body = await res.json();

        expect(res.status).toBe(404);
        expect(body).toEqual({
          success: false,
          error: 'Lead not found',
        });
      });

      it('should return 400 for invalid lead ID format', async () => {
        const req = new Request('http://localhost/api/leads/abc', {
          method: 'DELETE',
        });

        const res = await app.fetch(req, mockEnv);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.success).toBe(false);
        expect(body.error).toBe('Invalid lead ID');
      });

      it('should handle database errors gracefully', async () => {
        mockDbService.delete.mockRejectedValueOnce(new Error('Database connection error'));

        const req = new Request('http://localhost/api/leads/1', {
          method: 'DELETE',
        });

        const res = await app.fetch(req, mockEnv);
        const body = await res.json();

        expect(res.status).toBe(500);
        expect(body).toEqual({
          success: false,
          error: 'Failed to delete lead',
        });
      });
    });
  });
});

describe('Leads Routes - Input Validation', () => {
  let app: Hono<{ Bindings: Env; Variables: Variables }>;
  let mockEnv: Env;

  beforeEach(() => {
    app = new Hono<{ Bindings: Env; Variables: Variables }>();
    app.route('/api/leads', leadsRoutes);
    mockEnv = createMockEnv(createMockD1());

    // Allow rate limiting
    vi.mocked(rateLimiterModule.leadRateLimiter).mockReturnValue(
      async (c: unknown, next: () => Promise<void>) => {
        await next();
      }
    );

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should reject empty name', async () => {
    const req = new Request('http://localhost/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '', email: 'test@example.com' }),
    });

    const res = await app.fetch(req, mockEnv);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
  });

  it('should reject name exceeding max length', async () => {
    const longName = 'a'.repeat(201);
    const req = new Request('http://localhost/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: longName, email: 'test@example.com' }),
    });

    const res = await app.fetch(req, mockEnv);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
  });

  it('should reject message exceeding max length', async () => {
    const longMessage = 'a'.repeat(5001);
    const req = new Request('http://localhost/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Doe',
        email: 'test@example.com',
        message: longMessage,
      }),
    });

    const res = await app.fetch(req, mockEnv);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
  });
});
