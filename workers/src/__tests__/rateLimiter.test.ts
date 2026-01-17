/**
 * Unit tests for KV-based Rate Limiter Middleware
 *
 * Tests the rate limiter middleware including:
 * - createRateLimiter() factory function
 * - 429 Too Many Requests responses
 * - Rate limit window handling
 * - Rate limit headers
 * - skipSuccessfulRequests option
 * - Custom handlers
 * - KV error handling (fail open)
 * - Pre-configured rate limiters (login, lead, api, setup)
 * - Environment-aware configuration
 *
 * Uses vitest with @cloudflare/vitest-pool-workers for Cloudflare Workers testing.
 */

/// <reference types="@cloudflare/workers-types" />

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Hono } from 'hono';
import type { Context } from 'hono';
import type { Env, Variables } from '../types/bindings';

// Type for JSON response bodies in tests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonBody = Record<string, any>;
import {
  createRateLimiter,
  loginRateLimiter,
  leadRateLimiter,
  apiRateLimiter,
  setupRateLimiter,
  customRateLimiter,
} from '../middleware/rateLimiter';

// Mock KV namespace
interface MockKVNamespace {
  get: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
}

/**
 * Helper to create a mock KV namespace
 */
function createMockKV(): MockKVNamespace {
  return {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  };
}

/**
 * Helper to create mock environment
 */
function createMockEnv(kv: MockKVNamespace, envOverrides: Partial<Env> = {}): Env {
  return {
    DB: {} as D1Database,
    CACHE: kv as unknown as KVNamespace,
    UPLOADS: {} as R2Bucket,
    ENVIRONMENT: 'test',
    ALLOWED_ORIGINS: 'http://localhost:3000',
    LOG_LEVEL: 'debug',
    RATE_LIMIT_WINDOW_MS: '60000',
    RATE_LIMIT_MAX_REQUESTS: '100',
    JWT_SECRET: 'test-jwt-secret',
    EMAIL_API_KEY: 'test-email-key',
    ADMIN_EMAIL: 'test@example.com',
    SETUP_SECRET_TOKEN: 'test-setup-token',
    ...envOverrides,
  };
}

