import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import request from 'supertest';
import express, { Express, Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import leadsRouter from '../leads.js';
import db from '../../config/database.js';

// Mock the database module
vi.mock('../../config/database.js', () => ({
  default: {
    prepare: vi.fn(),
    exec: vi.fn(),
  },
}));

// Mock the email service
vi.mock('../../services/emailService.js', () => ({
  emailService: {
    sendLeadEmails: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock the auth middleware
vi.mock('../../middleware/auth.js', () => ({
  authenticateToken: vi.fn((req: Request, res: Response, next: NextFunction) => {
    // By default, allow requests (will be overridden in tests)
    next();
  }),
}));

// Mock the security middleware
vi.mock('../../middleware/security.js', () => ({
  leadRateLimiter: vi.fn((req: Request, res: Response, next: NextFunction) => {
    // By default, allow requests
    next();
  }),
  sanitizeLeadInput: vi.fn((req: Request, res: Response, next: NextFunction) => {
    // By default, allow requests
    next();
  }),
}));

describe('Leads API', () => {
  let app: Express;
  let mockPrepare: Mock;
  let mockGet: Mock;
  let mockAll: Mock;
  let mockRun: Mock;
  let mockAuthMiddleware: Mock;
  let mockLeadRateLimiter: Mock;
  let mockSanitizeLeadInput: Mock;

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use('/api/leads', leadsRouter);

    // Import the mocked modules
    const authModule = await import('../../middleware/auth.js');
    const securityModule = await import('../../middleware/security.js');
    mockAuthMiddleware = authModule.authenticateToken as Mock;
    mockLeadRateLimiter = securityModule.leadRateLimiter as Mock;
    mockSanitizeLeadInput = securityModule.sanitizeLeadInput as Mock;

    // Reset all mocks
    vi.clearAllMocks();

    // Setup mock functions for database
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

    // Default: Allow rate-limited requests
    mockLeadRateLimiter.mockImplementation((req: Request, res: Response, next: NextFunction) => {
      next();
    });

    // Default: Allow sanitized requests
    mockSanitizeLeadInput.mockImplementation((req: Request, res: Response, next: NextFunction) => {
      next();
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /', () => {
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
      mockRun.mockReturnValue({ lastInsertRowid: 1 });
    });

    it('should create a new lead with all fields', async () => {
      const response = await request(app)
        .post('/api/leads')
        .send(validLead);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        success: true,
        message: 'Lead captured successfully',
        leadId: 1,
      });

      expect(mockPrepare).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO leads')
      );
      expect(mockRun).toHaveBeenCalledWith(
        validLead.name,
        validLead.email,
        validLead.company,
        validLead.phone,
        validLead.restaurant_type,
        validLead.message,
        validLead.form_type,
        validLead.source_page
      );
    });

    it('should create a lead with only required fields (name and email)', async () => {
      const minimalLead = {
        name: 'Jane Smith',
        email: 'jane@example.com',
      };

      const response = await request(app)
        .post('/api/leads')
        .send(minimalLead);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.leadId).toBe(1);

      expect(mockRun).toHaveBeenCalledWith(
        minimalLead.name,
        minimalLead.email,
        null,
        null,
        null,
        null,
        'contact',
        null
      );
    });

    it('should return 400 when name is missing', async () => {
      const leadWithoutName = {
        email: 'john@example.com',
        company: 'Example Corp',
      };

      const response = await request(app)
        .post('/api/leads')
        .send(leadWithoutName);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: 'Name and email are required',
      });

      expect(mockRun).not.toHaveBeenCalled();
    });

    it('should return 400 when email is missing', async () => {
      const leadWithoutEmail = {
        name: 'John Doe',
        company: 'Example Corp',
      };

      const response = await request(app)
        .post('/api/leads')
        .send(leadWithoutEmail);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: 'Name and email are required',
      });

      expect(mockRun).not.toHaveBeenCalled();
    });

    it('should return 400 when both name and email are missing', async () => {
      const leadWithoutRequired = {
        company: 'Example Corp',
        phone: '+1234567890',
      };

      const response = await request(app)
        .post('/api/leads')
        .send(leadWithoutRequired);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: 'Name and email are required',
      });

      expect(mockRun).not.toHaveBeenCalled();
    });

    it('should apply rate limiting middleware', async () => {
      await request(app)
        .post('/api/leads')
        .send(validLead);

      expect(mockLeadRateLimiter).toHaveBeenCalled();
    });

    it('should apply input sanitization middleware', async () => {
      await request(app)
        .post('/api/leads')
        .send(validLead);

      expect(mockSanitizeLeadInput).toHaveBeenCalled();
    });

    it('should handle rate limit exceeded', async () => {
      mockLeadRateLimiter.mockImplementationOnce((req: Request, res: Response, next: NextFunction) => {
        res.status(429).json({
          error: 'Too many submissions from this IP, please try again later',
        });
      });

      const response = await request(app)
        .post('/api/leads')
        .send(validLead);

      expect(response.status).toBe(429);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle database errors gracefully', async () => {
      mockRun.mockImplementationOnce(() => {
        throw new Error('Database connection error');
      });

      const response = await request(app)
        .post('/api/leads')
        .send(validLead);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        error: 'Failed to capture lead',
      });
    });

    it('should default form_type to "contact" when not provided', async () => {
      const leadWithoutFormType = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      await request(app)
        .post('/api/leads')
        .send(leadWithoutFormType);

      expect(mockRun).toHaveBeenCalledWith(
        'John Doe',
        'john@example.com',
        null,
        null,
        null,
        null,
        'contact',
        null
      );
    });

    it('should accept custom form_type values', async () => {
      const leadWithFormType = {
        name: 'John Doe',
        email: 'john@example.com',
        form_type: 'demo-request',
      };

      await request(app)
        .post('/api/leads')
        .send(leadWithFormType);

      expect(mockRun).toHaveBeenCalledWith(
        'John Doe',
        'john@example.com',
        null,
        null,
        null,
        null,
        'demo-request',
        null
      );
    });
  });

  describe('GET /', () => {
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
        form_type: 'demo-request',
        source_page: '/integrations',
        created_at: '2026-01-10T09:00:00Z',
      },
    ];

    describe('Authentication', () => {
      beforeEach(() => {
        mockAuthMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
          res.status(401).json({ error: 'No token provided', code: 'NO_TOKEN' });
        });
      });

      it('should return 401 without authentication', async () => {
        const response = await request(app).get('/api/leads');

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error');
        expect(mockAuthMiddleware).toHaveBeenCalled();
      });
    });

    describe('Authenticated Requests', () => {
      beforeEach(() => {
        mockAuthMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
          (req as any).user = { id: 1, username: 'testuser' };
          next();
        });
      });

      it('should return leads with default pagination (page 1, limit 50)', async () => {
        mockAll.mockReturnValueOnce(mockLeads);
        mockGet.mockReturnValueOnce({ count: 2 });

        const response = await request(app).get('/api/leads');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          success: true,
          leads: mockLeads,
          pagination: {
            page: 1,
            limit: 50,
            total: 2,
            pages: 1,
          },
        });

        expect(mockPrepare).toHaveBeenCalledWith(
          expect.stringContaining('SELECT * FROM leads')
        );
        expect(mockAll).toHaveBeenCalledWith(50, 0);
      });

      it('should return leads with custom pagination (page 2, limit 10)', async () => {
        mockAll.mockReturnValueOnce(mockLeads);
        mockGet.mockReturnValueOnce({ count: 25 });

        const response = await request(app)
          .get('/api/leads')
          .query({ page: 2, limit: 10 });

        expect(response.status).toBe(200);
        expect(response.body.pagination).toEqual({
          page: 2,
          limit: 10,
          total: 25,
          pages: 3,
        });

        expect(mockAll).toHaveBeenCalledWith(10, 10);
      });

      it('should return leads with page 3, limit 20', async () => {
        mockAll.mockReturnValueOnce([]);
        mockGet.mockReturnValueOnce({ count: 100 });

        const response = await request(app)
          .get('/api/leads')
          .query({ page: 3, limit: 20 });

        expect(response.status).toBe(200);
        expect(response.body.pagination).toEqual({
          page: 3,
          limit: 20,
          total: 100,
          pages: 5,
        });

        expect(mockAll).toHaveBeenCalledWith(20, 40);
      });

      it('should return empty array when no leads exist', async () => {
        mockAll.mockReturnValueOnce([]);
        mockGet.mockReturnValueOnce({ count: 0 });

        const response = await request(app).get('/api/leads');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
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
        mockAll.mockImplementationOnce(() => {
          throw new Error('Database connection error');
        });

        const response = await request(app).get('/api/leads');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
          success: false,
          error: 'Failed to fetch leads',
        });
      });

      it('should order leads by created_at DESC', async () => {
        mockAll.mockReturnValueOnce(mockLeads);
        mockGet.mockReturnValueOnce({ count: 2 });

        await request(app).get('/api/leads');

        expect(mockPrepare).toHaveBeenCalledWith(
          expect.stringContaining('ORDER BY created_at DESC')
        );
      });
    });
  });

  describe('GET /stats', () => {
    const mockStats = {
      total: { count: 100 },
      today: { count: 5 },
      thisWeek: { count: 15 },
      thisMonth: { count: 30 },
      byType: [
        { form_type: 'contact', count: 60 },
        { form_type: 'demo-request', count: 40 },
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
        mockAuthMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
          res.status(401).json({ error: 'No token provided', code: 'NO_TOKEN' });
        });
      });

      it('should return 401 without authentication', async () => {
        const response = await request(app).get('/api/leads/stats');

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error');
        expect(mockAuthMiddleware).toHaveBeenCalled();
      });
    });

    describe('Authenticated Requests', () => {
      beforeEach(() => {
        mockAuthMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
          (req as any).user = { id: 1, username: 'testuser' };
          next();
        });
      });

      it('should return lead statistics', async () => {
        mockGet
          .mockReturnValueOnce(mockStats.total)
          .mockReturnValueOnce(mockStats.today)
          .mockReturnValueOnce(mockStats.thisWeek)
          .mockReturnValueOnce(mockStats.thisMonth);
        mockAll
          .mockReturnValueOnce(mockStats.byType)
          .mockReturnValueOnce(mockStats.bySource);

        const response = await request(app).get('/api/leads/stats');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
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

        // Verify all statistics queries were executed
        expect(mockPrepare).toHaveBeenCalledWith(
          expect.stringContaining('SELECT COUNT(*) as count FROM leads')
        );
        expect(mockPrepare).toHaveBeenCalledWith(
          expect.stringContaining("DATE(created_at) = DATE('now')")
        );
        expect(mockPrepare).toHaveBeenCalledWith(
          expect.stringContaining("created_at >= datetime('now', '-7 days')")
        );
        expect(mockPrepare).toHaveBeenCalledWith(
          expect.stringContaining("created_at >= datetime('now', '-30 days')")
        );
        expect(mockPrepare).toHaveBeenCalledWith(
          expect.stringContaining('GROUP BY form_type')
        );
        expect(mockPrepare).toHaveBeenCalledWith(
          expect.stringContaining('GROUP BY source_page')
        );
      });

      it('should return zero values when no leads exist', async () => {
        mockGet
          .mockReturnValueOnce({ count: 0 })
          .mockReturnValueOnce({ count: 0 })
          .mockReturnValueOnce({ count: 0 })
          .mockReturnValueOnce({ count: 0 });
        mockAll
          .mockReturnValueOnce([])
          .mockReturnValueOnce([]);

        const response = await request(app).get('/api/leads/stats');

        expect(response.status).toBe(200);
        expect(response.body.stats).toEqual({
          total: 0,
          today: 0,
          thisWeek: 0,
          thisMonth: 0,
          byType: [],
          bySource: [],
        });
      });

      it('should handle database errors gracefully', async () => {
        mockGet.mockImplementationOnce(() => {
          throw new Error('Database connection error');
        });

        const response = await request(app).get('/api/leads/stats');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
          success: false,
          error: 'Failed to fetch stats',
        });
      });

      it('should limit bySource to top 5 sources', async () => {
        mockGet
          .mockReturnValue({ count: 100 })
          .mockReturnValue({ count: 100 })
          .mockReturnValue({ count: 100 })
          .mockReturnValue({ count: 100 });
        mockAll
          .mockReturnValueOnce([])
          .mockReturnValueOnce(mockStats.bySource);

        await request(app).get('/api/leads/stats');

        expect(mockPrepare).toHaveBeenCalledWith(
          expect.stringContaining('LIMIT 5')
        );
      });
    });
  });

  describe('GET /:id', () => {
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
        mockAuthMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
          res.status(401).json({ error: 'No token provided', code: 'NO_TOKEN' });
        });
      });

      it('should return 401 without authentication', async () => {
        const response = await request(app).get('/api/leads/1');

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error');
        expect(mockAuthMiddleware).toHaveBeenCalled();
      });
    });

    describe('Authenticated Requests', () => {
      beforeEach(() => {
        mockAuthMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
          (req as any).user = { id: 1, username: 'testuser' };
          next();
        });
      });

      it('should return a single lead by id', async () => {
        mockGet.mockReturnValueOnce(mockLead);

        const response = await request(app).get('/api/leads/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          success: true,
          lead: mockLead,
        });

        expect(mockPrepare).toHaveBeenCalledWith(
          'SELECT * FROM leads WHERE id = ?'
        );
        expect(mockGet).toHaveBeenCalledWith('1');
      });

      it('should return 404 when lead is not found', async () => {
        mockGet.mockReturnValueOnce(undefined);

        const response = await request(app).get('/api/leads/999');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({
          success: false,
          error: 'Lead not found',
        });
      });

      it('should handle database errors gracefully', async () => {
        mockGet.mockImplementationOnce(() => {
          throw new Error('Database connection error');
        });

        const response = await request(app).get('/api/leads/1');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
          success: false,
          error: 'Failed to fetch lead',
        });
      });

      it('should handle string id parameter', async () => {
        mockGet.mockReturnValueOnce(mockLead);

        const response = await request(app).get('/api/leads/abc');

        expect(response.status).toBe(200);
        expect(mockGet).toHaveBeenCalledWith('abc');
      });
    });
  });

  describe('DELETE /:id', () => {
    describe('Authentication', () => {
      beforeEach(() => {
        mockAuthMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
          res.status(401).json({ error: 'No token provided', code: 'NO_TOKEN' });
        });
      });

      it('should return 401 without authentication', async () => {
        const response = await request(app).delete('/api/leads/1');

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error');
        expect(mockAuthMiddleware).toHaveBeenCalled();
      });
    });

    describe('Authenticated Requests', () => {
      beforeEach(() => {
        mockAuthMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
          (req as any).user = { id: 1, username: 'testuser' };
          next();
        });
      });

      it('should delete a lead successfully', async () => {
        mockRun.mockReturnValueOnce({ changes: 1 });

        const response = await request(app).delete('/api/leads/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          success: true,
          message: 'Lead deleted successfully',
        });

        expect(mockPrepare).toHaveBeenCalledWith(
          'DELETE FROM leads WHERE id = ?'
        );
        expect(mockRun).toHaveBeenCalledWith('1');
      });

      it('should return 404 when lead to delete is not found', async () => {
        mockRun.mockReturnValueOnce({ changes: 0 });

        const response = await request(app).delete('/api/leads/999');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({
          success: false,
          error: 'Lead not found',
        });
      });

      it('should handle database errors gracefully', async () => {
        mockRun.mockImplementationOnce(() => {
          throw new Error('Database connection error');
        });

        const response = await request(app).delete('/api/leads/1');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
          success: false,
          error: 'Failed to delete lead',
        });
      });

      it('should handle string id parameter', async () => {
        mockRun.mockReturnValueOnce({ changes: 1 });

        const response = await request(app).delete('/api/leads/abc');

        expect(response.status).toBe(200);
        expect(mockRun).toHaveBeenCalledWith('abc');
      });
    });
  });
});
