import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import request from 'supertest';
import express, { Express, Request, Response, NextFunction } from 'express';
import uploadsRouter from '../uploads.js';

// Mock the auth middleware
vi.mock('../../middleware/auth.js', () => ({
  authenticateToken: vi.fn((req: Request, res: Response, next: NextFunction) => {
    // By default, allow requests (will be overridden in tests)
    next();
  }),
}));

// Mock sharp for image processing
vi.mock('sharp', () => ({
  default: vi.fn(() => ({
    metadata: vi.fn().mockResolvedValue({ width: 1920, height: 1080 }),
    jpeg: vi.fn().mockReturnThis(),
    webp: vi.fn().mockReturnThis(),
    resize: vi.fn().mockReturnThis(),
    toFile: vi.fn().mockResolvedValue({}),
  })),
}));

// Mock fs module
vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn().mockReturnValue(true),
    mkdirSync: vi.fn(),
    readdirSync: vi.fn().mockReturnValue([]),
    statSync: vi.fn().mockReturnValue({ isDirectory: () => false }),
    unlinkSync: vi.fn(),
  },
  existsSync: vi.fn().mockReturnValue(true),
  mkdirSync: vi.fn(),
  readdirSync: vi.fn().mockReturnValue([]),
  statSync: vi.fn().mockReturnValue({ isDirectory: () => false }),
  unlinkSync: vi.fn(),
}));

describe('Uploads API', () => {
  let app: Express;
  let mockAuthMiddleware: Mock;

  beforeEach(async () => {
    app = express();
    app.use(express.json());

    // Import the mocked auth middleware
    const authModule = await import('../../middleware/auth.js');
    mockAuthMiddleware = authModule.authenticateToken as Mock;

    // Mount the uploads router
    app.use('/api/uploads', uploadsRouter);

    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication Enforcement', () => {
    beforeEach(() => {
      // Configure mock to reject unauthenticated requests
      mockAuthMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
        res.status(401).json({ error: 'No token provided', code: 'NO_TOKEN' });
      });
    });

    it('should return 401 for POST /image without authentication', async () => {
      const response = await request(app)
        .post('/api/uploads/image')
        .attach('image', Buffer.from('fake-image-data'), 'test.jpg');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(mockAuthMiddleware).toHaveBeenCalled();
    });

    it('should return 401 for POST /images without authentication', async () => {
      const response = await request(app)
        .post('/api/uploads/images')
        .attach('images', Buffer.from('fake-image-data'), 'test1.jpg')
        .attach('images', Buffer.from('fake-image-data'), 'test2.jpg');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(mockAuthMiddleware).toHaveBeenCalled();
    });

    it('should return 401 for DELETE /image/:filename without authentication', async () => {
      const response = await request(app)
        .delete('/api/uploads/image/test-image-123.jpg');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(mockAuthMiddleware).toHaveBeenCalled();
    });

    it('should return 401 for GET /images without authentication', async () => {
      const response = await request(app)
        .get('/api/uploads/images');

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
    });

    describe('POST /image', () => {
      it('should allow authenticated user to upload single image', async () => {
        const response = await request(app)
          .post('/api/uploads/image')
          .attach('image', Buffer.from('fake-image-data'), 'test.jpg');

        expect(mockAuthMiddleware).toHaveBeenCalled();
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('filename');
        expect(response.body.data).toHaveProperty('paths');
      });

      it('should return 400 when no file is provided', async () => {
        const response = await request(app)
          .post('/api/uploads/image')
          .send({});

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('No image file provided');
      });
    });

    describe('POST /images', () => {
      it('should allow authenticated user to upload multiple images', async () => {
        const response = await request(app)
          .post('/api/uploads/images')
          .attach('images', Buffer.from('fake-image-data'), 'test1.jpg')
          .attach('images', Buffer.from('fake-image-data'), 'test2.jpg');

        expect(mockAuthMiddleware).toHaveBeenCalled();
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBe(2);
      });

      it('should return 400 when no files are provided', async () => {
        const response = await request(app)
          .post('/api/uploads/images')
          .send({});

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('No image files provided');
      });
    });

    describe('DELETE /image/:filename', () => {
      it('should allow authenticated user to delete image', async () => {
        const fs = await import('fs');
        (fs.default.readdirSync as Mock)
          .mockReturnValueOnce(['test-image-123.jpg', 'test-image-123.webp'])
          .mockReturnValueOnce(['test-image-123-thumb.webp']);

        const response = await request(app)
          .delete('/api/uploads/image/test-image-123.jpg');

        expect(mockAuthMiddleware).toHaveBeenCalled();
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('deletedFiles');
        expect(Array.isArray(response.body.deletedFiles)).toBe(true);
      });

      it('should return 404 when image not found', async () => {
        const fs = await import('fs');
        (fs.default.readdirSync as Mock)
          .mockReturnValueOnce([])
          .mockReturnValueOnce([]);

        const response = await request(app)
          .delete('/api/uploads/image/nonexistent.jpg');

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Image not found');
      });

      it('should reject filenames with directory traversal attempts', async () => {
        const response = await request(app)
          .delete('/api/uploads/image/../../../etc/passwd');

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Invalid filename');
      });

      it('should reject filenames with slashes', async () => {
        const response = await request(app)
          .delete('/api/uploads/image/path/to/file.jpg');

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Invalid filename');
      });
    });

    describe('GET /images', () => {
      it('should allow authenticated user to list images', async () => {
        const fs = await import('fs');
        (fs.default.readdirSync as Mock).mockReturnValueOnce([
          'test-image-123.jpg',
          'test-image-123.webp',
          'test-image-123-medium.jpg',
          'test-image-123-medium.webp',
        ]);

        const response = await request(app)
          .get('/api/uploads/images');

        expect(mockAuthMiddleware).toHaveBeenCalled();
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(typeof response.body.data).toBe('object');
      });

      it('should return empty object when no images exist', async () => {
        const fs = await import('fs');
        (fs.default.readdirSync as Mock).mockReturnValueOnce([]);

        const response = await request(app)
          .get('/api/uploads/images');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toEqual({});
      });
    });
  });
});
