/**
 * Integrations Management Routes for Cloudflare Workers
 *
 * Provides endpoints for managing integrations including public listing,
 * category filtering, and admin CRUD operations.
 *
 * Endpoints:
 * - GET /admin/all    - Get all integrations including inactive (protected)
 * - GET /admin/:id    - Get single integration by ID (protected)
 * - POST /admin/create - Create new integration (protected)
 * - PUT /admin/:id    - Update integration (protected)
 * - DELETE /admin/:id - Delete integration (protected)
 * - GET /stats        - Get integration statistics (protected)
 * - GET /             - Get integrations with pagination and filtering (public)
 * - GET /category/:category - Get integrations by category (public)
 * - GET /:id          - Get single integration by ID (public)
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env, Variables } from '../types/bindings';
import { createDatabaseService } from '../db';
import { authenticateToken } from '../middleware/auth';
import { createStorageService } from '../services/storage';

// Integration record type from database
interface IntegrationRecord {
  id: number;
  name: string;
  description: string | null;
  category: string;
  logo_url: string | null;
  website_url: string | null;
  display_order: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string | null;
}

// Zod schemas for validation

/**
 * Schema for creating a new integration
 */
const createIntegrationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name is too long'),
  description: z.string().max(2000, 'Description is too long').optional().nullable(),
  category: z.string().min(1, 'Category is required').max(100, 'Category is too long'),
  website_url: z.string().url('Invalid URL').max(500, 'URL is too long').optional().nullable(),
  display_order: z.union([
    z.number().int().min(0),
    z.string().regex(/^\d+$/).transform(Number)
  ]).optional().default(0),
  status: z.enum(['active', 'inactive']).optional().default('active'),
});

/**
 * Schema for updating an integration
 */
const updateIntegrationSchema = createIntegrationSchema.partial();

/**
 * Schema for pagination and filtering query parameters
 */
const listIntegrationsSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  category: z.string().max(100).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

/**
 * Schema for integration ID parameter
 */
const integrationIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid integration ID'),
});

/**
 * Schema for category parameter
 */
const categorySchema = z.object({
  category: z.string().min(1, 'Category is required'),
});

// Create integrations router
const integrationsRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// ============================================================================
// Admin Routes (Protected) - MUST come before /:id route
// ============================================================================

/**
 * GET /api/integrations/admin/all
 * Get all integrations including inactive (protected)
 */
integrationsRoutes.get('/admin/all', authenticateToken, async (c) => {
  try {
    const db = createDatabaseService(c.env);

    const integrations = await db.query<IntegrationRecord>(
      'SELECT * FROM integrations ORDER BY category, display_order'
    );

    return c.json(integrations);
  } catch (error) {
    return c.json({ error: 'Server error' }, 500);
  }
});

/**
 * GET /api/integrations/admin/:id
 * Get single integration by ID (protected)
 */
integrationsRoutes.get(
  '/admin/:id',
  authenticateToken,
  zValidator('param', integrationIdSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid integration ID' }, 400);
    }
  }),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const db = createDatabaseService(c.env);

      const integration = await db.queryFirst<IntegrationRecord>(
        'SELECT * FROM integrations WHERE id = ?',
        [id]
      );

      if (!integration) {
        return c.json({ error: 'Integration not found' }, 404);
      }

      return c.json(integration);
    } catch (error) {
      return c.json({ error: 'Server error' }, 500);
    }
  }
);

/**
 * POST /api/integrations/admin/create
 * Create new integration (protected)
 */
integrationsRoutes.post('/admin/create', authenticateToken, async (c) => {
  try {
    const contentType = c.req.header('Content-Type') || '';
    const db = createDatabaseService(c.env);
    let data: z.infer<typeof createIntegrationSchema>;
    let logoPath: string | null = null;

    // Handle multipart form data (with logo upload)
    if (contentType.includes('multipart/form-data')) {
      const formData = await c.req.formData();

      // Extract form fields
      const formFields: Record<string, string | null> = {};
      for (const [key, value] of formData.entries()) {
        if (typeof value === 'string') {
          formFields[key] = value || null;
        }
      }

      // Validate form data
      const parseResult = createIntegrationSchema.safeParse({
        name: formFields.name,
        description: formFields.description,
        category: formFields.category,
        website_url: formFields.website_url,
        display_order: formFields.display_order,
        status: formFields.status,
      });

      if (!parseResult.success) {
        return c.json(
          {
            error: 'Validation failed',
            details: parseResult.error.flatten().fieldErrors,
          },
          400
        );
      }

      data = parseResult.data;

      // Handle logo upload
      const logoFile = formData.get('logo') as File | null;
      if (logoFile && logoFile.size > 0 && typeof logoFile.arrayBuffer === 'function') {
        const storage = createStorageService(c.env);
        const arrayBuffer = await logoFile.arrayBuffer();

        try {
          const uploadResult = await storage.uploadImage(arrayBuffer, {
            originalName: logoFile.name,
            contentType: logoFile.type,
            size: logoFile.size,
            category: 'integrations',
          });
          logoPath = uploadResult.url;
        } catch (uploadError) {
          return c.json(
            {
              error: uploadError instanceof Error ? uploadError.message : 'Logo upload failed',
            },
            400
          );
        }
      }
    } else {
      // Handle JSON body
      const body = await c.req.json();
      const parseResult = createIntegrationSchema.safeParse(body);

      if (!parseResult.success) {
        return c.json(
          {
            error: 'Validation failed',
            details: parseResult.error.flatten().fieldErrors,
          },
          400
        );
      }

      data = parseResult.data;
    }

    // Insert integration
    const integrationId = await db.insert('integrations', {
      name: data.name,
      description: data.description || null,
      category: data.category,
      logo_url: logoPath,
      website_url: data.website_url || null,
      display_order: data.display_order || 0,
      status: data.status || 'active',
    });

    if (!integrationId) {
      return c.json({ error: 'Failed to create integration' }, 500);
    }

    // Fetch the created integration
    const newIntegration = await db.queryFirst<IntegrationRecord>(
      'SELECT * FROM integrations WHERE id = ?',
      [integrationId]
    );

    return c.json(newIntegration, 201);
  } catch (error) {
    return c.json({ error: 'Server error' }, 500);
  }
});