describe('createRateLimiter', () => {
  let mockKV: MockKVNamespace;
  let app: Hono<{ Bindings: Env; Variables: Variables }>;
  let mockEnv: Env;

  beforeEach(() => {
    mockKV = createMockKV();
    mockEnv = createMockEnv(mockKV);
    app = new Hono<{ Bindings: Env; Variables: Variables }>();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rate Limiting', () => {
    it('should allow requests within rate limit', async () => {
      const limiter = createRateLimiter({
        type: 'test',
        windowMs: 60000,
        max: 10,
        message: 'Too many requests',
      });

      // Mock no existing record (first request)
      mockKV.get.mockResolvedValue(null);
      mockKV.put.mockResolvedValue(undefined);

      app.use('/test', limiter);
      app.get('/test', (c) => c.json({ success: true }));

      const req = new Request('http://localhost/test', {
        method: 'GET',
        headers: { 'CF-Connecting-IP': '1.2.3.4' },
      });

      const res = await app.fetch(req, mockEnv);

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ success: true });
    });

    it('should return 429 when rate limit exceeded', async () => {
      const limiter = createRateLimiter({
        type: 'test',
        windowMs: 60000,
        max: 5,
        message: 'Rate limit exceeded',
      });

      // Mock existing record at the limit
      const existingRecord = JSON.stringify({
        count: 5,
        firstRequest: Date.now(),
      });
      mockKV.get.mockResolvedValue(existingRecord);
      mockKV.put.mockResolvedValue(undefined);

      app.use('/test', limiter);
      app.get('/test', (c) => c.json({ success: true }));

      const req = new Request('http://localhost/test', {
        method: 'GET',
        headers: { 'CF-Connecting-IP': '1.2.3.4' },
      });

      const res = await app.fetch(req, mockEnv);
      const body = await res.json();

      expect(res.status).toBe(429);
      expect(body).toHaveProperty('error', 'Rate limit exceeded');
      expect(body).toHaveProperty('code', 'RATE_LIMIT_EXCEEDED');
      expect(body).toHaveProperty('retryAfter');
    });

    it('should increment count for subsequent requests', async () => {
      const limiter = createRateLimiter({
        type: 'test',
        windowMs: 60000,
        max: 10,
        message: 'Too many requests',
      });

      const now = Date.now();
      const existingRecord = JSON.stringify({
        count: 3,
        firstRequest: now - 10000, // 10 seconds ago
      });
      mockKV.get.mockResolvedValue(existingRecord);
      mockKV.put.mockResolvedValue(undefined);

      app.use('/test', limiter);
      app.get('/test', (c) => c.json({ success: true }));

      const req = new Request('http://localhost/test', {
        method: 'GET',
        headers: { 'CF-Connecting-IP': '1.2.3.4' },
      });

      await app.fetch(req, mockEnv);

      // Verify put was called with incremented count
      expect(mockKV.put).toHaveBeenCalled();
      const putCall = mockKV.put.mock.calls[0];
      const savedRecord = JSON.parse(putCall[1]);
      expect(savedRecord.count).toBe(4);
    });
  });

  describe('Rate Limit Headers', () => {
    it('should set X-RateLimit headers on successful requests', async () => {
      const limiter = createRateLimiter({
        type: 'test',
        windowMs: 60000,
        max: 100,
        message: 'Too many requests',
      });

      const now = Date.now();
      const existingRecord = JSON.stringify({
        count: 10,
        firstRequest: now,
      });
      mockKV.get.mockResolvedValue(existingRecord);
      mockKV.put.mockResolvedValue(undefined);

      app.use('/test', limiter);
      app.get('/test', (c) => c.json({ success: true }));

      const req = new Request('http://localhost/test', {
        method: 'GET',
        headers: { 'CF-Connecting-IP': '1.2.3.4' },
      });

      const res = await app.fetch(req, mockEnv);

      expect(res.headers.get('X-RateLimit-Limit')).toBe('100');
      expect(res.headers.get('X-RateLimit-Remaining')).toBe('89'); // 100 - 11 = 89
      expect(res.headers.get('X-RateLimit-Reset')).toBeTruthy();
    });

    it('should include Retry-After header when rate limited', async () => {
      const limiter = createRateLimiter({
        type: 'test',
        windowMs: 60000,
        max: 5,
        message: 'Rate limit exceeded',
      });

      const now = Date.now();
      const existingRecord = JSON.stringify({
        count: 5,
        firstRequest: now,
      });
      mockKV.get.mockResolvedValue(existingRecord);

      app.use('/test', limiter);
      app.get('/test', (c) => c.json({ success: true }));

      const req = new Request('http://localhost/test', {
        method: 'GET',
        headers: { 'CF-Connecting-IP': '1.2.3.4' },
      });

      const res = await app.fetch(req, mockEnv);

      expect(res.status).toBe(429);
      expect(res.headers.get('Retry-After')).toBeTruthy();
      expect(res.headers.get('X-RateLimit-Remaining')).toBe('0');
    });
  });

  describe('Window Expiration', () => {
    it('should reset count when window expires', async () => {
      const limiter = createRateLimiter({
        type: 'test',
        windowMs: 60000, // 1 minute
        max: 10,
        message: 'Too many requests',
      });

      // Mock record from 2 minutes ago (window expired)
      const oldRecord = JSON.stringify({
        count: 100,
        firstRequest: Date.now() - 120000, // 2 minutes ago
      });
      mockKV.get.mockResolvedValue(oldRecord);
      mockKV.put.mockResolvedValue(undefined);

      app.use('/test', limiter);
      app.get('/test', (c) => c.json({ success: true }));

      const req = new Request('http://localhost/test', {
        method: 'GET',
        headers: { 'CF-Connecting-IP': '1.2.3.4' },
      });

      const res = await app.fetch(req, mockEnv);

      expect(res.status).toBe(200);

      // Verify the record was reset
      const putCall = mockKV.put.mock.calls[0];
      const savedRecord = JSON.parse(putCall[1]);
      expect(savedRecord.count).toBe(1);
    });
  });

  describe('Client IP Extraction', () => {
    it('should use CF-Connecting-IP header for IP identification', async () => {
      const limiter = createRateLimiter({
        type: 'test',
        windowMs: 60000,
        max: 10,
        message: 'Too many requests',
      });

      mockKV.get.mockResolvedValue(null);
      mockKV.put.mockResolvedValue(undefined);

      app.use('/test', limiter);
      app.get('/test', (c) => c.json({ success: true }));

      const req = new Request('http://localhost/test', {
        method: 'GET',
        headers: { 'CF-Connecting-IP': '192.168.1.100' },
      });

      await app.fetch(req, mockEnv);

      // Verify KV key includes the IP
      expect(mockKV.get).toHaveBeenCalledWith('ratelimit:test:192.168.1.100');
    });

    it('should fall back to X-Forwarded-For header', async () => {
      const limiter = createRateLimiter({
        type: 'test',
        windowMs: 60000,
        max: 10,
        message: 'Too many requests',
      });

      mockKV.get.mockResolvedValue(null);
      mockKV.put.mockResolvedValue(undefined);

      app.use('/test', limiter);
      app.get('/test', (c) => c.json({ success: true }));

      const req = new Request('http://localhost/test', {
        method: 'GET',
        headers: { 'X-Forwarded-For': '10.0.0.1, 10.0.0.2' },
      });

      await app.fetch(req, mockEnv);

      // Should use first IP from X-Forwarded-For
      expect(mockKV.get).toHaveBeenCalledWith('ratelimit:test:10.0.0.1');
    });

    it('should fall back to X-Real-IP header', async () => {
      const limiter = createRateLimiter({
        type: 'test',
        windowMs: 60000,
        max: 10,
        message: 'Too many requests',
      });

      mockKV.get.mockResolvedValue(null);
      mockKV.put.mockResolvedValue(undefined);

      app.use('/test', limiter);
      app.get('/test', (c) => c.json({ success: true }));

      const req = new Request('http://localhost/test', {
        method: 'GET',
        headers: { 'X-Real-IP': '172.16.0.50' },
      });

      await app.fetch(req, mockEnv);

      expect(mockKV.get).toHaveBeenCalledWith('ratelimit:test:172.16.0.50');
    });

    it('should use "unknown" when no IP headers present', async () => {
      const limiter = createRateLimiter({
        type: 'test',
        windowMs: 60000,
        max: 10,
        message: 'Too many requests',
      });

      mockKV.get.mockResolvedValue(null);
      mockKV.put.mockResolvedValue(undefined);

      app.use('/test', limiter);
      app.get('/test', (c) => c.json({ success: true }));

      const req = new Request('http://localhost/test', {
        method: 'GET',
      });

      await app.fetch(req, mockEnv);

      expect(mockKV.get).toHaveBeenCalledWith('ratelimit:test:unknown');
    });
  });

  describe('skipSuccessfulRequests Option', () => {
    it('should decrement count for successful requests when enabled', async () => {
      const limiter = createRateLimiter({
        type: 'test',
        windowMs: 60000,
        max: 10,
        message: 'Too many requests',
        skipSuccessfulRequests: true,
      });

      const now = Date.now();
      const existingRecord = JSON.stringify({
        count: 5,
        firstRequest: now,
      });
      mockKV.get.mockResolvedValue(existingRecord);
      mockKV.put.mockResolvedValue(undefined);

      app.use('/test', limiter);
      app.get('/test', (c) => c.json({ success: true })); // Status 200

      const req = new Request('http://localhost/test', {
        method: 'GET',
        headers: { 'CF-Connecting-IP': '1.2.3.4' },
      });

      await app.fetch(req, mockEnv);

      // Should have been called twice: once before handler, once after (to decrement)
      expect(mockKV.put).toHaveBeenCalledTimes(2);

      // Second call should have decremented count
      const secondPutCall = mockKV.put.mock.calls[1];
      const savedRecord = JSON.parse(secondPutCall[1]);
      expect(savedRecord.count).toBe(5); // 6 - 1 = 5
    });

    it('should not decrement count for failed requests (status >= 400)', async () => {
      const limiter = createRateLimiter({
        type: 'test',
        windowMs: 60000,
        max: 10,
        message: 'Too many requests',
        skipSuccessfulRequests: true,
      });

      const now = Date.now();
      const existingRecord = JSON.stringify({
        count: 5,
        firstRequest: now,
      });
      mockKV.get.mockResolvedValue(existingRecord);
      mockKV.put.mockResolvedValue(undefined);

      app.use('/test', limiter);
      app.get('/test', (c) => c.json({ error: 'Bad request' }, 400));

      const req = new Request('http://localhost/test', {
        method: 'GET',
        headers: { 'CF-Connecting-IP': '1.2.3.4' },
      });

      await app.fetch(req, mockEnv);

      // Should only be called once (before handler)
      expect(mockKV.put).toHaveBeenCalledTimes(1);
    });
  });

  describe('Custom Handler', () => {
    it('should use custom handler when rate limit exceeded', async () => {
      const customHandler = vi.fn((c: Context, remainingTime: number) => {
        return c.json({ custom: true, wait: remainingTime }, 429);
      });

      const limiter = createRateLimiter({
        type: 'test',
        windowMs: 60000,
        max: 5,
        message: 'Rate limit exceeded',
        handler: customHandler as unknown as (c: Context<{ Bindings: Env; Variables: Variables }>, remainingTime: number) => Response,
      });

      const now = Date.now();
      const existingRecord = JSON.stringify({
        count: 5,
        firstRequest: now,
      });
      mockKV.get.mockResolvedValue(existingRecord);

      app.use('/test', limiter);
      app.get('/test', (c) => c.json({ success: true }));

      const req = new Request('http://localhost/test', {
        method: 'GET',
        headers: { 'CF-Connecting-IP': '1.2.3.4' },
      });

      const res = await app.fetch(req, mockEnv);
      const body = await res.json();

      expect(res.status).toBe(429);
      expect(body).toHaveProperty('custom', true);
      expect(body).toHaveProperty('wait');
      expect(customHandler).toHaveBeenCalled();
    });
  });

  describe('KV Error Handling (Fail Open)', () => {
    it('should continue request when KV get fails', async () => {
      const limiter = createRateLimiter({
        type: 'test',
        windowMs: 60000,
        max: 10,
        message: 'Too many requests',
      });

      // Simulate KV error
      mockKV.get.mockRejectedValue(new Error('KV unavailable'));

      app.use('/test', limiter);
      app.get('/test', (c) => c.json({ success: true }));

      const req = new Request('http://localhost/test', {
        method: 'GET',
        headers: { 'CF-Connecting-IP': '1.2.3.4' },
      });

      const res = await app.fetch(req, mockEnv);

      // Should allow the request (fail open)
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ success: true });
    });

    it('should continue request when KV put fails', async () => {
      const limiter = createRateLimiter({
        type: 'test',
        windowMs: 60000,
        max: 10,
        message: 'Too many requests',
      });

      mockKV.get.mockResolvedValue(null);
      mockKV.put.mockRejectedValue(new Error('KV write failed'));

      app.use('/test', limiter);
      app.get('/test', (c) => c.json({ success: true }));

      const req = new Request('http://localhost/test', {
        method: 'GET',
        headers: { 'CF-Connecting-IP': '1.2.3.4' },
      });

      const res = await app.fetch(req, mockEnv);

      // Should allow the request (fail open)
      expect(res.status).toBe(200);
    });
  });

  describe('TTL Expiration', () => {
    it('should set expirationTtl when storing record', async () => {
      const limiter = createRateLimiter({
        type: 'test',
        windowMs: 120000, // 2 minutes = 120 seconds
        max: 10,
        message: 'Too many requests',
      });

      mockKV.get.mockResolvedValue(null);
      mockKV.put.mockResolvedValue(undefined);

      app.use('/test', limiter);
      app.get('/test', (c) => c.json({ success: true }));

      const req = new Request('http://localhost/test', {
        method: 'GET',
        headers: { 'CF-Connecting-IP': '1.2.3.4' },
      });

      await app.fetch(req, mockEnv);

      // Verify expirationTtl was set correctly
      expect(mockKV.put).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        { expirationTtl: 120 }
      );
    });
  });
});

