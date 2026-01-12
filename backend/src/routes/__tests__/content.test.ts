import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import request from 'supertest';
import express, { Express, Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import contentRouter from '../content.js';
import fs from 'fs';

// Mock the fs module
vi.mock('fs', () => ({
  default: {
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
  },
}));

// Mock the auth middleware
vi.mock('../../middleware/auth.js', () => ({
  authenticateToken: vi.fn((req: Request, res: Response, next: NextFunction) => {
    // By default, allow requests (will be overridden in tests)
    next();
  }),
}));

describe('Content API', () => {
  let app: Express;
  let mockReadFileSync: Mock;
  let mockWriteFileSync: Mock;
  let mockAuthMiddleware: Mock;

  const mockContent = {
    home: {
      hero: {
        title: 'Welcome to GrubTech',
        subtitle: 'Restaurant Technology Solutions',
      },
      features: ['Feature 1', 'Feature 2'],
    },
    about: {
      title: 'About Us',
      description: 'We are GrubTech',
    },
    contact: {
      title: 'Contact Us',
      email: 'info@grubtech.com',
    },
  };

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use('/api/content', contentRouter);

    // Import the mocked modules
    const authModule = await import('../../middleware/auth.js');
    mockAuthMiddleware = authModule.authenticateToken as Mock;

    // Reset all mocks
    vi.clearAllMocks();

    // Setup mock functions for fs
    mockReadFileSync = fs.readFileSync as Mock;
    mockWriteFileSync = fs.writeFileSync as Mock;

    // Default: Return mock content when reading file
    mockReadFileSync.mockReturnValue(JSON.stringify(mockContent));

    // Default: Successful file write
    mockWriteFileSync.mockReturnValue(undefined);

    // Default: Allow authenticated requests
    mockAuthMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
      (req as any).user = { id: 1, username: 'testuser' };
      next();
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET / (public - all content)', () => {
    it('should return all website content', async () => {
      const response = await request(app).get('/api/content');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockContent);
      expect(mockReadFileSync).toHaveBeenCalledWith(
        expect.stringContaining('content.json'),
        'utf8'
      );
    });

    it('should return empty object when content file is empty', async () => {
      mockReadFileSync.mockReturnValue('{}');

      const response = await request(app).get('/api/content');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({});
    });

    it('should handle file read errors and return empty object', async () => {
      mockReadFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      const response = await request(app).get('/api/content');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({});
    });

    it('should handle JSON parse errors and return empty object', async () => {
      mockReadFileSync.mockReturnValue('invalid json {');

      const response = await request(app).get('/api/content');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({});
    });

    it('should handle server errors gracefully', async () => {
      mockReadFileSync.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const response = await request(app).get('/api/content');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({});
    });
  });

  describe('GET /:page (public - specific page)', () => {
    it('should return content for a specific page', async () => {
      const response = await request(app).get('/api/content/home');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockContent.home);
    });

    it('should return content for about page', async () => {
      const response = await request(app).get('/api/content/about');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockContent.about);
    });

    it('should return content for contact page', async () => {
      const response = await request(app).get('/api/content/contact');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockContent.contact);
    });

    it('should return 404 when page content not found', async () => {
      const response = await request(app).get('/api/content/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Page content not found' });
    });

    it('should return 404 for undefined page in content', async () => {
      const response = await request(app).get('/api/content/services');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Page content not found' });
    });

    it('should handle file read errors', async () => {
      mockReadFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      const response = await request(app).get('/api/content/home');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Page content not found' });
    });

    it('should handle JSON parse errors', async () => {
      mockReadFileSync.mockReturnValue('invalid json');

      const response = await request(app).get('/api/content/home');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Page content not found' });
    });

    it('should handle server errors gracefully', async () => {
      mockReadFileSync.mockImplementation(() => {
        throw new Error('Disk error');
      });

      const response = await request(app).get('/api/content/about');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Server error' });
    });
  });

  describe('GET /admin/all (protected)', () => {
    it('should return all content when authenticated', async () => {
      const response = await request(app)
        .get('/api/content/admin/all')
        .set('Cookie', ['grubtech_auth=valid-token']);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockContent);
      expect(mockAuthMiddleware).toHaveBeenCalled();
    });

    it('should require authentication', async () => {
      mockAuthMiddleware.mockImplementation((req: Request, res: Response) => {
        res.status(401).json({ error: 'Unauthorized' });
      });

      const response = await request(app).get('/api/content/admin/all');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should handle file read errors', async () => {
      mockReadFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      const response = await request(app)
        .get('/api/content/admin/all')
        .set('Cookie', ['grubtech_auth=valid-token']);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({});
    });

    it('should handle JSON parse errors', async () => {
      mockReadFileSync.mockReturnValue('invalid json');

      const response = await request(app)
        .get('/api/content/admin/all')
        .set('Cookie', ['grubtech_auth=valid-token']);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({});
    });

    it('should handle server errors gracefully', async () => {
      mockReadFileSync.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const response = await request(app)
        .get('/api/content/admin/all')
        .set('Cookie', ['grubtech_auth=valid-token']);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({});
    });
  });

  describe('PUT /admin/update (protected - update all)', () => {
    const newContent = {
      home: {
        hero: {
          title: 'New Title',
          subtitle: 'New Subtitle',
        },
      },
      about: {
        title: 'Updated About',
      },
    };

    it('should update all content when authenticated', async () => {
      const response = await request(app)
        .put('/api/content/admin/update')
        .set('Cookie', ['grubtech_auth=valid-token'])
        .send(newContent);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'Content updated successfully',
        content: newContent,
      });
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        expect.stringContaining('content.json'),
        JSON.stringify(newContent, null, 2),
        'utf8'
      );
    });

    it('should require authentication', async () => {
      mockAuthMiddleware.mockImplementation((req: Request, res: Response) => {
        res.status(401).json({ error: 'Unauthorized' });
      });

      const response = await request(app)
        .put('/api/content/admin/update')
        .send(newContent);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Unauthorized' });
      expect(mockWriteFileSync).not.toHaveBeenCalled();
    });

    it('should validate content is an object', async () => {
      const response = await request(app)
        .put('/api/content/admin/update')
        .set('Cookie', ['grubtech_auth=valid-token'])
        .send('invalid content');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid content format' });
      expect(mockWriteFileSync).not.toHaveBeenCalled();
    });

    it('should reject null content', async () => {
      const response = await request(app)
        .put('/api/content/admin/update')
        .set('Cookie', ['grubtech_auth=valid-token'])
        .send(null);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid content format' });
      expect(mockWriteFileSync).not.toHaveBeenCalled();
    });

    it('should reject array content', async () => {
      const response = await request(app)
        .put('/api/content/admin/update')
        .set('Cookie', ['grubtech_auth=valid-token'])
        .send(['array', 'content']);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid content format' });
      expect(mockWriteFileSync).not.toHaveBeenCalled();
    });

    it('should accept empty object as valid content', async () => {
      const response = await request(app)
        .put('/api/content/admin/update')
        .set('Cookie', ['grubtech_auth=valid-token'])
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockWriteFileSync).toHaveBeenCalled();
    });

    it('should handle file write errors', async () => {
      mockWriteFileSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const response = await request(app)
        .put('/api/content/admin/update')
        .set('Cookie', ['grubtech_auth=valid-token'])
        .send(newContent);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to save content' });
    });

    it('should handle disk full errors', async () => {
      mockWriteFileSync.mockImplementation(() => {
        throw new Error('ENOSPC: no space left on device');
      });

      const response = await request(app)
        .put('/api/content/admin/update')
        .set('Cookie', ['grubtech_auth=valid-token'])
        .send(newContent);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to save content' });
    });

    it('should handle complex nested content', async () => {
      const complexContent = {
        home: {
          hero: {
            title: 'Title',
            subtitle: 'Subtitle',
            buttons: [
              { text: 'Button 1', link: '/link1' },
              { text: 'Button 2', link: '/link2' },
            ],
          },
          sections: [
            { id: 1, title: 'Section 1', items: [1, 2, 3] },
            { id: 2, title: 'Section 2', items: [4, 5, 6] },
          ],
        },
      };

      const response = await request(app)
        .put('/api/content/admin/update')
        .set('Cookie', ['grubtech_auth=valid-token'])
        .send(complexContent);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.content).toEqual(complexContent);
    });
  });

  describe('PUT /admin/:page (protected - update page)', () => {
    const updatedHomeContent = {
      hero: {
        title: 'Updated Home Title',
        subtitle: 'Updated Home Subtitle',
      },
      features: ['New Feature 1', 'New Feature 2', 'New Feature 3'],
    };

    it('should update specific page content when authenticated', async () => {
      const response = await request(app)
        .put('/api/content/admin/home')
        .set('Cookie', ['grubtech_auth=valid-token'])
        .send(updatedHomeContent);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "Page 'home' updated successfully",
        content: updatedHomeContent,
      });

      // Verify the content was read first
      expect(mockReadFileSync).toHaveBeenCalled();

      // Verify the updated content was written
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        expect.stringContaining('content.json'),
        expect.stringContaining('"home"'),
        'utf8'
      );
    });

    it('should update about page content', async () => {
      const updatedAbout = {
        title: 'New About Title',
        description: 'New about description',
      };

      const response = await request(app)
        .put('/api/content/admin/about')
        .set('Cookie', ['grubtech_auth=valid-token'])
        .send(updatedAbout);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Page 'about' updated successfully");
      expect(response.body.content).toEqual(updatedAbout);
    });

    it('should create new page if it does not exist', async () => {
      const newPageContent = {
        title: 'Services',
        items: ['Service 1', 'Service 2'],
      };

      const response = await request(app)
        .put('/api/content/admin/services')
        .set('Cookie', ['grubtech_auth=valid-token'])
        .send(newPageContent);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Page 'services' updated successfully");
      expect(response.body.content).toEqual(newPageContent);
    });

    it('should require authentication', async () => {
      mockAuthMiddleware.mockImplementation((req: Request, res: Response) => {
        res.status(401).json({ error: 'Unauthorized' });
      });

      const response = await request(app)
        .put('/api/content/admin/home')
        .send(updatedHomeContent);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Unauthorized' });
      expect(mockWriteFileSync).not.toHaveBeenCalled();
    });

    it('should accept empty object as page content', async () => {
      const response = await request(app)
        .put('/api/content/admin/empty')
        .set('Cookie', ['grubtech_auth=valid-token'])
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.content).toEqual({});
    });

    it('should accept null as page content', async () => {
      const response = await request(app)
        .put('/api/content/admin/nullpage')
        .set('Cookie', ['grubtech_auth=valid-token'])
        .send(null);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.content).toBe(null);
    });

    it('should accept array as page content', async () => {
      const arrayContent = ['item1', 'item2', 'item3'];

      const response = await request(app)
        .put('/api/content/admin/arraypage')
        .set('Cookie', ['grubtech_auth=valid-token'])
        .send(arrayContent);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.content).toEqual(arrayContent);
    });

    it('should accept string as page content', async () => {
      const stringContent = 'Simple string content';

      const response = await request(app)
        .put('/api/content/admin/stringpage')
        .set('Cookie', ['grubtech_auth=valid-token'])
        .send(stringContent);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should handle file read errors', async () => {
      mockReadFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      const response = await request(app)
        .put('/api/content/admin/home')
        .set('Cookie', ['grubtech_auth=valid-token'])
        .send(updatedHomeContent);

      // Should still work by treating it as empty content initially
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should handle file write errors', async () => {
      mockWriteFileSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const response = await request(app)
        .put('/api/content/admin/home')
        .set('Cookie', ['grubtech_auth=valid-token'])
        .send(updatedHomeContent);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to save content' });
    });

    it('should preserve other pages when updating one page', async () => {
      const response = await request(app)
        .put('/api/content/admin/home')
        .set('Cookie', ['grubtech_auth=valid-token'])
        .send(updatedHomeContent);

      expect(response.status).toBe(200);

      // Verify the write call includes all pages
      const writeCall = mockWriteFileSync.mock.calls[0];
      const writtenContent = JSON.parse(writeCall[1]);

      // Home should be updated
      expect(writtenContent.home).toEqual(updatedHomeContent);

      // Other pages should be preserved
      expect(writtenContent.about).toEqual(mockContent.about);
      expect(writtenContent.contact).toEqual(mockContent.contact);
    });

    it('should handle complex nested page content', async () => {
      const complexPage = {
        sections: [
          {
            id: 1,
            title: 'Section 1',
            subsections: [
              { id: 1.1, content: 'Content 1.1' },
              { id: 1.2, content: 'Content 1.2' },
            ],
          },
        ],
        metadata: {
          author: 'Admin',
          lastUpdated: '2026-01-10',
        },
      };

      const response = await request(app)
        .put('/api/content/admin/complex')
        .set('Cookie', ['grubtech_auth=valid-token'])
        .send(complexPage);

      expect(response.status).toBe(200);
      expect(response.body.content).toEqual(complexPage);
    });
  });
});