/**
 * PUT /api/integrations/admin/:id
 * Update integration (protected)
 */
integrationsRoutes.put(
  '/admin/:id',
  authenticateToken,
  zValidator('param', integrationIdSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid integration ID' }, 400);
    }
  }),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const contentType = c.req.header('Content-Type') || '';
      const db = createDatabaseService(c.env);

      // Check if integration exists
      const existing = await db.queryFirst<IntegrationRecord>(
        'SELECT * FROM integrations WHERE id = ?',
        [id]
      );

      if (!existing) {
        return c.json({ error: 'Integration not found' }, 404);
      }

      let data: z.infer<typeof updateIntegrationSchema>;
      let logoPath: string | null = existing.logo_url;

      // Handle multipart form data (with logo upload)
      if (contentType.includes('multipart/form-data')) {
        const formData = await c.req.formData();

        // Extract form fields
        const formFields: Record<string, string | null> = {};
        for (const [key, value] of formData.entries()) {
          if (typeof value === 'string') {
            formFields[key] = value || null;
          }
        }

        // Validate form data
        const parseResult = updateIntegrationSchema.safeParse({
          name: formFields.name,
          description: formFields.description,
          category: formFields.category,
          website_url: formFields.website_url,
          display_order: formFields.display_order,
          status: formFields.status,
        });

        if (!parseResult.success) {
          return c.json(
            {
              error: 'Validation failed',
              details: parseResult.error.flatten().fieldErrors,
            },
            400
          );
        }

        data = parseResult.data;

        // Handle logo upload
        const logoFile = formData.get('logo') as File | null;
        if (logoFile && logoFile.size > 0 && typeof logoFile.arrayBuffer === 'function') {
          const storage = createStorageService(c.env);
          const arrayBuffer = await logoFile.arrayBuffer();

          try {
            const uploadResult = await storage.uploadImage(arrayBuffer, {
              originalName: logoFile.name,
              contentType: logoFile.type,
              size: logoFile.size,
              category: 'integrations',
            });
            logoPath = uploadResult.url;
          } catch (uploadError) {
            return c.json(
              {
                error: uploadError instanceof Error ? uploadError.message : 'Logo upload failed',
              },
              400
            );
          }
        }
      } else {
        // Handle JSON body
        const body = await c.req.json();
        const parseResult = updateIntegrationSchema.safeParse(body);

        if (!parseResult.success) {
          return c.json(
            {
              error: 'Validation failed',
              details: parseResult.error.flatten().fieldErrors,
            },
            400
          );
        }

        data = parseResult.data;
      }

      // Build update data
      const updateData: Record<string, unknown> = {
        logo_url: logoPath,
        updated_at: new Date().toISOString(),
      };

      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description || null;
      if (data.category !== undefined) updateData.category = data.category;
      if (data.website_url !== undefined) updateData.website_url = data.website_url || null;
      if (data.display_order !== undefined) updateData.display_order = data.display_order;
      if (data.status !== undefined) updateData.status = data.status;

      // Update the integration
      await db.update('integrations', updateData, 'id = ?', [id]);

      // Fetch the updated integration
      const updatedIntegration = await db.queryFirst<IntegrationRecord>(
        'SELECT * FROM integrations WHERE id = ?',
        [id]
      );

      return c.json(updatedIntegration);
    } catch (error) {
      return c.json({ error: 'Server error' }, 500);
    }
  }
);

/**
 * DELETE /api/integrations/admin/:id
 * Delete integration (protected)
 */
integrationsRoutes.delete(
  '/admin/:id',
  authenticateToken,
  zValidator('param', integrationIdSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid integration ID' }, 400);
    }
  }),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const db = createDatabaseService(c.env);

      const changes = await db.delete('integrations', 'id = ?', [id]);

      if (changes === 0) {
        return c.json({ error: 'Integration not found' }, 404);
      }

      return c.json({ message: 'Integration deleted successfully' });
    } catch (error) {
      return c.json({ error: 'Server error' }, 500);
    }
  }
);

