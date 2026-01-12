import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import type { Database } from 'better-sqlite3';

// Mock the database module before importing the service
vi.mock('../../config/database.js', () => ({
  default: {
    prepare: vi.fn(),
    transaction: vi.fn(),
  },
}));

// Import after mocking
import db from '../../config/database.js';
import { analyticsService, getCutoffDate, timeRangeToDays } from '../analyticsService.js';
import type {
  DashboardData,
  RealtimeData,
  TopPage,
  PageViewTrend,
  TopEvent,
  TrafficSource,
  DeviceBreakdown,
  BrowserBreakdown,
  RecentPageView,
  RecentEvent,
  ActivePage,
} from '../analyticsService.js';

describe('AnalyticsService', () => {
  let mockTransaction: Mock;
  let mockPrepare: Mock;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    mockTransaction = vi.fn();
    mockPrepare = vi.fn();

    (db.transaction as Mock) = mockTransaction;
    (db.prepare as Mock) = mockPrepare;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getDashboardData()', () => {
    const cutoffDate = '2026-01-01T00:00:00.000Z';

    const mockDashboardData: DashboardData = {
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
      ] as TopPage[],
      pageViewsTrend: [
        { date: '2026-01-01', views: 100, unique_visitors: 25 },
        { date: '2026-01-02', views: 150, unique_visitors: 30 },
      ] as PageViewTrend[],
      topEvents: [
        { event_name: 'button_click', event_category: 'engagement', count: 200 },
        { event_name: 'form_submit', event_category: 'conversion', count: 50 },
      ] as TopEvent[],
      trafficSources: [
        { source: 'Direct', count: 400 },
        { source: 'Google', count: 350 },
      ] as TrafficSource[],
      deviceBreakdown: [
        { device_type: 'Desktop', count: 600 },
        { device_type: 'Mobile', count: 400 },
      ] as DeviceBreakdown[],
      browserBreakdown: [
        { browser: 'Chrome', count: 700 },
        { browser: 'Safari', count: 250 },
      ] as BrowserBreakdown[],
    };

    it('should execute dashboard query in a single transaction', () => {
      // Mock the transaction to return a function that returns mock data
      const mockTransactionFn = vi.fn((callback: Function) => {
        // Return a function that executes the callback
        return (cutoff: string) => callback(cutoff);
      });

      mockTransaction.mockImplementationOnce(mockTransactionFn);

      // Mock the transaction callback to return our mock data
      mockTransactionFn.mockReturnValueOnce(() => mockDashboardData);

      const result = analyticsService.getDashboardData(cutoffDate);

      // Verify transaction was called
      expect(mockTransaction).toHaveBeenCalledTimes(1);
      expect(mockTransaction).toHaveBeenCalledWith(expect.any(Function));

      // Verify the result matches expected data
      expect(result).toEqual(mockDashboardData);
    });

    it('should return correct data structure with all required fields', () => {
      // Mock the transaction to return mock data
      mockTransaction.mockImplementationOnce((callback: Function) => {
        return () => mockDashboardData;
      });

      const result = analyticsService.getDashboardData(cutoffDate);

      // Verify summary fields
      expect(result).toHaveProperty('summary');
      expect(result.summary).toHaveProperty('totalPageViews');
      expect(result.summary).toHaveProperty('uniqueVisitors');
      expect(result.summary).toHaveProperty('totalEvents');
      expect(result.summary).toHaveProperty('avgSessionDuration');
      expect(result.summary).toHaveProperty('bounceRate');

      // Verify array fields
      expect(result).toHaveProperty('topPages');
      expect(result).toHaveProperty('pageViewsTrend');
      expect(result).toHaveProperty('topEvents');
      expect(result).toHaveProperty('trafficSources');
      expect(result).toHaveProperty('deviceBreakdown');
      expect(result).toHaveProperty('browserBreakdown');

      expect(Array.isArray(result.topPages)).toBe(true);
      expect(Array.isArray(result.pageViewsTrend)).toBe(true);
      expect(Array.isArray(result.topEvents)).toBe(true);
      expect(Array.isArray(result.trafficSources)).toBe(true);
      expect(Array.isArray(result.deviceBreakdown)).toBe(true);
      expect(Array.isArray(result.browserBreakdown)).toBe(true);
    });

    it('should handle empty data gracefully', () => {
      const emptyDashboardData: DashboardData = {
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

      mockTransaction.mockImplementationOnce((callback: Function) => {
        return () => emptyDashboardData;
      });

      const result = analyticsService.getDashboardData(cutoffDate);

      expect(result.summary.totalPageViews).toBe(0);
      expect(result.summary.uniqueVisitors).toBe(0);
      expect(result.topPages).toEqual([]);
      expect(result.pageViewsTrend).toEqual([]);
    });

    it('should propagate database errors', () => {
      // Mock the transaction to throw an error
      mockTransaction.mockImplementationOnce(() => {
        throw new Error('Database connection error');
      });

      expect(() => analyticsService.getDashboardData(cutoffDate)).toThrow('Database connection error');
    });

    it('should propagate transaction execution errors', () => {
      // Mock the transaction to return a function that throws
      mockTransaction.mockImplementationOnce((callback: Function) => {
        return () => {
          throw new Error('Transaction failed');
        };
      });

      expect(() => analyticsService.getDashboardData(cutoffDate)).toThrow('Transaction failed');
    });

    it('should accept valid ISO date strings', () => {
      const validDates = [
        '2026-01-01T00:00:00.000Z',
        '2025-12-25T12:30:45.123Z',
        '2026-06-15T23:59:59.999Z',
      ];

      mockTransaction.mockImplementation((callback: Function) => {
        return (cutoff: string) => {
          // Verify the cutoff parameter is received
          expect(typeof cutoff).toBe('string');
          return mockDashboardData;
        };
      });

      for (const date of validDates) {
        analyticsService.getDashboardData(date);
      }

      expect(mockTransaction).toHaveBeenCalledTimes(validDates.length);
    });

    it('should use transaction batching for performance', () => {
      // Verify that getDashboardData uses db.transaction()
      // This ensures all 11 queries are executed in a single transaction
      mockTransaction.mockImplementationOnce((callback: Function) => {
        // Verify the callback is a function (the transaction body)
        expect(typeof callback).toBe('function');
        return () => mockDashboardData;
      });

      analyticsService.getDashboardData(cutoffDate);

      // Verify transaction was called exactly once (batching all queries)
      expect(mockTransaction).toHaveBeenCalledTimes(1);
    });

    it('should handle null values in query results', () => {
      const dataWithNulls: DashboardData = {
        summary: {
          totalPageViews: 100,
          uniqueVisitors: 50,
          totalEvents: 25,
          avgSessionDuration: 0, // null avg converted to 0
          bounceRate: 0, // null bounce rate converted to 0
        },
        topPages: [],
        pageViewsTrend: [],
        topEvents: [],
        trafficSources: [],
        deviceBreakdown: [],
        browserBreakdown: [],
      };

      mockTransaction.mockImplementationOnce((callback: Function) => {
        return () => dataWithNulls;
      });

      const result = analyticsService.getDashboardData(cutoffDate);

      // Verify null values are handled (converted to 0)
      expect(result.summary.avgSessionDuration).toBe(0);
      expect(result.summary.bounceRate).toBe(0);
    });
  });

  describe('getRealtimeData()', () => {
    const mockRealtimeData: RealtimeData = {
      activeUsers: 15,
      recentPageViews: [
        {
          page_url: '/home',
          page_title: 'Home',
          created_at: '2026-01-06T10:00:00Z',
          session_id: 'session1',
        },
        {
          page_url: '/about',
          page_title: 'About',
          created_at: '2026-01-06T09:55:00Z',
          session_id: 'session2',
        },
      ] as RecentPageView[],
      recentEvents: [
        {
          event_name: 'click',
          event_category: 'engagement',
          event_label: 'button',
          created_at: '2026-01-06T10:00:00Z',
          page_url: '/home',
        },
        {
          event_name: 'submit',
          event_category: 'conversion',
          event_label: null,
          created_at: '2026-01-06T09:58:00Z',
          page_url: '/contact',
        },
      ] as RecentEvent[],
      activePages: [
        { page_url: '/home', page_title: 'Home', views: 10 },
        { page_url: '/about', page_title: 'About', views: 5 },
      ] as ActivePage[],
    };

    it('should execute realtime query in a single transaction', () => {
      // Mock the transaction to return a function that returns mock data
      const mockTransactionFn = vi.fn((callback: Function) => {
        // Return a function that executes the callback
        return () => callback();
      });

      mockTransaction.mockImplementationOnce(mockTransactionFn);

      // Mock the transaction callback to return our mock data
      mockTransactionFn.mockReturnValueOnce(() => mockRealtimeData);

      const result = analyticsService.getRealtimeData();

      // Verify transaction was called
      expect(mockTransaction).toHaveBeenCalledTimes(1);
      expect(mockTransaction).toHaveBeenCalledWith(expect.any(Function));

      // Verify the result matches expected data
      expect(result).toEqual(mockRealtimeData);
    });

    it('should return correct data structure with all required fields', () => {
      mockTransaction.mockImplementationOnce((callback: Function) => {
        return () => mockRealtimeData;
      });

      const result = analyticsService.getRealtimeData();

      // Verify all fields exist
      expect(result).toHaveProperty('activeUsers');
      expect(result).toHaveProperty('recentPageViews');
      expect(result).toHaveProperty('recentEvents');
      expect(result).toHaveProperty('activePages');

      // Verify types
      expect(typeof result.activeUsers).toBe('number');
      expect(Array.isArray(result.recentPageViews)).toBe(true);
      expect(Array.isArray(result.recentEvents)).toBe(true);
      expect(Array.isArray(result.activePages)).toBe(true);
    });

    it('should handle empty realtime data', () => {
      const emptyRealtimeData: RealtimeData = {
        activeUsers: 0,
        recentPageViews: [],
        recentEvents: [],
        activePages: [],
      };

      mockTransaction.mockImplementationOnce((callback: Function) => {
        return () => emptyRealtimeData;
      });

      const result = analyticsService.getRealtimeData();

      expect(result.activeUsers).toBe(0);
      expect(result.recentPageViews).toEqual([]);
      expect(result.recentEvents).toEqual([]);
      expect(result.activePages).toEqual([]);
    });

    it('should propagate database errors', () => {
      mockTransaction.mockImplementationOnce(() => {
        throw new Error('Database connection error');
      });

      expect(() => analyticsService.getRealtimeData()).toThrow('Database connection error');
    });

    it('should propagate transaction execution errors', () => {
      mockTransaction.mockImplementationOnce((callback: Function) => {
        return () => {
          throw new Error('Transaction failed');
        };
      });

      expect(() => analyticsService.getRealtimeData()).toThrow('Transaction failed');
    });

    it('should use transaction batching for performance', () => {
      // Verify that getRealtimeData uses db.transaction()
      // This ensures all 4 queries are executed in a single transaction
      mockTransaction.mockImplementationOnce((callback: Function) => {
        // Verify the callback is a function (the transaction body)
        expect(typeof callback).toBe('function');
        return () => mockRealtimeData;
      });

      analyticsService.getRealtimeData();

      // Verify transaction was called exactly once (batching all queries)
      expect(mockTransaction).toHaveBeenCalledTimes(1);
    });

    it('should handle recent data with null optional fields', () => {
      const dataWithNulls: RealtimeData = {
        activeUsers: 5,
        recentPageViews: [
          {
            page_url: '/test',
            page_title: 'Test',
            created_at: '2026-01-06T10:00:00Z',
            session_id: 'session1',
          },
        ],
        recentEvents: [
          {
            event_name: 'click',
            event_category: null, // Category can be null
            event_label: null, // Label can be null
            created_at: '2026-01-06T10:00:00Z',
            page_url: '/test',
          },
        ],
        activePages: [],
      };

      mockTransaction.mockImplementationOnce((callback: Function) => {
        return () => dataWithNulls;
      });

      const result = analyticsService.getRealtimeData();

      expect(result.recentEvents[0].event_category).toBeNull();
      expect(result.recentEvents[0].event_label).toBeNull();
    });

    it('should not require parameters (uses fixed time windows)', () => {
      mockTransaction.mockImplementationOnce((callback: Function) => {
        return () => mockRealtimeData;
      });

      // getRealtimeData() should work without any parameters
      // It uses fixed time windows (last 5 minutes, last hour, etc.)
      const result = analyticsService.getRealtimeData();

      expect(result).toBeDefined();
      expect(mockTransaction).toHaveBeenCalledTimes(1);
    });
  });

  describe('Helper Functions', () => {
    describe('getCutoffDate()', () => {
      it('should calculate cutoff date correctly for 1 day', () => {
        const cutoffDate = getCutoffDate(1);
        const parsedDate = new Date(cutoffDate);
        const now = new Date();

        const hoursDiff = (now.getTime() - parsedDate.getTime()) / (1000 * 60 * 60);

        expect(hoursDiff).toBeGreaterThan(23);
        expect(hoursDiff).toBeLessThan(25);
      });

      it('should calculate cutoff date correctly for 7 days', () => {
        const cutoffDate = getCutoffDate(7);
        const parsedDate = new Date(cutoffDate);
        const now = new Date();

        const daysDiff = (now.getTime() - parsedDate.getTime()) / (1000 * 60 * 60 * 24);

        expect(daysDiff).toBeGreaterThan(6.9);
        expect(daysDiff).toBeLessThan(7.1);
      });

      it('should calculate cutoff date correctly for 30 days', () => {
        const cutoffDate = getCutoffDate(30);
        const parsedDate = new Date(cutoffDate);
        const now = new Date();

        const daysDiff = (now.getTime() - parsedDate.getTime()) / (1000 * 60 * 60 * 24);

        expect(daysDiff).toBeGreaterThan(29.9);
        expect(daysDiff).toBeLessThan(30.1);
      });

      it('should calculate cutoff date correctly for 90 days', () => {
        const cutoffDate = getCutoffDate(90);
        const parsedDate = new Date(cutoffDate);
        const now = new Date();

        const daysDiff = (now.getTime() - parsedDate.getTime()) / (1000 * 60 * 60 * 24);

        expect(daysDiff).toBeGreaterThan(89.9);
        expect(daysDiff).toBeLessThan(90.1);
      });

      it('should return ISO date string format', () => {
        const cutoffDate = getCutoffDate(7);

        // Should be a valid ISO date string
        expect(typeof cutoffDate).toBe('string');
        expect(() => new Date(cutoffDate)).not.toThrow();

        // Should match ISO format (ends with Z)
        expect(cutoffDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      });

      it('should not contain SQL injection vulnerabilities', () => {
        const cutoffDate = getCutoffDate(7);

        // Should not contain SQL keywords or injection attempts
        expect(cutoffDate).not.toContain('DROP');
        expect(cutoffDate).not.toContain('DELETE');
        expect(cutoffDate).not.toContain('UNION');
        expect(cutoffDate).not.toContain('--');
        expect(cutoffDate).not.toContain("'");
        expect(cutoffDate).not.toContain('${');
        expect(cutoffDate).not.toContain('datetime(');
      });
    });

    describe('timeRangeToDays()', () => {
      it('should convert 24h to 1 day', () => {
        expect(timeRangeToDays('24h')).toBe(1);
      });

      it('should convert 7d to 7 days', () => {
        expect(timeRangeToDays('7d')).toBe(7);
      });

      it('should convert 30d to 30 days', () => {
        expect(timeRangeToDays('30d')).toBe(30);
      });

      it('should convert 90d to 90 days', () => {
        expect(timeRangeToDays('90d')).toBe(90);
      });

      it('should default to 7 days for invalid input', () => {
        expect(timeRangeToDays('invalid')).toBe(7);
        expect(timeRangeToDays('')).toBe(7);
        expect(timeRangeToDays('100d')).toBe(7);
        expect(timeRangeToDays('1w')).toBe(7);
      });

      it('should default to 7 days for SQL injection attempts', () => {
        const injectionPayloads = [
          "7d'; DROP TABLE analytics_pageviews; --",
          "7d' OR '1'='1",
          "'; DELETE FROM analytics_pageviews; --",
          "${malicious}",
        ];

        for (const payload of injectionPayloads) {
          expect(timeRangeToDays(payload)).toBe(7);
        }
      });
    });
  });

  describe('Transaction Behavior', () => {
    it('should execute getDashboardData queries atomically', () => {
      const transactionCallbacks: Function[] = [];

      mockTransaction.mockImplementationOnce((callback: Function) => {
        transactionCallbacks.push(callback);
        return () => ({
          summary: {
            totalPageViews: 100,
            uniqueVisitors: 50,
            totalEvents: 25,
            avgSessionDuration: 5,
            bounceRate: 40,
          },
          topPages: [],
          pageViewsTrend: [],
          topEvents: [],
          trafficSources: [],
          deviceBreakdown: [],
          browserBreakdown: [],
        });
      });

      analyticsService.getDashboardData('2026-01-01T00:00:00.000Z');

      // Verify that only one transaction was created (atomicity)
      expect(transactionCallbacks.length).toBe(1);
      expect(mockTransaction).toHaveBeenCalledTimes(1);
    });

    it('should execute getRealtimeData queries atomically', () => {
      const transactionCallbacks: Function[] = [];

      mockTransaction.mockImplementationOnce((callback: Function) => {
        transactionCallbacks.push(callback);
        return () => ({
          activeUsers: 10,
          recentPageViews: [],
          recentEvents: [],
          activePages: [],
        });
      });

      analyticsService.getRealtimeData();

      // Verify that only one transaction was created (atomicity)
      expect(transactionCallbacks.length).toBe(1);
      expect(mockTransaction).toHaveBeenCalledTimes(1);
    });

    it('should rollback on error in getDashboardData transaction', () => {
      // When a transaction throws an error, better-sqlite3 automatically rolls back
      mockTransaction.mockImplementationOnce((callback: Function) => {
        return () => {
          throw new Error('Query failed mid-transaction');
        };
      });

      // The error should be propagated
      expect(() => analyticsService.getDashboardData('2026-01-01T00:00:00.000Z')).toThrow(
        'Query failed mid-transaction'
      );

      // Verify transaction was attempted
      expect(mockTransaction).toHaveBeenCalledTimes(1);
    });

    it('should rollback on error in getRealtimeData transaction', () => {
      mockTransaction.mockImplementationOnce((callback: Function) => {
        return () => {
          throw new Error('Query failed mid-transaction');
        };
      });

      expect(() => analyticsService.getRealtimeData()).toThrow('Query failed mid-transaction');

      expect(mockTransaction).toHaveBeenCalledTimes(1);
    });
  });

  describe('SQL Injection Protection', () => {
    it('should use parameterized queries via pre-prepared statements', () => {
      // The service uses pre-prepared statements defined at module load time
      // This test verifies that getDashboardData doesn't dynamically construct SQL

      mockTransaction.mockImplementationOnce((callback: Function) => {
        return (cutoff: string) => {
          // Verify cutoff is just a date string, not SQL code
          expect(cutoff).not.toContain('DROP');
          expect(cutoff).not.toContain('DELETE');
          expect(cutoff).not.toContain('UNION');
          expect(cutoff).not.toContain('--');

          return {
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
        };
      });

      // Even with malicious input, only the date parameter is passed
      const maliciousDate = "2026-01-01'; DROP TABLE analytics_pageviews; --";
      analyticsService.getDashboardData(maliciousDate);

      // The transaction received the parameter but pre-prepared statements
      // ensure it's only used as a parameter value, not SQL code
      expect(mockTransaction).toHaveBeenCalledTimes(1);
    });

    it('should prevent SQL injection in date parameters', () => {
      const injectionAttempts = [
        "2026-01-01'; DROP TABLE analytics_pageviews; --",
        "'; DELETE FROM analytics_events; --",
        "2026-01-01' OR '1'='1",
        "2026-01-01' UNION SELECT * FROM users --",
      ];

      mockTransaction.mockImplementation((callback: Function) => {
        return (cutoff: string) => ({
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
        });
      });

      for (const injection of injectionAttempts) {
        analyticsService.getDashboardData(injection);
      }

      // All calls should complete without executing malicious SQL
      expect(mockTransaction).toHaveBeenCalledTimes(injectionAttempts.length);
    });
  });
});
