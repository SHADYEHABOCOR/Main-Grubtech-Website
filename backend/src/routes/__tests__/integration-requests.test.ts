import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import request from 'supertest';
import express, { Express, Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import integrationRequestsRouter from '../integration-requests.js';
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

describe('Integration Requests API', () => {
  let app: Express;
  let mockPrepare: Mock;
  let mockGet: Mock;
  let mockAll: Mock;
  let mockRun: Mock;
  let mockAuthMiddleware: Mock;

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use('/api/integration-requests', integrationRequestsRouter);

    // Import the mocked auth middleware
    const authModule = await import('../../middleware/auth.js');
    mockAuthMiddleware = authModule.authenticateToken as Mock;

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
      (req as any).user = { id: 1, username: 'testadmin' };
      next();
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('POST / - Submit integration request (public)', () => {
    it('should successfully create an integration request with all fields', async () => {
      const requestData = {
        email: 'test@example.com',
        company_name: 'Test Company',
        message: 'We are interested in integrating with your platform.',
      };

      mockRun.mockReturnValue({ lastInsertRowid: 1 });

      const response = await request(app)
        .post('/api/integration-requests')
        .send(requestData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: 'Integration request submitted successfully',
        id: 1,
      });
      expect(mockPrepare).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO integration_requests')
      );
      expect(mockRun).toHaveBeenCalledWith(
        requestData.email,
        requestData.company_name,
        requestData.message
      );
    });

    it('should successfully create an integration request with only email', async () => {
      const requestData = {
        email: 'test@example.com',
      };

      mockRun.mockReturnValue({ lastInsertRowid: 2 });

      const response = await request(app)
        .post('/api/integration-requests')
        .send(requestData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: 'Integration request submitted successfully',
        id: 2,
      });
      expect(mockRun).toHaveBeenCalledWith(
        requestData.email,
        null,
        null
      );
    });

    it('should return 400 if email is missing', async () => {
      const response = await request(app)
        .post('/api/integration-requests')
        .send({
          company_name: 'Test Company',
          message: 'Test message',
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].msg).toContain('Valid email is required');
      expect(mockRun).not.toHaveBeenCalled();
    });

    it('should return 400 if email is invalid', async () => {
      const response = await request(app)
        .post('/api/integration-requests')
        .send({
          email: 'invalid-email',
          company_name: 'Test Company',
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].msg).toContain('Valid email is required');
      expect(mockRun).not.toHaveBeenCalled();
    });

    it('should return 400 if company_name exceeds max length', async () => {
      const response = await request(app)
        .post('/api/integration-requests')
        .send({
          email: 'test@example.com',
          company_name: 'A'.repeat(256), // Exceeds 255 char limit
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
      expect(mockRun).not.toHaveBeenCalled();
    });

    it('should return 400 if message exceeds max length', async () => {
      const response = await request(app)
        .post('/api/integration-requests')
        .send({
          email: 'test@example.com',
          message: 'A'.repeat(2001), // Exceeds 2000 char limit
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
      expect(mockRun).not.toHaveBeenCalled();
    });

    it('should trim whitespace from optional fields', async () => {
      const requestData = {
        email: 'test@example.com',
        company_name: '  Test Company  ',
        message: '  Test message  ',
      };

      mockRun.mockReturnValue({ lastInsertRowid: 3 });

      const response = await request(app)
        .post('/api/integration-requests')
        .send(requestData);

      expect(response.status).toBe(201);
      expect(mockRun).toHaveBeenCalledWith(
        requestData.email,
        'Test Company',
        'Test message'
      );
    });

    it('should return 500 if database error occurs', async () => {
      mockRun.mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await request(app)
        .post('/api/integration-requests')
        .send({
          email: 'test@example.com',
        });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Server error' });
    });
  });

  describe('GET /admin - List integration requests (protected)', () => {
    it('should require authentication', async () => {
      mockAuthMiddleware.mockImplementation((req: Request, res: Response) => {
        res.status(401).json({ error: 'Unauthorized' });
      });

      const response = await request(app)
        .get('/api/integration-requests/admin');

      expect(response.status).toBe(401);
      expect(mockGet).not.toHaveBeenCalled();
    });

    it('should return paginated integration requests with default pagination', async () => {
      const mockRequests = [
        {
          id: 3,
          email: 'test3@example.com',
          company_name: 'Company 3',
          message: 'Message 3',
          status: 'pending',
          created_at: '2024-01-03T00:00:00Z',
          updated_at: '2024-01-03T00:00:00Z',
        },
        {
          id: 2,
          email: 'test2@example.com',
          company_name: 'Company 2',
          message: 'Message 2',
          status: 'contacted',
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      ];

      mockGet.mockReturnValue({ total: 25 });
      mockAll.mockReturnValue(mockRequests);

      const response = await request(app)
        .get('/api/integration-requests/admin');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockRequests);
      expect(response.body.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 25,
        totalPages: 2,
        hasMore: true,
      });
      expect(mockPrepare).toHaveBeenCalledWith(
        expect.stringContaining('SELECT COUNT(*) as total FROM integration_requests')
      );
      expect(mockPrepare).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM integration_requests')
      );
    });

    it('should return paginated integration requests with custom page and limit', async () => {
      const mockRequests = [
        {
          id: 5,
          email: 'test5@example.com',
          company_name: 'Company 5',
          message: null,
          status: 'pending',
          created_at: '2024-01-05T00:00:00Z',
          updated_at: '2024-01-05T00:00:00Z',
        },
      ];

      mockGet.mockReturnValue({ total: 50 });
      mockAll.mockReturnValue(mockRequests);

      const response = await request(app)
        .get('/api/integration-requests/admin?page=3&limit=10');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockRequests);
      expect(response.body.pagination).toEqual({
        page: 3,
        limit: 10,
        total: 50,
        totalPages: 5,
        hasMore: true,
      });
      expect(mockAll).toHaveBeenCalledWith(10, 20); // offset = (3-1) * 10 = 20
    });

    it('should filter integration requests by status', async () => {
      const mockRequests = [
        {
          id: 1,
          email: 'test1@example.com',
          company_name: 'Company 1',
          message: 'Message 1',
          status: 'contacted',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      mockGet.mockReturnValue({ total: 5 });
      mockAll.mockReturnValue(mockRequests);

      const response = await request(app)
        .get('/api/integration-requests/admin?status=contacted');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockRequests);
      expect(response.body.pagination.total).toBe(5);
      expect(mockPrepare).toHaveBeenCalledWith(
        expect.stringContaining('WHERE status = ?')
      );
      expect(mockGet).toHaveBeenCalledWith('contacted');
      expect(mockAll).toHaveBeenCalledWith('contacted', 20, 0);
    });

    it('should handle multiple status filters', async () => {
      const mockRequests = [
        {
          id: 2,
          email: 'test2@example.com',
          company_name: 'Company 2',
          message: null,
          status: 'completed',
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      ];

      mockGet.mockReturnValue({ total: 3 });
      mockAll.mockReturnValue(mockRequests);

      const response = await request(app)
        .get('/api/integration-requests/admin?status=completed');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockRequests);
      expect(mockGet).toHaveBeenCalledWith('completed');
    });

    it('should handle page=0 by defaulting to page 1', async () => {
      mockGet.mockReturnValue({ total: 10 });
      mockAll.mockReturnValue([]);

      const response = await request(app)
        .get('/api/integration-requests/admin?page=0');

      expect(response.status).toBe(200);
      expect(response.body.pagination.page).toBe(1);
    });

    it('should handle negative page by defaulting to page 1', async () => {
      mockGet.mockReturnValue({ total: 10 });
      mockAll.mockReturnValue([]);

      const response = await request(app)
        .get('/api/integration-requests/admin?page=-5');

      expect(response.status).toBe(200);
      expect(response.body.pagination.page).toBe(1);
    });

    it('should cap limit at 100', async () => {
      mockGet.mockReturnValue({ total: 200 });
      mockAll.mockReturnValue([]);

      const response = await request(app)
        .get('/api/integration-requests/admin?limit=500');

      expect(response.status).toBe(200);
      expect(response.body.pagination.limit).toBe(100);
      expect(mockAll).toHaveBeenCalledWith(100, 0);
    });

    it('should ensure minimum limit of 1', async () => {
      mockGet.mockReturnValue({ total: 10 });
      mockAll.mockReturnValue([]);

      const response = await request(app)
        .get('/api/integration-requests/admin?limit=0');

      expect(response.status).toBe(200);
      expect(response.body.pagination.limit).toBe(1);
    });

    it('should return empty array when no requests exist', async () => {
      mockGet.mockReturnValue({ total: 0 });
      mockAll.mockReturnValue([]);

      const response = await request(app)
        .get('/api/integration-requests/admin');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
      expect(response.body.pagination.total).toBe(0);
      expect(response.body.pagination.totalPages).toBe(0);
      expect(response.body.pagination.hasMore).toBe(false);
    });

    it('should calculate hasMore correctly when on last page', async () => {
      mockGet.mockReturnValue({ total: 25 });
      mockAll.mockReturnValue([]);

      const response = await request(app)
        .get('/api/integration-requests/admin?page=2&limit=20');

      expect(response.status).toBe(200);
      expect(response.body.pagination.hasMore).toBe(false);
    });

    it('should return 500 if database error occurs', async () => {
      mockGet.mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await request(app)
        .get('/api/integration-requests/admin');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Server error' });
    });
  });

  describe('PATCH /admin/:id - Update integration request status (protected)', () => {
    it('should require authentication', async () => {
      mockAuthMiddleware.mockImplementation((req: Request, res: Response) => {
        res.status(401).json({ error: 'Unauthorized' });
      });

      const response = await request(app)
        .patch('/api/integration-requests/admin/1')
        .send({ status: 'contacted' });

      expect(response.status).toBe(401);
      expect(mockRun).not.toHaveBeenCalled();
    });

    it('should successfully update status to contacted', async () => {
      const mockUpdated = {
        id: 1,
        email: 'test@example.com',
        company_name: 'Test Company',
        message: 'Test message',
        status: 'contacted',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T12:00:00Z',
      };

      mockRun.mockReturnValue({ changes: 1 });
      mockGet.mockReturnValue(mockUpdated);

      const response = await request(app)
        .patch('/api/integration-requests/admin/1')
        .send({ status: 'contacted' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUpdated);
      expect(mockPrepare).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE integration_requests')
      );
      expect(mockRun).toHaveBeenCalledWith('contacted', '1');
    });

    it('should successfully update status to completed', async () => {
      const mockUpdated = {
        id: 2,
        email: 'test2@example.com',
        company_name: 'Company 2',
        message: null,
        status: 'completed',
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T12:00:00Z',
      };

      mockRun.mockReturnValue({ changes: 1 });
      mockGet.mockReturnValue(mockUpdated);

      const response = await request(app)
        .patch('/api/integration-requests/admin/2')
        .send({ status: 'completed' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUpdated);
      expect(mockRun).toHaveBeenCalledWith('completed', '2');
    });

    it('should successfully update status to rejected', async () => {
      const mockUpdated = {
        id: 3,
        email: 'test3@example.com',
        company_name: 'Company 3',
        message: 'Not interested',
        status: 'rejected',
        created_at: '2024-01-03T00:00:00Z',
        updated_at: '2024-01-03T12:00:00Z',
      };

      mockRun.mockReturnValue({ changes: 1 });
      mockGet.mockReturnValue(mockUpdated);

      const response = await request(app)
        .patch('/api/integration-requests/admin/3')
        .send({ status: 'rejected' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUpdated);
      expect(mockRun).toHaveBeenCalledWith('rejected', '3');
    });

    it('should successfully update status to pending', async () => {
      const mockUpdated = {
        id: 4,
        email: 'test4@example.com',
        company_name: null,
        message: null,
        status: 'pending',
        created_at: '2024-01-04T00:00:00Z',
        updated_at: '2024-01-04T12:00:00Z',
      };

      mockRun.mockReturnValue({ changes: 1 });
      mockGet.mockReturnValue(mockUpdated);

      const response = await request(app)
        .patch('/api/integration-requests/admin/4')
        .send({ status: 'pending' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUpdated);
      expect(mockRun).toHaveBeenCalledWith('pending', '4');
    });

    it('should return 400 for invalid status', async () => {
      const response = await request(app)
        .patch('/api/integration-requests/admin/1')
        .send({ status: 'invalid-status' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid status' });
      expect(mockRun).not.toHaveBeenCalled();
    });

    it('should return 400 for missing status', async () => {
      const response = await request(app)
        .patch('/api/integration-requests/admin/1')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid status' });
      expect(mockRun).not.toHaveBeenCalled();
    });

    it('should return 400 for empty string status', async () => {
      const response = await request(app)
        .patch('/api/integration-requests/admin/1')
        .send({ status: '' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid status' });
      expect(mockRun).not.toHaveBeenCalled();
    });

    it('should handle non-existent integration request', async () => {
      mockRun.mockReturnValue({ changes: 0 });
      mockGet.mockReturnValue(undefined);

      const response = await request(app)
        .patch('/api/integration-requests/admin/9999')
        .send({ status: 'contacted' });

      expect(response.status).toBe(200);
      expect(response.body).toBeUndefined();
    });

    it('should return 500 if database error occurs', async () => {
      mockRun.mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await request(app)
        .patch('/api/integration-requests/admin/1')
        .send({ status: 'contacted' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Server error' });
    });
  });

  describe('DELETE /admin/:id - Delete integration request (protected)', () => {
    it('should require authentication', async () => {
      mockAuthMiddleware.mockImplementation((req: Request, res: Response) => {
        res.status(401).json({ error: 'Unauthorized' });
      });

      const response = await request(app)
        .delete('/api/integration-requests/admin/1');

      expect(response.status).toBe(401);
      expect(mockRun).not.toHaveBeenCalled();
    });

    it('should successfully delete an integration request', async () => {
      mockRun.mockReturnValue({ changes: 1 });

      const response = await request(app)
        .delete('/api/integration-requests/admin/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Integration request deleted successfully' });
      expect(mockPrepare).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM integration_requests WHERE id = ?')
      );
      expect(mockRun).toHaveBeenCalledWith('1');
    });

    it('should return 404 when deleting non-existent integration request', async () => {
      mockRun.mockReturnValue({ changes: 0 });

      const response = await request(app)
        .delete('/api/integration-requests/admin/9999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Integration request not found' });
    });

    it('should handle string IDs correctly', async () => {
      mockRun.mockReturnValue({ changes: 1 });

      const response = await request(app)
        .delete('/api/integration-requests/admin/abc123');

      expect(response.status).toBe(200);
      expect(mockRun).toHaveBeenCalledWith('abc123');
    });

    it('should return 500 if database error occurs', async () => {
      mockRun.mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await request(app)
        .delete('/api/integration-requests/admin/1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Server error' });
    });
  });
});
