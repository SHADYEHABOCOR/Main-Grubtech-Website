/**
 * Content Management Routes for Cloudflare Workers
 *
 * Provides endpoints for website content management using KV storage.
 * Content is stored as JSON in KV namespace for persistence.
 *
 * Endpoints:
 * - GET /admin/all    - Get all content for admin (protected)
 * - PUT /admin/update - Update all website content (protected)
 * - PUT /admin/:page  - Update specific page content (protected)
 * - GET /             - Get all website content (public)
 * - GET /:page        - Get content for specific page (public)
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env, Variables } from '../types/bindings';
import { authenticateToken } from '../middleware/auth';

// KV key for storing all content
const CONTENT_KV_KEY = 'content:website';

// Content type (flexible object structure for CMS)
type ContentData = Record<string, unknown>;

/**
 * Schema for page parameter validation
 */
const pageParamSchema = z.object({
  page: z.string().min(1, 'Page name is required'),
});

/**
 * Helper function to read content from KV
 */
async function readContent(kv: KVNamespace): Promise<ContentData> {
  try {
    const data = await kv.get(CONTENT_KV_KEY, 'text');
    if (data === null) {
      return {};
    }
    return JSON.parse(data) as ContentData;
  } catch {
    return {};
  }
}

/**
 * Helper function to write content to KV
 * No TTL set since this is persistent CMS data
 */
async function writeContent(kv: KVNamespace, content: ContentData): Promise<boolean> {
  try {
    await kv.put(CONTENT_KV_KEY, JSON.stringify(content));
    return true;
  } catch {
    return false;
  }
}

// Create content router
const contentRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// ============================================================================
// Admin Routes (Protected) - MUST come before /:page route
// ============================================================================

/**
 * GET /api/content/admin/all
 * Get all content for admin (protected)
 */
contentRoutes.get('/admin/all', authenticateToken, async (c) => {
  try {
    const content = await readContent(c.env.CACHE);
    return c.json(content);
  } catch {
    return c.json({ error: 'Server error' }, 500);
  }
});

/**
 * PUT /api/content/admin/update
 * Update all website content (protected)
 */
contentRoutes.put('/admin/update', authenticateToken, async (c) => {
  try {
    const newContent = await c.req.json();

    // Validate that content is an object
    if (!newContent || typeof newContent !== 'object' || Array.isArray(newContent)) {
      return c.json({ error: 'Invalid content format' }, 400);
    }

    // Write to KV
    const success = await writeContent(c.env.CACHE, newContent as ContentData);

    if (!success) {
      return c.json({ error: 'Failed to save content' }, 500);
    }

    return c.json({
      success: true,
      message: 'Content updated successfully',
      content: newContent,
    });
  } catch {
    return c.json({ error: 'Server error' }, 500);
  }
});

/**
 * PUT /api/content/admin/:page
 * Update specific page content (protected)
 */
contentRoutes.put(
  '/admin/:page',
  authenticateToken,
  zValidator('param', pageParamSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid page parameter' }, 400);
    }
  }),
  async (c) => {
    try {
      const { page } = c.req.valid('param');
      const pageContent = await c.req.json();

      // Read existing content
      const content = await readContent(c.env.CACHE);

      // Update specific page
      content[page] = pageContent;

      // Write to KV
      const success = await writeContent(c.env.CACHE, content);

      if (!success) {
        return c.json({ error: 'Failed to save content' }, 500);
      }

      return c.json({
        success: true,
        message: `Page '${page}' updated successfully`,
        content: content[page],
      });
    } catch {
      return c.json({ error: 'Server error' }, 500);
    }
  }
);

// ============================================================================
// Public Routes
// ============================================================================

/**
 * GET /api/content
 * Get all website content (public)
 */
contentRoutes.get('/', async (c) => {
  try {
    const content = await readContent(c.env.CACHE);
    return c.json(content);
  } catch {
    return c.json({ error: 'Server error' }, 500);
  }
});

/**
 * GET /api/content/:page
 * Get content for specific page (public) - MUST come after admin routes
 */
contentRoutes.get(
  '/:page',
  zValidator('param', pageParamSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid page parameter' }, 400);
    }
  }),
  async (c) => {
    try {
      const { page } = c.req.valid('param');
      const content = await readContent(c.env.CACHE);
      const pageContent = content[page];

      if (!pageContent) {
        return c.json({ error: 'Page content not found' }, 404);
      }

      return c.json(pageContent);
    } catch {
      return c.json({ error: 'Server error' }, 500);
    }
  }
);

export { contentRoutes };
export default contentRoutes;