describe('Pre-configured Rate Limiters', () => {
  let mockKV: MockKVNamespace;

  beforeEach(() => {
    vi.clearAllMocks();
    mockKV = createMockKV();
    mockKV.get.mockResolvedValue(null);
    mockKV.put.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('loginRateLimiter', () => {
    it('should create a rate limiter for login endpoints', async () => {
      const mockEnv = createMockEnv(mockKV, { ENVIRONMENT: 'production' });
      const app = new Hono<{ Bindings: Env; Variables: Variables }>();

      app.use('/login', loginRateLimiter());
      app.post('/login', (c) => c.json({ success: true }));

      const req = new Request('http://localhost/login', {
        method: 'POST',
        headers: {
          'CF-Connecting-IP': '1.2.3.4',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const res = await app.fetch(req, mockEnv);

      expect(res.status).toBe(200);
      // Verify it uses 'login' type for KV key
      expect(mockKV.get).toHaveBeenCalledWith('ratelimit:login:1.2.3.4');
    });

    it('should use production limits in production environment', async () => {
      // Clear RATE_LIMIT_MAX_REQUESTS to use default production limits (20)
      const mockEnv = createMockEnv(mockKV, {
        ENVIRONMENT: 'production',
        RATE_LIMIT_MAX_REQUESTS: '', // Empty to use defaults
      });
      const app = new Hono<{ Bindings: Env; Variables: Variables }>();

      // Set count above production limit (20) - rate limit triggers when count > max
      const existingRecord = JSON.stringify({
        count: 21,
        firstRequest: Date.now(),
      });
      mockKV.get.mockResolvedValue(existingRecord);

      app.use('/login', loginRateLimiter());
      app.post('/login', (c) => c.json({ success: true }));

      const req = new Request('http://localhost/login', {
        method: 'POST',
        headers: {
          'CF-Connecting-IP': '1.2.3.4',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const res = await app.fetch(req, mockEnv);
      const body: JsonBody = await res.json();

      // Should be rate limited (count > 20)
      expect(res.status).toBe(429);
      expect(body).toHaveProperty('error');
      expect(body.error).toContain('Too many login attempts');
    });

    it('should use development limits in development environment', async () => {
      const mockEnv = createMockEnv(mockKV, { ENVIRONMENT: 'development' });
      const app = new Hono<{ Bindings: Env; Variables: Variables }>();

      // Set count at 50 (below development limit of 100)
      const existingRecord = JSON.stringify({
        count: 50,
        firstRequest: Date.now(),
      });
      mockKV.get.mockResolvedValue(existingRecord);

      app.use('/login', loginRateLimiter());
      app.post('/login', (c) => c.json({ success: true }));

      const req = new Request('http://localhost/login', {
        method: 'POST',
        headers: {
          'CF-Connecting-IP': '1.2.3.4',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const res = await app.fetch(req, mockEnv);

      // Should not be rate limited (count < 100)
      expect(res.status).toBe(200);
    });
  });

  describe('leadRateLimiter', () => {
    it('should create a rate limiter for lead form submissions', async () => {
      const mockEnv = createMockEnv(mockKV);
      const app = new Hono<{ Bindings: Env; Variables: Variables }>();

      app.use('/leads', leadRateLimiter());
      app.post('/leads', (c) => c.json({ success: true }));

      const req = new Request('http://localhost/leads', {
        method: 'POST',
        headers: {
          'CF-Connecting-IP': '1.2.3.4',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const res = await app.fetch(req, mockEnv);

      expect(res.status).toBe(200);
      expect(mockKV.get).toHaveBeenCalledWith('ratelimit:lead:1.2.3.4');
    });

    it('should enforce strict rate limits for spam prevention', async () => {
      // Clear RATE_LIMIT_MAX_REQUESTS to use default production limits (10)
      const mockEnv = createMockEnv(mockKV, {
        ENVIRONMENT: 'production',
        RATE_LIMIT_MAX_REQUESTS: '', // Empty to use defaults
      });
      const app = new Hono<{ Bindings: Env; Variables: Variables }>();

      // Set count above production limit (10) - rate limit triggers when count > max
      const existingRecord = JSON.stringify({
        count: 11,
        firstRequest: Date.now(),
      });
      mockKV.get.mockResolvedValue(existingRecord);

      app.use('/leads', leadRateLimiter());
      app.post('/leads', (c) => c.json({ success: true }));

      const req = new Request('http://localhost/leads', {
        method: 'POST',
        headers: {
          'CF-Connecting-IP': '1.2.3.4',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const res = await app.fetch(req, mockEnv);
      const body: JsonBody = await res.json();

      expect(res.status).toBe(429);
      expect(body.error).toContain('Too many form submissions');
    });
  });

  describe('apiRateLimiter', () => {
    it('should create a rate limiter for general API endpoints', async () => {
      const mockEnv = createMockEnv(mockKV);
      const app = new Hono<{ Bindings: Env; Variables: Variables }>();

      app.use('/api/*', apiRateLimiter());
      app.get('/api/data', (c) => c.json({ data: 'test' }));

      const req = new Request('http://localhost/api/data', {
        method: 'GET',
        headers: { 'CF-Connecting-IP': '1.2.3.4' },
      });

      const res = await app.fetch(req, mockEnv);

      expect(res.status).toBe(200);
      expect(mockKV.get).toHaveBeenCalledWith('ratelimit:api:1.2.3.4');
    });

    it('should have high limits for API abuse protection', async () => {
      // Don't set RATE_LIMIT_MAX_REQUESTS to use default production limits (1000)
      const mockEnv = createMockEnv(mockKV, {
        ENVIRONMENT: 'production',
        RATE_LIMIT_MAX_REQUESTS: '', // Empty to use defaults
      });
      const app = new Hono<{ Bindings: Env; Variables: Variables }>();

      // Set count at 500 (below production limit of 1000)
      const existingRecord = JSON.stringify({
        count: 500,
        firstRequest: Date.now(),
      });
      mockKV.get.mockResolvedValue(existingRecord);

      app.use('/api/*', apiRateLimiter());
      app.get('/api/data', (c) => c.json({ data: 'test' }));

      const req = new Request('http://localhost/api/data', {
        method: 'GET',
        headers: { 'CF-Connecting-IP': '1.2.3.4' },
      });

      const res = await app.fetch(req, mockEnv);

      // Should not be rate limited yet
      expect(res.status).toBe(200);
    });
  });

  describe('setupRateLimiter', () => {
    it('should create a strict rate limiter for setup endpoint', async () => {
      const mockEnv = createMockEnv(mockKV);
      const app = new Hono<{ Bindings: Env; Variables: Variables }>();

      app.use('/setup', setupRateLimiter());
      app.post('/setup', (c) => c.json({ success: true }));

      const req = new Request('http://localhost/setup', {
        method: 'POST',
        headers: {
          'CF-Connecting-IP': '1.2.3.4',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const res = await app.fetch(req, mockEnv);

      expect(res.status).toBe(200);
      expect(mockKV.get).toHaveBeenCalledWith('ratelimit:setup:1.2.3.4');
    });

    it('should enforce very strict limits (5 attempts)', async () => {
      const mockEnv = createMockEnv(mockKV);
      const app = new Hono<{ Bindings: Env; Variables: Variables }>();

      // Set count at limit (5)
      const existingRecord = JSON.stringify({
        count: 5,
        firstRequest: Date.now(),
      });
      mockKV.get.mockResolvedValue(existingRecord);

      app.use('/setup', setupRateLimiter());
      app.post('/setup', (c) => c.json({ success: true }));

      const req = new Request('http://localhost/setup', {
        method: 'POST',
        headers: {
          'CF-Connecting-IP': '1.2.3.4',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const res = await app.fetch(req, mockEnv);
      const body: JsonBody = await res.json();

      expect(res.status).toBe(429);
      expect(body.error).toContain('Too many setup attempts');
    });

    it('should use custom handler with retryAfter', async () => {
      const mockEnv = createMockEnv(mockKV);
      const app = new Hono<{ Bindings: Env; Variables: Variables }>();

      const existingRecord = JSON.stringify({
        count: 5,
        firstRequest: Date.now(),
      });
      mockKV.get.mockResolvedValue(existingRecord);

      app.use('/setup', setupRateLimiter());
      app.post('/setup', (c) => c.json({ success: true }));

      const req = new Request('http://localhost/setup', {
        method: 'POST',
        headers: {
          'CF-Connecting-IP': '1.2.3.4',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const res = await app.fetch(req, mockEnv);
      const body = await res.json();

      expect(res.status).toBe(429);
      expect(body).toHaveProperty('code', 'RATE_LIMIT_EXCEEDED');
      expect(body).toHaveProperty('retryAfter');
    });
  });
});

describe('customRateLimiter', () => {
  let mockKV: MockKVNamespace;

  beforeEach(() => {
    mockKV = createMockKV();
    mockKV.get.mockResolvedValue(null);
    mockKV.put.mockResolvedValue(undefined);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create a custom rate limiter with specified options', async () => {
    const mockEnv = createMockEnv(mockKV);
    const app = new Hono<{ Bindings: Env; Variables: Variables }>();

    const uploadLimiter = customRateLimiter({
      type: 'upload',
      windowMs: 3600000, // 1 hour
      max: 50,
      message: 'Upload limit reached',
    });

    app.use('/upload', uploadLimiter);
    app.post('/upload', (c) => c.json({ uploaded: true }));

    const req = new Request('http://localhost/upload', {
      method: 'POST',
      headers: {
        'CF-Connecting-IP': '1.2.3.4',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const res = await app.fetch(req, mockEnv);

    expect(res.status).toBe(200);
    expect(mockKV.get).toHaveBeenCalledWith('ratelimit:upload:1.2.3.4');
  });

  it('should enforce custom limits', async () => {
    const mockEnv = createMockEnv(mockKV);
    const app = new Hono<{ Bindings: Env; Variables: Variables }>();

    const existingRecord = JSON.stringify({
      count: 50,
      firstRequest: Date.now(),
    });
    mockKV.get.mockResolvedValue(existingRecord);

    const uploadLimiter = customRateLimiter({
      type: 'upload',
      windowMs: 3600000,
      max: 50,
      message: 'Upload limit reached, try again later',
    });

    app.use('/upload', uploadLimiter);
    app.post('/upload', (c) => c.json({ uploaded: true }));

    const req = new Request('http://localhost/upload', {
      method: 'POST',
      headers: {
        'CF-Connecting-IP': '1.2.3.4',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const res = await app.fetch(req, mockEnv);
    const body: JsonBody = await res.json();

    expect(res.status).toBe(429);
    expect(body.error).toBe('Upload limit reached, try again later');
  });
});

describe('Environment Variable Configuration', () => {
  let mockKV: MockKVNamespace;

  beforeEach(() => {
    mockKV = createMockKV();
    mockKV.get.mockResolvedValue(null);
    mockKV.put.mockResolvedValue(undefined);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should use custom RATE_LIMIT_MAX_REQUESTS from environment', async () => {
    const mockEnv = createMockEnv(mockKV, {
      RATE_LIMIT_MAX_REQUESTS: '25',
      ENVIRONMENT: 'production',
    });
    const app = new Hono<{ Bindings: Env; Variables: Variables }>();

    // Set count at custom limit (25)
    const existingRecord = JSON.stringify({
      count: 25,
      firstRequest: Date.now(),
    });
    mockKV.get.mockResolvedValue(existingRecord);

    app.use('/login', loginRateLimiter());
    app.post('/login', (c) => c.json({ success: true }));

    const req = new Request('http://localhost/login', {
      method: 'POST',
      headers: {
        'CF-Connecting-IP': '1.2.3.4',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const res = await app.fetch(req, mockEnv);

    // Should be rate limited at custom limit
    expect(res.status).toBe(429);
  });

  it('should use custom RATE_LIMIT_WINDOW_MS from environment', async () => {
    const mockEnv = createMockEnv(mockKV, {
      RATE_LIMIT_WINDOW_MS: '30000', // 30 seconds
    });
    const app = new Hono<{ Bindings: Env; Variables: Variables }>();

    app.use('/api', apiRateLimiter());
    app.get('/api', (c) => c.json({ success: true }));

    const req = new Request('http://localhost/api', {
      method: 'GET',
      headers: { 'CF-Connecting-IP': '1.2.3.4' },
    });

    await app.fetch(req, mockEnv);

    // Verify TTL matches custom window (30 seconds)
    expect(mockKV.put).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      { expirationTtl: 30 }
    );
  });

  it('should use default values when environment variables are invalid', async () => {
    const mockEnv = createMockEnv(mockKV, {
      RATE_LIMIT_MAX_REQUESTS: 'invalid',
      RATE_LIMIT_WINDOW_MS: 'not-a-number',
      ENVIRONMENT: 'production',
    });
    const app = new Hono<{ Bindings: Env; Variables: Variables }>();

    // Set count at default production limit for API (1000)
    const existingRecord = JSON.stringify({
      count: 999,
      firstRequest: Date.now(),
    });
    mockKV.get.mockResolvedValue(existingRecord);

    app.use('/api', apiRateLimiter());
    app.get('/api', (c) => c.json({ success: true }));

    const req = new Request('http://localhost/api', {
      method: 'GET',
      headers: { 'CF-Connecting-IP': '1.2.3.4' },
    });

    const res = await app.fetch(req, mockEnv);

    // Should not be rate limited (uses default limit of 1000)
    expect(res.status).toBe(200);
  });
});
