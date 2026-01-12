import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import request from 'supertest';
import express, { Express, Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import integrationsRouter from '../integrations.js';
import db from '../../config/database.js';

// Mock the database module
vi.mock('../../config/database.js', () => ({
  default: {
    prepare: vi.fn(),
    exec: vi.fn(),
  },
  getDb: vi.fn(),
}));

// Mock the auth middleware
vi.mock('../../middleware/auth.js', () => ({
  authenticateToken: vi.fn((req: Request, res: Response, next: NextFunction) => {
    // By default, allow requests (will be overridden in tests)
    next();
  }),
}));

// Mock multer for file upload testing
vi.mock('multer', () => {
  const multer = () => ({
    single: () => (req: Request, res: Response, next: NextFunction) => {
      // Simulate file upload - add file to request if present in body
      if ((req as any).simulatedFile) {
        req.file = (req as any).simulatedFile;
      }
      next();
    },
  });
  multer.diskStorage = vi.fn(() => ({}));
  return { default: multer };
});

describe('Integrations API', () => {
  let app: Express;
  let mockPrepare: Mock;
  let mockGet: Mock;
  let mockAll: Mock;
  let mockRun: Mock;
  let mockAuthMiddleware: Mock;
  let mockGetDb: Mock;

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use('/api/integrations', integrationsRouter);

    // Import the mocked modules
    const authModule = await import('../../middleware/auth.js');
    mockAuthMiddleware = authModule.authenticateToken as Mock;

    const dbModule = await import('../../config/database.js');
    mockGetDb = dbModule.getDb as Mock;

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

    // Mock getDb to return db with prepare
    mockGetDb.mockReturnValue({
      prepare: mockPrepare,
    });

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

  describe('GET / - Get all integrations with pagination and filtering', () => {
    it('should return integrations with default pagination', async () => {
      const mockIntegrations = [
        {
          id: 1,
          name: 'Integration 1',
          description: 'Description 1',
          category: 'pos',
          logo_url: '/uploads/integrations/logo1.png',
          website_url: 'https://example.com/1',
          display_order: 0,
          status: 'active',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 2,
          name: 'Integration 2',
          description: 'Description 2',
          category: 'payment',
          logo_url: '/uploads/integrations/logo2.png',
          website_url: 'https://example.com/2',
          display_order: 1,
          status: 'active',
          created_at: '2024-01-02T00:00:00.000Z',
          updated_at: '2024-01-02T00:00:00.000Z',
        },
      ];

      mockGet.mockReturnValue({ total: 2 });
      mockAll.mockReturnValue(mockIntegrations);

      const response = await request(app)
        .get('/api/integrations');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        data: mockIntegrations,
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
          hasMore: false,
        },
      });
      expect(mockPrepare).toHaveBeenCalledWith(
        expect.stringContaining('SELECT COUNT(*) as total FROM integrations')
      );
      expect(mockPrepare).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM integrations')
      );
    });

    it('should return integrations with custom pagination', async () => {
      const mockIntegrations = [
        {
          id: 3,
          name: 'Integration 3',
          description: 'Description 3',
          category: 'delivery',
          logo_url: '/uploads/integrations/logo3.png',
          website_url: 'https://example.com/3',
          display_order: 0,
          status: 'active',
          created_at: '2024-01-03T00:00:00.000Z',
          updated_at: '2024-01-03T00:00:00.000Z',
        },
      ];

      mockGet.mockReturnValue({ total: 50 });
      mockAll.mockReturnValue(mockIntegrations);

      const response = await request(app)
        .get('/api/integrations?page=2&limit=10');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        data: mockIntegrations,
        pagination: {
          page: 2,
          limit: 10,
          total: 50,
          totalPages: 5,
          hasMore: true,
        },
      });
      expect(mockAll).toHaveBeenCalledWith(10, 10); // limit, offset
    });

    it('should filter integrations by category', async () => {
      const mockIntegrations = [
        {
          id: 1,
          name: 'POS Integration',
          description: 'Description',
          category: 'pos',
          logo_url: '/uploads/integrations/logo1.png',
          website_url: 'https://example.com/1',
          display_order: 0,
          status: 'active',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z',
        },
      ];

      mockGet.mockReturnValue({ total: 1 });
      mockAll.mockReturnValue(mockIntegrations);

      const response = await request(app)
        .get('/api/integrations?category=pos');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockIntegrations);
      expect(mockPrepare).toHaveBeenCalledWith(
        expect.stringContaining('WHERE category = ?')
      );
      expect(mockGet).toHaveBeenCalledWith('pos');
    });

    it('should filter integrations by status', async () => {
      const mockIntegrations = [
        {
          id: 1,
          name: 'Active Integration',
          description: 'Description',
          category: 'pos',
          logo_url: '/uploads/integrations/logo1.png',
          website_url: 'https://example.com/1',
          display_order: 0,
          status: 'active',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z',
        },
      ];

      mockGet.mockReturnValue({ total: 1 });
      mockAll.mockReturnValue(mockIntegrations);

      const response = await request(app)
        .get('/api/integrations?status=active');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockIntegrations);
      expect(mockPrepare).toHaveBeenCalledWith(
        expect.stringContaining('WHERE status = ?')
      );
      expect(mockGet).toHaveBeenCalledWith('active');
    });

    it('should filter integrations by both category and status', async () => {
      const mockIntegrations = [
        {
          id: 1,
          name: 'Active POS Integration',
          description: 'Description',
          category: 'pos',
          logo_url: '/uploads/integrations/logo1.png',
          website_url: 'https://example.com/1',
          display_order: 0,
          status: 'active',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z',
        },
      ];

      mockGet.mockReturnValue({ total: 1 });
      mockAll.mockReturnValue(mockIntegrations);

      const response = await request(app)
        .get('/api/integrations?category=pos&status=active');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockIntegrations);
      expect(mockPrepare).toHaveBeenCalledWith(
        expect.stringContaining('WHERE category = ? AND status = ?')
      );
      expect(mockGet).toHaveBeenCalledWith('pos', 'active');
    });

    it('should return empty array when no integrations exist', async () => {
      mockGet.mockReturnValue({ total: 0 });
      mockAll.mockReturnValue([]);

      const response = await request(app)
        .get('/api/integrations');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
      expect(response.body.pagination.total).toBe(0);
      expect(response.body.pagination.hasMore).toBe(false);
    });

    it('should handle page numbers correctly (prevent negative or zero pages)', async () => {
      mockGet.mockReturnValue({ total: 10 });
      mockAll.mockReturnValue([]);

      const response = await request(app)
        .get('/api/integrations?page=0');

      expect(response.status).toBe(200);
      expect(response.body.pagination.page).toBe(1); // Should default to 1
      expect(mockAll).toHaveBeenCalledWith(20, 0); // offset should be 0
    });

    it('should enforce maximum limit of 500', async () => {
      mockGet.mockReturnValue({ total: 1000 });
      mockAll.mockReturnValue([]);

      const response = await request(app)
        .get('/api/integrations?limit=1000');

      expect(response.status).toBe(200);
      expect(response.body.pagination.limit).toBe(500); // Should cap at 500
    });

    it('should enforce minimum limit of 1', async () => {
      mockGet.mockReturnValue({ total: 10 });
      mockAll.mockReturnValue([]);

      const response = await request(app)
        .get('/api/integrations?limit=0');

      expect(response.status).toBe(200);
      expect(response.body.pagination.limit).toBe(1); // Should default to 1
    });
  });

  describe('GET /category/:category - Get integrations by category', () => {
    it('should return integrations for a specific category', async () => {
      const mockIntegrations = [
        {
          id: 1,
          name: 'POS Integration 1',
          description: 'Description 1',
          category: 'pos',
          logo_url: '/uploads/integrations/logo1.png',
          website_url: 'https://example.com/1',
          display_order: 0,
          status: 'active',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 2,
          name: 'POS Integration 2',
          description: 'Description 2',
          category: 'pos',
          logo_url: '/uploads/integrations/logo2.png',
          website_url: 'https://example.com/2',
          display_order: 1,
          status: 'active',
          created_at: '2024-01-02T00:00:00.000Z',
          updated_at: '2024-01-02T00:00:00.000Z',
        },
      ];

      mockAll.mockReturnValue(mockIntegrations);

      const response = await request(app)
        .get('/api/integrations/category/pos');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockIntegrations);
      expect(mockPrepare).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM integrations WHERE category = ? ORDER BY display_order')
      );
      expect(mockAll).toHaveBeenCalledWith('pos');
    });

    it('should return empty array when no integrations exist for category', async () => {
      mockAll.mockReturnValue([]);

      const response = await request(app)
        .get('/api/integrations/category/nonexistent');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should handle payment category', async () => {
      const mockIntegrations = [
        {
          id: 3,
          name: 'Payment Integration',
          description: 'Description',
          category: 'payment',
          logo_url: '/uploads/integrations/logo3.png',
          website_url: 'https://example.com/3',
          display_order: 0,
          status: 'active',
          created_at: '2024-01-03T00:00:00.000Z',
          updated_at: '2024-01-03T00:00:00.000Z',
        },
      ];

      mockAll.mockReturnValue(mockIntegrations);

      const response = await request(app)
        .get('/api/integrations/category/payment');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockIntegrations);
      expect(mockAll).toHaveBeenCalledWith('payment');
    });

    it('should handle delivery category', async () => {
      const mockIntegrations = [
        {
          id: 4,
          name: 'Delivery Integration',
          description: 'Description',
          category: 'delivery',
          logo_url: '/uploads/integrations/logo4.png',
          website_url: 'https://example.com/4',
          display_order: 0,
          status: 'active',
          created_at: '2024-01-04T00:00:00.000Z',
          updated_at: '2024-01-04T00:00:00.000Z',
        },
      ];

      mockAll.mockReturnValue(mockIntegrations);

      const response = await request(app)
        .get('/api/integrations/category/delivery');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockIntegrations);
      expect(mockAll).toHaveBeenCalledWith('delivery');
    });
  });

  describe('GET /:id - Get single integration', () => {
    it('should return a single integration by id', async () => {
      const mockIntegration = {
        id: 1,
        name: 'Integration 1',
        description: 'Description 1',
        category: 'pos',
        logo_url: '/uploads/integrations/logo1.png',
        website_url: 'https://example.com/1',
        display_order: 0,
        status: 'active',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      mockGet.mockReturnValue(mockIntegration);

      const response = await request(app)
        .get('/api/integrations/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockIntegration);
      expect(mockPrepare).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM integrations WHERE id = ?')
      );
      expect(mockGet).toHaveBeenCalledWith('1');
    });

    it('should return 404 when integration not found', async () => {
      mockGet.mockReturnValue(null);

      const response = await request(app)
        .get('/api/integrations/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Integration not found' });
    });

    it('should handle string id parameter', async () => {
      const mockIntegration = {
        id: 5,
        name: 'Integration 5',
        description: 'Description 5',
        category: 'pos',
        logo_url: '/uploads/integrations/logo5.png',
        website_url: 'https://example.com/5',
        display_order: 0,
        status: 'active',
        created_at: '2024-01-05T00:00:00.000Z',
        updated_at: '2024-01-05T00:00:00.000Z',
      };

      mockGet.mockReturnValue(mockIntegration);

      const response = await request(app)
        .get('/api/integrations/5');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockIntegration);
    });
  });

  describe('POST / - Create integration (protected)', () => {
    it('should require authentication', async () => {
      mockAuthMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
        return res.status(401).json({ error: 'Unauthorized' });
      });

      const response = await request(app)
        .post('/api/integrations')
        .send({
          name: 'New Integration',
          category: 'pos',
        });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should successfully create an integration with all fields', async () => {
      const integrationData = {
        name: 'New Integration',
        description: 'New Description',
        category: 'pos',
        website_url: 'https://example.com',
        display_order: 5,
        status: 'active',
      };

      mockRun.mockReturnValue({ lastInsertRowid: 1 });
      mockGet.mockReturnValue({
        id: 1,
        ...integrationData,
        logo_url: null,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      });

      const response = await request(app)
        .post('/api/integrations')
        .send(integrationData);

      expect(response.status).toBe(201);
      expect(response.body.id).toBe(1);
      expect(response.body.name).toBe(integrationData.name);
      expect(mockPrepare).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO integrations')
      );
      expect(mockRun).toHaveBeenCalledWith(
        integrationData.name,
        integrationData.description,
        integrationData.category,
        null, // logo_url
        integrationData.website_url,
        integrationData.display_order,
        integrationData.status
      );
    });

    it('should successfully create an integration with only required fields', async () => {
      const integrationData = {
        name: 'Minimal Integration',
        category: 'payment',
      };

      mockRun.mockReturnValue({ lastInsertRowid: 2 });
      mockGet.mockReturnValue({
        id: 2,
        name: integrationData.name,
        description: null,
        category: integrationData.category,
        logo_url: null,
        website_url: null,
        display_order: 0,
        status: 'active',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      });

      const response = await request(app)
        .post('/api/integrations')
        .send(integrationData);

      expect(response.status).toBe(201);
      expect(response.body.id).toBe(2);
      expect(response.body.name).toBe(integrationData.name);
      expect(response.body.display_order).toBe(0); // default
      expect(response.body.status).toBe('active'); // default
    });

    it('should return 400 when name is missing', async () => {
      const response = await request(app)
        .post('/api/integrations')
        .send({
          category: 'pos',
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Name and category are required' });
    });

    it('should return 400 when category is missing', async () => {
      const response = await request(app)
        .post('/api/integrations')
        .send({
          name: 'New Integration',
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Name and category are required' });
    });

    it('should return 400 when both name and category are missing', async () => {
      const response = await request(app)
        .post('/api/integrations')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Name and category are required' });
    });

    it('should handle file upload for logo', async () => {
      const integrationData = {
        name: 'Integration with Logo',
        category: 'pos',
      };

      // Simulate file upload
      const mockFile = {
        filename: 'integration-1234567890-123456789.png',
        originalname: 'logo.png',
        mimetype: 'image/png',
        size: 1024,
      };

      mockRun.mockReturnValue({ lastInsertRowid: 3 });
      mockGet.mockReturnValue({
        id: 3,
        ...integrationData,
        logo_url: '/uploads/integrations/integration-1234567890-123456789.png',
        description: null,
        website_url: null,
        display_order: 0,
        status: 'active',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      });

      const response = await request(app)
        .post('/api/integrations')
        .send({ ...integrationData, simulatedFile: mockFile } as any);

      expect(response.status).toBe(201);
      expect(response.body.logo_url).toContain('/uploads/integrations/');
    });

    it('should return 500 on database error', async () => {
      mockRun.mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await request(app)
        .post('/api/integrations')
        .send({
          name: 'New Integration',
          category: 'pos',
        });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Database error' });
    });
  });

  describe('PUT /:id - Update integration (protected)', () => {
    it('should require authentication', async () => {
      mockAuthMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
        return res.status(401).json({ error: 'Unauthorized' });
      });

      const response = await request(app)
        .put('/api/integrations/1')
        .send({
          name: 'Updated Integration',
          category: 'pos',
        });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should successfully update an integration', async () => {
      const existingIntegration = {
        id: 1,
        name: 'Old Integration',
        description: 'Old Description',
        category: 'pos',
        logo_url: '/uploads/integrations/old-logo.png',
        website_url: 'https://old.example.com',
        display_order: 0,
        status: 'active',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      const updatedData = {
        name: 'Updated Integration',
        description: 'Updated Description',
        category: 'payment',
        website_url: 'https://new.example.com',
        display_order: 10,
        status: 'inactive',
      };

      // First call: check if exists
      mockGet.mockReturnValueOnce(existingIntegration);
      // Second call: get updated integration
      mockGet.mockReturnValueOnce({
        ...existingIntegration,
        ...updatedData,
        updated_at: '2024-01-02T00:00:00.000Z',
      });
      mockRun.mockReturnValue({ changes: 1 });

      const response = await request(app)
        .put('/api/integrations/1')
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updatedData.name);
      expect(response.body.description).toBe(updatedData.description);
      expect(response.body.category).toBe(updatedData.category);
      expect(mockPrepare).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE integrations')
      );
      expect(mockRun).toHaveBeenCalledWith(
        updatedData.name,
        updatedData.description,
        updatedData.category,
        existingIntegration.logo_url, // logo_url should remain the same
        updatedData.website_url,
        updatedData.display_order,
        updatedData.status,
        '1'
      );
    });

    it('should return 404 when integration to update not found', async () => {
      mockGet.mockReturnValue(null);

      const response = await request(app)
        .put('/api/integrations/999')
        .send({
          name: 'Updated Integration',
          category: 'pos',
        });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Integration not found' });
    });

    it('should update logo when new file is uploaded', async () => {
      const existingIntegration = {
        id: 1,
        name: 'Integration',
        description: 'Description',
        category: 'pos',
        logo_url: '/uploads/integrations/old-logo.png',
        website_url: 'https://example.com',
        display_order: 0,
        status: 'active',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      const updatedData = {
        name: 'Integration with New Logo',
        description: 'Description',
        category: 'pos',
        website_url: 'https://example.com',
        display_order: 0,
        status: 'active',
      };

      // Simulate file upload
      const mockFile = {
        filename: 'integration-9876543210-987654321.png',
        originalname: 'new-logo.png',
        mimetype: 'image/png',
        size: 2048,
      };

      mockGet.mockReturnValueOnce(existingIntegration);
      mockGet.mockReturnValueOnce({
        ...existingIntegration,
        ...updatedData,
        logo_url: '/uploads/integrations/integration-9876543210-987654321.png',
        updated_at: '2024-01-02T00:00:00.000Z',
      });
      mockRun.mockReturnValue({ changes: 1 });

      const response = await request(app)
        .put('/api/integrations/1')
        .send({ ...updatedData, simulatedFile: mockFile } as any);

      expect(response.status).toBe(200);
      expect(response.body.logo_url).toContain('/uploads/integrations/integration-9876543210-987654321.png');
    });

    it('should preserve existing logo when no new file is uploaded', async () => {
      const existingIntegration = {
        id: 1,
        name: 'Integration',
        description: 'Description',
        category: 'pos',
        logo_url: '/uploads/integrations/existing-logo.png',
        website_url: 'https://example.com',
        display_order: 0,
        status: 'active',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      const updatedData = {
        name: 'Updated Integration Name',
        description: 'Updated Description',
        category: 'pos',
        website_url: 'https://example.com',
        display_order: 0,
        status: 'active',
      };

      mockGet.mockReturnValueOnce(existingIntegration);
      mockGet.mockReturnValueOnce({
        ...existingIntegration,
        ...updatedData,
        updated_at: '2024-01-02T00:00:00.000Z',
      });
      mockRun.mockReturnValue({ changes: 1 });

      const response = await request(app)
        .put('/api/integrations/1')
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.logo_url).toBe(existingIntegration.logo_url);
      expect(mockRun).toHaveBeenCalledWith(
        updatedData.name,
        updatedData.description,
        updatedData.category,
        existingIntegration.logo_url, // Should preserve existing logo
        updatedData.website_url,
        updatedData.display_order,
        updatedData.status,
        '1'
      );
    });

    it('should return 500 on database error', async () => {
      mockGet.mockReturnValue({ id: 1 }); // Integration exists
      mockRun.mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await request(app)
        .put('/api/integrations/1')
        .send({
          name: 'Updated Integration',
          category: 'pos',
        });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Database error' });
    });
  });

  describe('DELETE /:id - Delete integration (protected)', () => {
    it('should require authentication', async () => {
      mockAuthMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
        return res.status(401).json({ error: 'Unauthorized' });
      });

      const response = await request(app)
        .delete('/api/integrations/1');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should successfully delete an integration', async () => {
      mockRun.mockReturnValue({ changes: 1 });

      const response = await request(app)
        .delete('/api/integrations/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Integration deleted successfully' });
      expect(mockPrepare).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM integrations WHERE id = ?')
      );
      expect(mockRun).toHaveBeenCalledWith('1');
    });

    it('should return 404 when integration to delete not found', async () => {
      mockRun.mockReturnValue({ changes: 0 });

      const response = await request(app)
        .delete('/api/integrations/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Integration not found' });
    });

    it('should handle string id parameter', async () => {
      mockRun.mockReturnValue({ changes: 1 });

      const response = await request(app)
        .delete('/api/integrations/5');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Integration deleted successfully' });
      expect(mockRun).toHaveBeenCalledWith('5');
    });

    it('should return 500 on database error', async () => {
      mockRun.mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await request(app)
        .delete('/api/integrations/1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Database error' });
    });
  });
});