/**
 * GET /api/integrations/stats
 * Get integration statistics (protected)
 */
integrationsRoutes.get('/stats', authenticateToken, async (c) => {
  try {
    const db = createDatabaseService(c.env);

    // Execute all stats queries in parallel
    const [total, active, inactive, byCategory, today, thisWeek, thisMonth] = await Promise.all([
      // Total integrations
      db.queryFirst<{ count: number }>('SELECT COUNT(*) as count FROM integrations'),

      // Active integrations
      db.queryFirst<{ count: number }>(
        "SELECT COUNT(*) as count FROM integrations WHERE status = 'active'"
      ),

      // Inactive integrations
      db.queryFirst<{ count: number }>(
        "SELECT COUNT(*) as count FROM integrations WHERE status = 'inactive'"
      ),

      // Integrations by category
      db.query<{ category: string; count: number }>(
        'SELECT category, COUNT(*) as count FROM integrations GROUP BY category ORDER BY count DESC'
      ),

      // Integrations created today
      db.queryFirst<{ count: number }>(
        "SELECT COUNT(*) as count FROM integrations WHERE DATE(created_at) = DATE('now')"
      ),

      // Integrations this week
      db.queryFirst<{ count: number }>(
        "SELECT COUNT(*) as count FROM integrations WHERE created_at >= datetime('now', '-7 days')"
      ),

      // Integrations this month
      db.queryFirst<{ count: number }>(
        "SELECT COUNT(*) as count FROM integrations WHERE created_at >= datetime('now', '-30 days')"
      ),
    ]);

    return c.json({
      success: true,
      stats: {
        total: total?.count || 0,
        active: active?.count || 0,
        inactive: inactive?.count || 0,
        today: today?.count || 0,
        thisWeek: thisWeek?.count || 0,
        thisMonth: thisMonth?.count || 0,
        byCategory,
      },
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: 'Failed to fetch stats',
      },
      500
    );
  }
});

// ============================================================================
// Public Routes
// ============================================================================

/**
 * GET /api/integrations
 * Get all integrations with pagination and filtering (public)
 */
integrationsRoutes.get(
  '/',
  zValidator('query', listIntegrationsSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: 'Invalid query parameters',
        },
        400
      );
    }
  }),
  async (c) => {
    try {
      const { page = 1, limit = 20, category, status } = c.req.valid('query');
      const db = createDatabaseService(c.env);

      // Ensure reasonable limits
      const safeLimit = Math.min(Math.max(1, limit), 500);
      const safePage = Math.max(1, page);
      const offset = (safePage - 1) * safeLimit;

      // Build WHERE clause dynamically
      const conditions: string[] = [];
      const params: unknown[] = [];

      if (category) {
        conditions.push('category = ?');
        params.push(category);
      }
      if (status) {
        conditions.push('status = ?');
        params.push(status);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Get total count with filters
      const countResult = await db.queryFirst<{ total: number }>(
        `SELECT COUNT(*) as total FROM integrations ${whereClause}`,
        params
      );
      const total = countResult?.total || 0;

      // Get paginated integrations with filters
      const integrations = await db.query<IntegrationRecord>(
        `SELECT * FROM integrations ${whereClause} ORDER BY category, display_order LIMIT ? OFFSET ?`,
        [...params, safeLimit, offset]
      );

      return c.json({
        data: integrations,
        pagination: {
          page: safePage,
          limit: safeLimit,
          total,
          totalPages: Math.ceil(total / safeLimit),
          hasMore: safePage * safeLimit < total,
        },
      });
    } catch (error) {
      return c.json({ error: 'Server error' }, 500);
    }
  }
);

/**
 * GET /api/integrations/category/:category
 * Get integrations by category (public)
 */
integrationsRoutes.get(
  '/category/:category',
  zValidator('param', categorySchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid category' }, 400);
    }
  }),
  async (c) => {
    try {
      const { category } = c.req.valid('param');
      const db = createDatabaseService(c.env);

      const integrations = await db.query<IntegrationRecord>(
        'SELECT * FROM integrations WHERE category = ? ORDER BY display_order',
        [category]
      );

      return c.json(integrations);
    } catch (error) {
      return c.json({ error: 'Server error' }, 500);
    }
  }
);

/**
 * GET /api/integrations/:id
 * Get single integration by ID (public) - MUST come after admin and category routes
 */
integrationsRoutes.get(
  '/:id',
  zValidator('param', integrationIdSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid integration ID' }, 400);
    }
  }),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const db = createDatabaseService(c.env);

      const integration = await db.queryFirst<IntegrationRecord>(
        'SELECT * FROM integrations WHERE id = ?',
        [id]
      );

      if (!integration) {
        return c.json({ error: 'Integration not found' }, 404);
      }

      return c.json(integration);
    } catch (error) {
      return c.json({ error: 'Server error' }, 500);
    }
  }
);

export { integrationsRoutes };
export default integrationsRoutes;
