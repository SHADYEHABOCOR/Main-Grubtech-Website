import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import request from 'supertest';
import express, { Express, Request, Response, NextFunction } from 'express';
import blogRouter from '../blog.js';
import db from '../../config/database.js';

// Mock the database module
vi.mock('../../config/database.js', () => ({
  default: {
    prepare: vi.fn(),
    exec: vi.fn(),
  },
}));

// Mock the auth middleware
vi.mock('../../middleware/auth.js', () => ({
  authenticateToken: vi.fn((req: Request, res: Response, next: NextFunction) => {
    // By default, allow requests (will be overridden in tests)
    next();
  }),
}));

describe('Blog API', () => {
  let app: Express;
  let mockPrepare: Mock;
  let mockGet: Mock;
  let mockAll: Mock;
  let mockRun: Mock;
  let mockAuthMiddleware: Mock;

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    app.use('/api/blog', blogRouter);

    // Import the mocked auth middleware
    const authModule = await import('../../middleware/auth.js');
    mockAuthMiddleware = authModule.authenticateToken as Mock;

    // Reset all mocks
    vi.clearAllMocks();

    // Setup mock functions
    mockGet = vi.fn();
    mockAll = vi.fn();
    mockRun = vi.fn();
    mockPrepare = vi.fn(() => ({
      get: mockGet,
      all: mockAll,
      run: mockRun,
    }));

    (db.prepare as Mock) = mockPrepare;

    // Default: Allow authenticated requests
    mockAuthMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
      (req as any).user = { id: 1, username: 'testuser' };
      next();
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /stats', () => {
    const mockStatsData = {
      total: { count: 100 },
      today: { count: 5 },
      thisWeek: { count: 15 },
      thisMonth: { count: 30 },
      byStatus: [
        { status: 'published', count: 80 },
        { status: 'draft', count: 20 },
      ],
      byLanguage: [
        { language: 'en', count: 60 },
        { language: 'ar', count: 25 },
        { language: 'es', count: 10 },
        { language: 'pt', count: 5 },
      ],
    };

    describe('Authentication', () => {
      beforeEach(() => {
        // Configure mock to reject unauthenticated requests
        mockAuthMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
          res.status(401).json({ error: 'No token provided', code: 'NO_TOKEN' });
        });
      });

      it('should return 401 without authentication', async () => {
        const response = await request(app).get('/api/blog/stats');

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error');
        expect(mockAuthMiddleware).toHaveBeenCalled();
      });
    });

    describe('Authenticated Access', () => {
      beforeEach(() => {
        // Configure mock to allow authenticated requests
        mockAuthMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
          (req as any).user = { id: 1, username: 'testuser' };
          next();
        });

        // Setup default mock responses for all queries
        mockGet
          .mockReturnValueOnce(mockStatsData.total)
          .mockReturnValueOnce(mockStatsData.today)
          .mockReturnValueOnce(mockStatsData.thisWeek)
          .mockReturnValueOnce(mockStatsData.thisMonth);

        mockAll
          .mockReturnValueOnce(mockStatsData.byStatus)
          .mockReturnValueOnce(mockStatsData.byLanguage);
      });

      it('should return blog stats successfully', async () => {
        const response = await request(app).get('/api/blog/stats');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('stats');
        expect(mockAuthMiddleware).toHaveBeenCalled();
      });

      it('should return correct stats structure', async () => {
        const response = await request(app).get('/api/blog/stats');

        expect(response.status).toBe(200);
        expect(response.body.stats).toHaveProperty('total', 100);
        expect(response.body.stats).toHaveProperty('today', 5);
        expect(response.body.stats).toHaveProperty('thisWeek', 15);
        expect(response.body.stats).toHaveProperty('thisMonth', 30);
        expect(response.body.stats).toHaveProperty('byStatus');
        expect(response.body.stats).toHaveProperty('byLanguage');
      });

      it('should return correct byStatus breakdown', async () => {
        const response = await request(app).get('/api/blog/stats');

        expect(response.status).toBe(200);
        expect(response.body.stats.byStatus).toEqual([
          { status: 'published', count: 80 },
          { status: 'draft', count: 20 },
        ]);
      });

      it('should return correct byLanguage breakdown', async () => {
        const response = await request(app).get('/api/blog/stats');

        expect(response.status).toBe(200);
        expect(response.body.stats.byLanguage).toEqual([
          { language: 'en', count: 60 },
          { language: 'ar', count: 25 },
          { language: 'es', count: 10 },
          { language: 'pt', count: 5 },
        ]);
      });

      it('should execute correct SQL queries', async () => {
        await request(app).get('/api/blog/stats');

        // Verify prepare was called 6 times (total, today, thisWeek, thisMonth, byStatus, byLanguage)
        expect(mockPrepare).toHaveBeenCalledTimes(6);

        // Verify the queries
        const calls = mockPrepare.mock.calls;
        expect(calls[0][0]).toContain('SELECT COUNT(*) as count FROM blog_posts');
        expect(calls[1][0]).toContain("SELECT COUNT(*) as count FROM blog_posts WHERE DATE(created_at) = DATE('now')");
        expect(calls[2][0]).toContain("SELECT COUNT(*) as count FROM blog_posts WHERE created_at >= datetime('now', '-7 days')");
        expect(calls[3][0]).toContain("SELECT COUNT(*) as count FROM blog_posts WHERE created_at >= datetime('now', '-30 days')");
        expect(calls[4][0]).toContain('SELECT status, COUNT(*) as count FROM blog_posts GROUP BY status');
        expect(calls[5][0]).toContain('SELECT language, COUNT(*) as count FROM blog_posts GROUP BY language');
      });

      it('should return zero values when no blog posts exist', async () => {
        // Reset mocks
        vi.clearAllMocks();
        mockAuthMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
          (req as any).user = { id: 1, username: 'testuser' };
          next();
        });

        // Setup mock responses with no data
        mockGet
          .mockReturnValueOnce({ count: 0 })
          .mockReturnValueOnce({ count: 0 })
          .mockReturnValueOnce({ count: 0 })
          .mockReturnValueOnce({ count: 0 });

        mockAll
          .mockReturnValueOnce([])
          .mockReturnValueOnce([]);

        const response = await request(app).get('/api/blog/stats');

        expect(response.status).toBe(200);
        expect(response.body.stats).toEqual({
          total: 0,
          today: 0,
          thisWeek: 0,
          thisMonth: 0,
          byStatus: [],
          byLanguage: [],
        });
      });

      it('should handle partial data gracefully', async () => {
        // Reset mocks
        vi.clearAllMocks();
        mockAuthMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
          (req as any).user = { id: 1, username: 'testuser' };
          next();
        });

        // Setup mock responses with partial data
        mockGet
          .mockReturnValueOnce({ count: 50 })
          .mockReturnValueOnce({ count: 0 })
          .mockReturnValueOnce({ count: 10 })
          .mockReturnValueOnce({ count: 25 });

        mockAll
          .mockReturnValueOnce([{ status: 'published', count: 50 }])
          .mockReturnValueOnce([{ language: 'en', count: 50 }]);

        const response = await request(app).get('/api/blog/stats');

        expect(response.status).toBe(200);
        expect(response.body.stats).toEqual({
          total: 50,
          today: 0,
          thisWeek: 10,
          thisMonth: 25,
          byStatus: [{ status: 'published', count: 50 }],
          byLanguage: [{ language: 'en', count: 50 }],
        });
      });
    });

    describe('Error Handling', () => {
      beforeEach(() => {
        // Configure mock to allow authenticated requests
        mockAuthMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
          (req as any).user = { id: 1, username: 'testuser' };
          next();
        });
      });

      it('should handle database errors gracefully', async () => {
        mockPrepare.mockImplementationOnce(() => {
          throw new Error('Database connection error');
        });

        const response = await request(app).get('/api/blog/stats');

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Failed to fetch stats');
      });

      it('should handle query execution errors', async () => {
        mockGet.mockImplementationOnce(() => {
          throw new Error('Query execution failed');
        });

        const response = await request(app).get('/api/blog/stats');

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Failed to fetch stats');
      });

      it('should handle errors in grouped queries', async () => {
        // Total count succeeds
        mockGet
          .mockReturnValueOnce({ count: 100 })
          .mockReturnValueOnce({ count: 5 })
          .mockReturnValueOnce({ count: 15 })
          .mockReturnValueOnce({ count: 30 });

        // byStatus query fails
        mockAll.mockImplementationOnce(() => {
          throw new Error('Group by query failed');
        });

        const response = await request(app).get('/api/blog/stats');

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Failed to fetch stats');
      });
    });

    describe('Response Format', () => {
      beforeEach(() => {
        // Configure mock to allow authenticated requests
        mockAuthMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
          (req as any).user = { id: 1, username: 'testuser' };
          next();
        });

        // Setup default mock responses
        mockGet
          .mockReturnValueOnce(mockStatsData.total)
          .mockReturnValueOnce(mockStatsData.today)
          .mockReturnValueOnce(mockStatsData.thisWeek)
          .mockReturnValueOnce(mockStatsData.thisMonth);

        mockAll
          .mockReturnValueOnce(mockStatsData.byStatus)
          .mockReturnValueOnce(mockStatsData.byLanguage);
      });

      it('should return JSON response', async () => {
        const response = await request(app).get('/api/blog/stats');

        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/json/);
      });

      it('should have success flag in response', async () => {
        const response = await request(app).get('/api/blog/stats');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success');
        expect(typeof response.body.success).toBe('boolean');
      });

      it('should have stats object in response', async () => {
        const response = await request(app).get('/api/blog/stats');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('stats');
        expect(typeof response.body.stats).toBe('object');
      });

      it('should have all required stats properties', async () => {
        const response = await request(app).get('/api/blog/stats');

        expect(response.status).toBe(200);
        const { stats } = response.body;

        expect(stats).toHaveProperty('total');
        expect(stats).toHaveProperty('today');
        expect(stats).toHaveProperty('thisWeek');
        expect(stats).toHaveProperty('thisMonth');
        expect(stats).toHaveProperty('byStatus');
        expect(stats).toHaveProperty('byLanguage');
      });

      it('should have numeric count values', async () => {
        const response = await request(app).get('/api/blog/stats');

        expect(response.status).toBe(200);
        const { stats } = response.body;

        expect(typeof stats.total).toBe('number');
        expect(typeof stats.today).toBe('number');
        expect(typeof stats.thisWeek).toBe('number');
        expect(typeof stats.thisMonth).toBe('number');
      });

      it('should have array breakdowns', async () => {
        const response = await request(app).get('/api/blog/stats');

        expect(response.status).toBe(200);
        const { stats } = response.body;

        expect(Array.isArray(stats.byStatus)).toBe(true);
        expect(Array.isArray(stats.byLanguage)).toBe(true);
      });
    });
  });
});
