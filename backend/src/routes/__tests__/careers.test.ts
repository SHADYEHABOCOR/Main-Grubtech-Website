import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import request from 'supertest';
import express, { Express, Request, Response, NextFunction } from 'express';
import careersRouter from '../careers.js';
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

// Mock the email service
vi.mock('../../services/emailService.js', () => ({
  emailService: {
    sendLeadEmails: vi.fn(),
  },
}));

describe('Careers API', () => {
  let app: Express;
  let mockPrepare: Mock;
  let mockGet: Mock;
  let mockAll: Mock;
  let mockRun: Mock;
  let mockAuthMiddleware: Mock;

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    app.use('/api/careers', careersRouter);

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
      vacancies: {
        total: { count: 25 },
        byDepartment: [
          { department: 'Engineering', count: 10 },
          { department: 'Marketing', count: 8 },
          { department: 'Sales', count: 7 },
        ],
        byLocation: [
          { location: 'Dubai', count: 15 },
          { location: 'Abu Dhabi', count: 10 },
        ],
        byType: [
          { type: 'Full-time', count: 20 },
          { type: 'Part-time', count: 5 },
        ],
        byStatus: [
          { status: 'active', count: 22 },
          { status: 'inactive', count: 3 },
        ],
      },
      applications: {
        total: { count: 150 },
        today: { count: 5 },
        thisWeek: { count: 20 },
        thisMonth: { count: 45 },
        byStatus: [
          { status: 'new', count: 80 },
          { status: 'reviewed', count: 50 },
          { status: 'rejected', count: 20 },
        ],
      },
    };

    describe('Authentication', () => {
      beforeEach(() => {
        // Configure mock to reject unauthenticated requests
        mockAuthMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
          res.status(401).json({ error: 'No token provided', code: 'NO_TOKEN' });
        });
      });

      it('should return 401 without authentication', async () => {
        const response = await request(app).get('/api/careers/stats');

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
        // Vacancies queries
        mockGet
          .mockReturnValueOnce(mockStatsData.vacancies.total)
          .mockReturnValueOnce(mockStatsData.applications.total)
          .mockReturnValueOnce(mockStatsData.applications.today)
          .mockReturnValueOnce(mockStatsData.applications.thisWeek)
          .mockReturnValueOnce(mockStatsData.applications.thisMonth);

        mockAll
          .mockReturnValueOnce(mockStatsData.vacancies.byDepartment)
          .mockReturnValueOnce(mockStatsData.vacancies.byLocation)
          .mockReturnValueOnce(mockStatsData.vacancies.byType)
          .mockReturnValueOnce(mockStatsData.vacancies.byStatus)
          .mockReturnValueOnce(mockStatsData.applications.byStatus);
      });

      it('should return careers stats successfully', async () => {
        const response = await request(app).get('/api/careers/stats');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('stats');
        expect(mockAuthMiddleware).toHaveBeenCalled();
      });

      it('should return correct stats structure', async () => {
        const response = await request(app).get('/api/careers/stats');

        expect(response.status).toBe(200);
        expect(response.body.stats).toHaveProperty('vacancies');
        expect(response.body.stats).toHaveProperty('applications');
      });

      it('should return correct vacancies structure', async () => {
        const response = await request(app).get('/api/careers/stats');

        expect(response.status).toBe(200);
        const { vacancies } = response.body.stats;

        expect(vacancies).toHaveProperty('total', 25);
        expect(vacancies).toHaveProperty('byDepartment');
        expect(vacancies).toHaveProperty('byLocation');
        expect(vacancies).toHaveProperty('byType');
        expect(vacancies).toHaveProperty('byStatus');
      });

      it('should return correct applications structure', async () => {
        const response = await request(app).get('/api/careers/stats');

        expect(response.status).toBe(200);
        const { applications } = response.body.stats;

        expect(applications).toHaveProperty('total', 150);
        expect(applications).toHaveProperty('today', 5);
        expect(applications).toHaveProperty('thisWeek', 20);
        expect(applications).toHaveProperty('thisMonth', 45);
        expect(applications).toHaveProperty('byStatus');
      });

      it('should return correct byDepartment breakdown', async () => {
        const response = await request(app).get('/api/careers/stats');

        expect(response.status).toBe(200);
        expect(response.body.stats.vacancies.byDepartment).toEqual([
          { department: 'Engineering', count: 10 },
          { department: 'Marketing', count: 8 },
          { department: 'Sales', count: 7 },
        ]);
      });

      it('should return correct byLocation breakdown', async () => {
        const response = await request(app).get('/api/careers/stats');

        expect(response.status).toBe(200);
        expect(response.body.stats.vacancies.byLocation).toEqual([
          { location: 'Dubai', count: 15 },
          { location: 'Abu Dhabi', count: 10 },
        ]);
      });

      it('should return correct byType breakdown', async () => {
        const response = await request(app).get('/api/careers/stats');

        expect(response.status).toBe(200);
        expect(response.body.stats.vacancies.byType).toEqual([
          { type: 'Full-time', count: 20 },
          { type: 'Part-time', count: 5 },
        ]);
      });

      it('should return correct vacancy byStatus breakdown', async () => {
        const response = await request(app).get('/api/careers/stats');

        expect(response.status).toBe(200);
        expect(response.body.stats.vacancies.byStatus).toEqual([
          { status: 'active', count: 22 },
          { status: 'inactive', count: 3 },
        ]);
      });

      it('should return correct application byStatus breakdown', async () => {
        const response = await request(app).get('/api/careers/stats');

        expect(response.status).toBe(200);
        expect(response.body.stats.applications.byStatus).toEqual([
          { status: 'new', count: 80 },
          { status: 'reviewed', count: 50 },
          { status: 'rejected', count: 20 },
        ]);
      });

      it('should execute correct SQL queries', async () => {
        await request(app).get('/api/careers/stats');

        // Verify prepare was called correct number of times
        // 1 for vacancies.total + 4 grouped queries for vacancies (byDepartment, byLocation, byType, byStatus)
        // 4 for applications (total, today, thisWeek, thisMonth) + 1 grouped query (byStatus)
        expect(mockPrepare).toHaveBeenCalledTimes(10);

        // Verify the queries
        const calls = mockPrepare.mock.calls;

        // Vacancies queries
        expect(calls[0][0]).toContain('SELECT COUNT(*) as count FROM job_vacancies');
        expect(calls[1][0]).toContain('SELECT department, COUNT(*) as count FROM job_vacancies GROUP BY department');
        expect(calls[2][0]).toContain('SELECT location, COUNT(*) as count FROM job_vacancies GROUP BY location');
        expect(calls[3][0]).toContain('SELECT type, COUNT(*) as count FROM job_vacancies GROUP BY type');
        expect(calls[4][0]).toContain('SELECT status, COUNT(*) as count FROM job_vacancies GROUP BY status');

        // Applications queries
        expect(calls[5][0]).toContain('SELECT COUNT(*) as count FROM job_applications');
        expect(calls[6][0]).toContain("SELECT COUNT(*) as count FROM job_applications WHERE DATE(created_at) = DATE('now')");
        expect(calls[7][0]).toContain("SELECT COUNT(*) as count FROM job_applications WHERE created_at >= datetime('now', '-7 days')");
        expect(calls[8][0]).toContain("SELECT COUNT(*) as count FROM job_applications WHERE created_at >= datetime('now', '-30 days')");
        expect(calls[9][0]).toContain('SELECT status, COUNT(*) as count FROM job_applications GROUP BY status');
      });

      it('should return zero values when no data exists', async () => {
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
          .mockReturnValueOnce({ count: 0 })
          .mockReturnValueOnce({ count: 0 });

        mockAll
          .mockReturnValueOnce([])
          .mockReturnValueOnce([])
          .mockReturnValueOnce([])
          .mockReturnValueOnce([])
          .mockReturnValueOnce([]);

        const response = await request(app).get('/api/careers/stats');

        expect(response.status).toBe(200);
        expect(response.body.stats.vacancies).toEqual({
          total: 0,
          byDepartment: [],
          byLocation: [],
          byType: [],
          byStatus: [],
        });
        expect(response.body.stats.applications).toEqual({
          total: 0,
          today: 0,
          thisWeek: 0,
          thisMonth: 0,
          byStatus: [],
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
          .mockReturnValueOnce({ count: 5 })
          .mockReturnValueOnce({ count: 10 })
          .mockReturnValueOnce({ count: 0 })
          .mockReturnValueOnce({ count: 3 })
          .mockReturnValueOnce({ count: 7 });

        mockAll
          .mockReturnValueOnce([{ department: 'Engineering', count: 5 }])
          .mockReturnValueOnce([{ location: 'Dubai', count: 5 }])
          .mockReturnValueOnce([{ type: 'Full-time', count: 5 }])
          .mockReturnValueOnce([{ status: 'active', count: 5 }])
          .mockReturnValueOnce([{ status: 'new', count: 10 }]);

        const response = await request(app).get('/api/careers/stats');

        expect(response.status).toBe(200);
        expect(response.body.stats.vacancies).toEqual({
          total: 5,
          byDepartment: [{ department: 'Engineering', count: 5 }],
          byLocation: [{ location: 'Dubai', count: 5 }],
          byType: [{ type: 'Full-time', count: 5 }],
          byStatus: [{ status: 'active', count: 5 }],
        });
        expect(response.body.stats.applications).toEqual({
          total: 10,
          today: 0,
          thisWeek: 3,
          thisMonth: 7,
          byStatus: [{ status: 'new', count: 10 }],
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

        const response = await request(app).get('/api/careers/stats');

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Failed to fetch stats');
      });

      it('should handle query execution errors', async () => {
        mockGet.mockImplementationOnce(() => {
          throw new Error('Query execution failed');
        });

        const response = await request(app).get('/api/careers/stats');

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Failed to fetch stats');
      });

      it('should handle errors in vacancies grouped queries', async () => {
        // Total count succeeds
        mockGet.mockReturnValueOnce({ count: 25 });

        // byDepartment query fails
        mockAll.mockImplementationOnce(() => {
          throw new Error('Group by query failed');
        });

        const response = await request(app).get('/api/careers/stats');

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Failed to fetch stats');
      });

      it('should handle errors in applications queries', async () => {
        // Vacancies queries succeed
        mockGet.mockReturnValueOnce({ count: 25 });
        mockAll
          .mockReturnValueOnce([{ department: 'Engineering', count: 10 }])
          .mockReturnValueOnce([{ location: 'Dubai', count: 15 }])
          .mockReturnValueOnce([{ type: 'Full-time', count: 20 }])
          .mockReturnValueOnce([{ status: 'active', count: 22 }]);

        // Applications total query fails
        mockGet.mockImplementationOnce(() => {
          throw new Error('Applications query failed');
        });

        const response = await request(app).get('/api/careers/stats');

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
          .mockReturnValueOnce(mockStatsData.vacancies.total)
          .mockReturnValueOnce(mockStatsData.applications.total)
          .mockReturnValueOnce(mockStatsData.applications.today)
          .mockReturnValueOnce(mockStatsData.applications.thisWeek)
          .mockReturnValueOnce(mockStatsData.applications.thisMonth);

        mockAll
          .mockReturnValueOnce(mockStatsData.vacancies.byDepartment)
          .mockReturnValueOnce(mockStatsData.vacancies.byLocation)
          .mockReturnValueOnce(mockStatsData.vacancies.byType)
          .mockReturnValueOnce(mockStatsData.vacancies.byStatus)
          .mockReturnValueOnce(mockStatsData.applications.byStatus);
      });

      it('should return JSON response', async () => {
        const response = await request(app).get('/api/careers/stats');

        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/json/);
      });

      it('should have success flag in response', async () => {
        const response = await request(app).get('/api/careers/stats');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success');
        expect(typeof response.body.success).toBe('boolean');
      });

      it('should have stats object in response', async () => {
        const response = await request(app).get('/api/careers/stats');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('stats');
        expect(typeof response.body.stats).toBe('object');
      });

      it('should have vacancies and applications sections', async () => {
        const response = await request(app).get('/api/careers/stats');

        expect(response.status).toBe(200);
        const { stats } = response.body;

        expect(stats).toHaveProperty('vacancies');
        expect(stats).toHaveProperty('applications');
        expect(typeof stats.vacancies).toBe('object');
        expect(typeof stats.applications).toBe('object');
      });

      it('should have all required vacancies properties', async () => {
        const response = await request(app).get('/api/careers/stats');

        expect(response.status).toBe(200);
        const { vacancies } = response.body.stats;

        expect(vacancies).toHaveProperty('total');
        expect(vacancies).toHaveProperty('byDepartment');
        expect(vacancies).toHaveProperty('byLocation');
        expect(vacancies).toHaveProperty('byType');
        expect(vacancies).toHaveProperty('byStatus');
      });

      it('should have all required applications properties', async () => {
        const response = await request(app).get('/api/careers/stats');

        expect(response.status).toBe(200);
        const { applications } = response.body.stats;

        expect(applications).toHaveProperty('total');
        expect(applications).toHaveProperty('today');
        expect(applications).toHaveProperty('thisWeek');
        expect(applications).toHaveProperty('thisMonth');
        expect(applications).toHaveProperty('byStatus');
      });

      it('should have numeric count values in vacancies', async () => {
        const response = await request(app).get('/api/careers/stats');

        expect(response.status).toBe(200);
        const { vacancies } = response.body.stats;

        expect(typeof vacancies.total).toBe('number');
      });

      it('should have numeric count values in applications', async () => {
        const response = await request(app).get('/api/careers/stats');

        expect(response.status).toBe(200);
        const { applications } = response.body.stats;

        expect(typeof applications.total).toBe('number');
        expect(typeof applications.today).toBe('number');
        expect(typeof applications.thisWeek).toBe('number');
        expect(typeof applications.thisMonth).toBe('number');
      });

      it('should have array breakdowns in vacancies', async () => {
        const response = await request(app).get('/api/careers/stats');

        expect(response.status).toBe(200);
        const { vacancies } = response.body.stats;

        expect(Array.isArray(vacancies.byDepartment)).toBe(true);
        expect(Array.isArray(vacancies.byLocation)).toBe(true);
        expect(Array.isArray(vacancies.byType)).toBe(true);
        expect(Array.isArray(vacancies.byStatus)).toBe(true);
      });

      it('should have array breakdown in applications', async () => {
        const response = await request(app).get('/api/careers/stats');

        expect(response.status).toBe(200);
        const { applications } = response.body.stats;

        expect(Array.isArray(applications.byStatus)).toBe(true);
      });
    });
  });
});
