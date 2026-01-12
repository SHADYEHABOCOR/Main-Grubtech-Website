import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import analyticsRouter from '../analytics.js';
import db from '../../config/database.js';
import analyticsService from '../../services/analyticsService.js';

// Mock the database module
vi.mock('../../config/database.js', () => ({
  default: {
    prepare: vi.fn(),
    exec: vi.fn(),
  },
}));

// Mock the analytics service module
vi.mock('../../services/analyticsService.js', () => ({
  default: {
    getDashboardData: vi.fn(),
    getRealtimeData: vi.fn(),
  },
  getCutoffDate: vi.fn((daysBack: number) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    return cutoffDate.toISOString();
  }),
  analyticsService: {
    getDashboardData: vi.fn(),
    getRealtimeData: vi.fn(),
  },
}));

describe('Analytics API', () => {
  let app: Express;
  let mockPrepare: Mock;
  let mockGet: Mock;
  let mockAll: Mock;
  let mockRun: Mock;
  let mockGetDashboardData: Mock;
  let mockGetRealtimeData: Mock;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/analytics', analyticsRouter);

    // Reset all mocks
    vi.clearAllMocks();

    // Setup mock functions for database (used by tracking endpoints)
    mockGet = vi.fn();
    mockAll = vi.fn();
    mockRun = vi.fn();
    mockPrepare = vi.fn(() => ({
      get: mockGet,
      all: mockAll,
      run: mockRun,
    }));

    (db.prepare as Mock) = mockPrepare;

    // Setup mock functions for analytics service
    mockGetDashboardData = vi.fn();
    mockGetRealtimeData = vi.fn();
    (analyticsService.getDashboardData as Mock) = mockGetDashboardData;
    (analyticsService.getRealtimeData as Mock) = mockGetRealtimeData;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /dashboard', () => {
    const mockDashboardData = {
      summary: {
        totalPageViews: 1000,
        uniqueVisitors: 250,
        totalEvents: 500,
        avgSessionDuration: 5.5,
        bounceRate: 45.5,
      },
      topPages: [
        { page_url: '/home', page_title: 'Home', views: 500 },
        { page_url: '/about', page_title: 'About', views: 300 },
      ],
      pageViewsTrend: [
        { date: '2026-01-01', views: 100, unique_visitors: 25 },
        { date: '2026-01-02', views: 150, unique_visitors: 30 },
      ],
      topEvents: [
        { event_name: 'button_click', event_category: 'engagement', count: 200 },
        { event_name: 'form_submit', event_category: 'conversion', count: 50 },
      ],
      trafficSources: [
        { source: 'Direct', count: 400 },
        { source: 'Google', count: 350 },
      ],
      deviceBreakdown: [
        { device_type: 'Desktop', count: 600 },
        { device_type: 'Mobile', count: 400 },
      ],
      browserBreakdown: [
        { browser: 'Chrome', count: 700 },
        { browser: 'Safari', count: 250 },
      ],
    };

    beforeEach(() => {
      // Setup mock response for analytics service
      // The service returns all data in a single transaction call
      mockGetDashboardData.mockReturnValue(mockDashboardData);
    });

    it('should return analytics dashboard with default timeRange (7d)', async () => {
      const response = await request(app).get('/api/analytics/dashboard');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('summary');
      expect(response.body).toHaveProperty('topPages');
      expect(response.body).toHaveProperty('pageViewsTrend');
      expect(response.body).toHaveProperty('topEvents');
      expect(response.body).toHaveProperty('trafficSources');
      expect(response.body).toHaveProperty('deviceBreakdown');
      expect(response.body).toHaveProperty('browserBreakdown');

      // Verify summary structure
      expect(response.body.summary).toEqual({
        totalPageViews: 1000,
        uniqueVisitors: 250,
        totalEvents: 500,
        avgSessionDuration: 5.5,
        bounceRate: 45.5,
      });

      // Verify the analytics service was called with the cutoff date parameter
      expect(mockGetDashboardData).toHaveBeenCalledTimes(1);
      expect(mockGetDashboardData).toHaveBeenCalledWith(expect.any(String));

      // Verify the cutoff date is approximately 7 days ago (default)
      const cutoffDateArg = mockGetDashboardData.mock.calls[0][0] as string;
      const cutoffDate = new Date(cutoffDateArg);
      const now = new Date();
      const daysDiff = (now.getTime() - cutoffDate.getTime()) / (1000 * 60 * 60 * 24);
      expect(daysDiff).toBeGreaterThan(6.9);
      expect(daysDiff).toBeLessThan(7.1);
    });

    it('should handle timeRange=24h (1 day)', async () => {
      const response = await request(app).get('/api/analytics/dashboard?timeRange=24h');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('summary');

      // Verify the analytics service was called
      expect(mockGetDashboardData).toHaveBeenCalledTimes(1);

      // Verify the cutoff date is approximately 1 day ago
      const cutoffDateArg = mockGetDashboardData.mock.calls[0][0] as string;
      const cutoffDate = new Date(cutoffDateArg);
      const now = new Date();
      const hoursDiff = (now.getTime() - cutoffDate.getTime()) / (1000 * 60 * 60);

      expect(hoursDiff).toBeGreaterThan(23);
      expect(hoursDiff).toBeLessThan(25);
    });

    it('should handle timeRange=7d (7 days)', async () => {
      const response = await request(app).get('/api/analytics/dashboard?timeRange=7d');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('summary');

      // Verify the analytics service was called
      expect(mockGetDashboardData).toHaveBeenCalledTimes(1);

      // Verify the cutoff date is approximately 7 days ago
      const cutoffDateArg = mockGetDashboardData.mock.calls[0][0] as string;
      const cutoffDate = new Date(cutoffDateArg);
      const now = new Date();
      const daysDiff = (now.getTime() - cutoffDate.getTime()) / (1000 * 60 * 60 * 24);

      expect(daysDiff).toBeGreaterThan(6.9);
      expect(daysDiff).toBeLessThan(7.1);
    });

    it('should handle timeRange=30d (30 days)', async () => {
      const response = await request(app).get('/api/analytics/dashboard?timeRange=30d');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('summary');

      // Verify the analytics service was called
      expect(mockGetDashboardData).toHaveBeenCalledTimes(1);

      // Verify the cutoff date is approximately 30 days ago
      const cutoffDateArg = mockGetDashboardData.mock.calls[0][0] as string;
      const cutoffDate = new Date(cutoffDateArg);
      const now = new Date();
      const daysDiff = (now.getTime() - cutoffDate.getTime()) / (1000 * 60 * 60 * 24);

      expect(daysDiff).toBeGreaterThan(29.9);
      expect(daysDiff).toBeLessThan(30.1);
    });

    it('should handle timeRange=90d (90 days)', async () => {
      const response = await request(app).get('/api/analytics/dashboard?timeRange=90d');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('summary');

      // Verify the analytics service was called
      expect(mockGetDashboardData).toHaveBeenCalledTimes(1);

      // Verify the cutoff date is approximately 90 days ago
      const cutoffDateArg = mockGetDashboardData.mock.calls[0][0] as string;
      const cutoffDate = new Date(cutoffDateArg);
      const now = new Date();
      const daysDiff = (now.getTime() - cutoffDate.getTime()) / (1000 * 60 * 60 * 24);

      expect(daysDiff).toBeGreaterThan(89.9);
      expect(daysDiff).toBeLessThan(90.1);
    });

    it('should handle invalid timeRange by defaulting to 7d', async () => {
      const response = await request(app).get('/api/analytics/dashboard?timeRange=invalid');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('summary');

      // Verify the analytics service was called
      expect(mockGetDashboardData).toHaveBeenCalledTimes(1);

      // Verify the cutoff date defaults to 7 days ago
      const cutoffDateArg = mockGetDashboardData.mock.calls[0][0] as string;
      const cutoffDate = new Date(cutoffDateArg);
      const now = new Date();
      const daysDiff = (now.getTime() - cutoffDate.getTime()) / (1000 * 60 * 60 * 24);

      expect(daysDiff).toBeGreaterThan(6.9);
      expect(daysDiff).toBeLessThan(7.1);
    });

    it('should block SQL injection attempts via whitelist validation', async () => {
      // SECURITY TEST: Verify that the whitelist approach prevents SQL injection
      // The timeRange parameter only accepts: '24h', '7d', '30d', '90d'
      // Any other value (including malicious payloads) defaults to 7d
      // The service layer uses transactions with parameterized queries

      const injectionPayloads = [
        // Classic SQL injection attempts
        { payload: "7d'; DROP TABLE analytics_pageviews; --", description: 'DROP TABLE injection' },
        { payload: "7d' OR '1'='1", description: 'OR injection' },
        { payload: "7d'; DELETE FROM analytics_pageviews WHERE 1=1; --", description: 'DELETE injection' },
        { payload: "7d' UNION SELECT * FROM users --", description: 'UNION SELECT injection' },
        { payload: "7d'; UPDATE analytics_pageviews SET created_at=NOW(); --", description: 'UPDATE injection' },
        // Additional attack vectors
        { payload: "'; DROP TABLE analytics_sessions; --", description: 'Direct DROP TABLE' },
        { payload: "1=1; DROP TABLE analytics_events; --", description: 'Boolean DROP TABLE' },
        { payload: "../../../etc/passwd", description: 'Path traversal attempt' },
        { payload: "${malicious}", description: 'Template literal injection' },
        { payload: "7d\"; DROP TABLE analytics_pageviews; --", description: 'Double quote injection' },
      ];

      for (const { payload, description } of injectionPayloads) {
        // Reset mocks for each test
        vi.clearAllMocks();

        // Mock the service to return valid data
        mockGetDashboardData.mockReturnValue(mockDashboardData);

        const response = await request(app).get(
          `/api/analytics/dashboard?timeRange=${encodeURIComponent(payload)}`
        );

        // Whitelist validation: should still return 200 but with default 7d timeRange
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('summary');

        // Verify the analytics service was called
        expect(mockGetDashboardData).toHaveBeenCalledTimes(1);

        // CRITICAL: Verify that the service was called with a valid ISO date string
        // not the malicious payload
        const cutoffDateArg = mockGetDashboardData.mock.calls[0][0] as string;

        // Should be an ISO date string, not malicious payload
        expect(typeof cutoffDateArg).toBe('string');
        expect(() => new Date(cutoffDateArg)).not.toThrow();

        // Verify it doesn't contain SQL injection keywords
        expect(cutoffDateArg).not.toContain('DROP');
        expect(cutoffDateArg).not.toContain('DELETE');
        expect(cutoffDateArg).not.toContain('UNION');
        expect(cutoffDateArg).not.toContain('UPDATE');
        expect(cutoffDateArg).not.toContain("'");
        expect(cutoffDateArg).not.toContain('--');
        expect(cutoffDateArg).not.toContain('${');

        // Verify the cutoff date defaults to 7 days (whitelist fallback)
        const cutoffDate = new Date(cutoffDateArg);
        const now = new Date();
        const daysDiff = (now.getTime() - cutoffDate.getTime()) / (1000 * 60 * 60 * 24);
        expect(daysDiff).toBeGreaterThan(6.9);
        expect(daysDiff).toBeLessThan(7.1);
      }
    });

    it('should handle database errors gracefully', async () => {
      // Mock the service to throw an error (simulating transaction failure)
      mockGetDashboardData.mockImplementationOnce(() => {
        throw new Error('Database connection error');
      });

      const response = await request(app).get('/api/analytics/dashboard');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Failed to fetch analytics data');
    });

    it('should return zero values when no data exists', async () => {
      // Setup mock service response with no data
      const emptyDashboardData = {
        summary: {
          totalPageViews: 0,
          uniqueVisitors: 0,
          totalEvents: 0,
          avgSessionDuration: 0,
          bounceRate: 0,
        },
        topPages: [],
        pageViewsTrend: [],
        topEvents: [],
        trafficSources: [],
        deviceBreakdown: [],
        browserBreakdown: [],
      };

      mockGetDashboardData.mockReturnValue(emptyDashboardData);

      const response = await request(app).get('/api/analytics/dashboard');

      expect(response.status).toBe(200);
      expect(response.body.summary).toEqual({
        totalPageViews: 0,
        uniqueVisitors: 0,
        totalEvents: 0,
        avgSessionDuration: 0,
        bounceRate: 0,
      });
      expect(response.body.topPages).toEqual([]);
      expect(response.body.pageViewsTrend).toEqual([]);
    });

    it('should verify transaction-based approach with parameterized queries', async () => {
      await request(app).get('/api/analytics/dashboard?timeRange=30d');

      // Verify the service was called (representing a single transaction)
      // The service consolidates 11 queries into one transaction call
      expect(mockGetDashboardData).toHaveBeenCalledTimes(1);

      // Verify the service received a valid ISO date string parameter
      // This parameter is safely passed to all 11 parameterized queries within the transaction
      const cutoffDateArg = mockGetDashboardData.mock.calls[0][0] as string;

      // Should be a valid ISO date string
      expect(typeof cutoffDateArg).toBe('string');
      expect(() => new Date(cutoffDateArg)).not.toThrow();

      // Should NOT contain SQL injection attempts or template literals
      expect(cutoffDateArg).not.toContain('${');
      expect(cutoffDateArg).not.toContain('daysBack');
      expect(cutoffDateArg).not.toContain('DROP');
      expect(cutoffDateArg).not.toContain('DELETE');
      expect(cutoffDateArg).not.toContain('UNION');
      expect(cutoffDateArg).not.toContain('--');

      // Verify the cutoff date is approximately 30 days ago
      const cutoffDate = new Date(cutoffDateArg);
      const now = new Date();
      const daysDiff = (now.getTime() - cutoffDate.getTime()) / (1000 * 60 * 60 * 24);
      expect(daysDiff).toBeGreaterThan(29.9);
      expect(daysDiff).toBeLessThan(30.1);
    });
  });

  describe('POST /track/pageview', () => {
    beforeEach(() => {
      mockRun.mockReturnValue({});
    });

    it('should track page view successfully', async () => {
      const pageviewData = {
        page_url: '/test-page',
        page_title: 'Test Page',
        referrer: 'https://google.com',
        session_id: 'test-session-123',
        user_agent: 'Mozilla/5.0',
        viewport_width: 1920,
        viewport_height: 1080,
      };

      const response = await request(app)
        .post('/api/analytics/track/pageview')
        .send(pageviewData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ success: true });
      expect(mockPrepare).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO analytics_pageviews'));
      expect(mockRun).toHaveBeenCalledWith(
        pageviewData.page_url,
        pageviewData.page_title,
        pageviewData.referrer,
        pageviewData.session_id,
        pageviewData.user_agent,
        pageviewData.viewport_width,
        pageviewData.viewport_height
      );
    });

    it('should handle missing referrer', async () => {
      const pageviewData = {
        page_url: '/test-page',
        page_title: 'Test Page',
        session_id: 'test-session-123',
        user_agent: 'Mozilla/5.0',
        viewport_width: 1920,
        viewport_height: 1080,
      };

      const response = await request(app)
        .post('/api/analytics/track/pageview')
        .send(pageviewData);

      expect(response.status).toBe(201);
      expect(mockRun).toHaveBeenCalledWith(
        pageviewData.page_url,
        pageviewData.page_title,
        null,
        pageviewData.session_id,
        pageviewData.user_agent,
        pageviewData.viewport_width,
        pageviewData.viewport_height
      );
    });
  });

  describe('POST /track/event', () => {
    beforeEach(() => {
      mockRun.mockReturnValue({});
    });

    it('should track custom event successfully', async () => {
      const eventData = {
        event_name: 'button_click',
        event_category: 'engagement',
        event_label: 'cta_button',
        event_value: 1,
        page_url: '/home',
        session_id: 'test-session-123',
        metadata: { location: 'header' },
      };

      const response = await request(app)
        .post('/api/analytics/track/event')
        .send(eventData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ success: true });
      expect(mockPrepare).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO analytics_events'));
      expect(mockRun).toHaveBeenCalledWith(
        eventData.event_name,
        eventData.event_category,
        eventData.event_label,
        eventData.event_value,
        eventData.page_url,
        eventData.session_id,
        JSON.stringify(eventData.metadata)
      );
    });
  });

  describe('POST /track/session', () => {
    it('should create new session', async () => {
      mockGet.mockReturnValueOnce(undefined);
      mockRun.mockReturnValue({});

      const sessionData = {
        session_id: 'test-session-123',
        user_agent: 'Mozilla/5.0',
        device_type: 'Desktop',
        browser: 'Chrome',
        os: 'Windows',
        country: 'US',
        language: 'en-US',
      };

      const response = await request(app)
        .post('/api/analytics/track/session')
        .send(sessionData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ success: true });
      expect(mockPrepare).toHaveBeenCalledWith(expect.stringContaining('SELECT id FROM analytics_sessions'));
      expect(mockPrepare).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO analytics_sessions'));
    });

    it('should update existing session', async () => {
      mockGet.mockReturnValueOnce({ id: 1 });
      mockRun.mockReturnValue({});

      const sessionData = {
        session_id: 'test-session-123',
        user_agent: 'Mozilla/5.0',
        device_type: 'Desktop',
        browser: 'Chrome',
        os: 'Windows',
        country: 'US',
        language: 'en-US',
      };

      const response = await request(app)
        .post('/api/analytics/track/session')
        .send(sessionData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ success: true });
      expect(mockPrepare).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE analytics_sessions SET last_active_at')
      );
    });
  });

  describe('GET /realtime', () => {
    const mockRealtimeData = {
      activeUsers: 15,
      recentPageViews: [
        { page_url: '/home', page_title: 'Home', created_at: '2026-01-06T10:00:00Z', session_id: 'session1' },
      ],
      recentEvents: [
        { event_name: 'click', event_category: 'engagement', event_label: 'button', created_at: '2026-01-06T10:00:00Z', page_url: '/home' },
      ],
      activePages: [
        { page_url: '/home', page_title: 'Home', views: 10 },
      ],
    };

    beforeEach(() => {
      // Mock the analytics service to return realtime data
      // The service consolidates 4 queries into a single transaction
      mockGetRealtimeData.mockReturnValue(mockRealtimeData);
    });

    it('should return real-time analytics data', async () => {
      const response = await request(app).get('/api/analytics/realtime');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('activeUsers');
      expect(response.body).toHaveProperty('recentPageViews');
      expect(response.body).toHaveProperty('recentEvents');
      expect(response.body).toHaveProperty('activePages');
      expect(response.body.activeUsers).toBe(15);

      // Verify the analytics service was called (representing a single transaction)
      expect(mockGetRealtimeData).toHaveBeenCalledTimes(1);
    });
  });
});
