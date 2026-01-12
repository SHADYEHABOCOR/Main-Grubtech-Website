/**
 * Integration Requests Routes for Cloudflare Workers
 *
 * Provides endpoints for partner/integration requests management.
 * Public endpoint for submitting requests, admin endpoints for managing them.
 *
 * Endpoints:
 * - POST /         - Submit a new integration request (public)
 * - GET /admin     - Get all integration requests with pagination (protected)
 * - PATCH /admin/:id - Update integration request status (protected)
 * - DELETE /admin/:id - Delete integration request (protected)
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env, Variables } from '../types/bindings';
import { createDatabaseService } from '../db';
import { authenticateToken } from '../middleware/auth';

// Integration request record type from database
interface IntegrationRequestRecord {
  id: number;
  email: string;
  company_name: string | null;
  message: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

// Zod schemas for validation

/**
 * Schema for creating a new integration request (public)
 */
const createIntegrationRequestSchema = z.object({
  email: z.string().email('Valid email is required'),
  company_name: z.string().max(255, 'Company name is too long').trim().optional().nullable(),
  message: z.string().max(2000, 'Message is too long').trim().optional().nullable(),
});

/**
 * Schema for updating integration request status
 */
const updateStatusSchema = z.object({
  status: z.enum(['pending', 'contacted', 'completed', 'rejected'], {
    errorMap: () => ({ message: 'Invalid status' }),
  }),
});

/**
 * Schema for pagination and filter query parameters
 */
const adminQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  status: z.enum(['pending', 'contacted', 'completed', 'rejected']).optional(),
});

/**
 * Schema for ID parameter
 */
const idSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid ID'),
});

// Create integration requests router
const integrationRequestsRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

/**
 * POST /api/integration-requests
 * Submit a new integration request (public)
 */
integrationRequestsRoutes.post(
  '/',
  zValidator('json', createIntegrationRequestSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          errors: result.error.errors.map((err) => ({
            type: 'field',
            msg: err.message,
            path: err.path.join('.'),
            location: 'body',
          })),
        },
        400
      );
    }
  }),
  async (c) => {
    try {
      const body = c.req.valid('json');
      const db = createDatabaseService(c.env);

      // Insert integration request
      const requestId = await db.insert('integration_requests', {
        email: body.email,
        company_name: body.company_name || null,
        message: body.message || null,
      });

      if (!requestId) {
        return c.json({ error: 'Server error' }, 500);
      }

      return c.json(
        {
          message: 'Integration request submitted successfully',
          id: requestId,
        },
        201
      );
    } catch (error) {
      return c.json({ error: 'Server error' }, 500);
    }
  }
);

/**
 * GET /api/integration-requests/admin
 * Get all integration requests with pagination and optional status filter (protected)
 */
integrationRequestsRoutes.get(
  '/admin',
  authenticateToken,
  zValidator('query', adminQuerySchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: 'Invalid query parameters',
          details: result.error.flatten().fieldErrors,
        },
        400
      );
    }
  }),
  async (c) => {
    try {
      const { page = 1, limit = 20, status } = c.req.valid('query');
      const db = createDatabaseService(c.env);

      // Ensure reasonable limits
      const safeLimit = Math.min(Math.max(1, limit), 100);
      const safePage = Math.max(1, page);
      const offset = (safePage - 1) * safeLimit;

      // Build query based on status filter
      let requests: IntegrationRequestRecord[];
      let total: number;

      if (status) {
        // With status filter
        requests = await db.query<IntegrationRequestRecord>(
          `SELECT * FROM integration_requests WHERE status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
          [status, safeLimit, offset]
        );

        const countResult = await db.queryFirst<{ total: number }>(
          'SELECT COUNT(*) as total FROM integration_requests WHERE status = ?',
          [status]
        );
        total = countResult?.total || 0;
      } else {
        // Without status filter
        requests = await db.query<IntegrationRequestRecord>(
          `SELECT * FROM integration_requests ORDER BY created_at DESC LIMIT ? OFFSET ?`,
          [safeLimit, offset]
        );

        const countResult = await db.queryFirst<{ total: number }>(
          'SELECT COUNT(*) as total FROM integration_requests'
        );
        total = countResult?.total || 0;
      }

      return c.json({
        data: requests,
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
 * PATCH /api/integration-requests/admin/:id
 * Update integration request status (protected)
 */
integrationRequestsRoutes.patch(
  '/admin/:id',
  authenticateToken,
  zValidator('param', idSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid ID' }, 400);
    }
  }),
  zValidator('json', updateStatusSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid status' }, 400);
    }
  }),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const { status } = c.req.valid('json');
      const db = createDatabaseService(c.env);

      // Update the integration request status
      const changes = await db.update(
        'integration_requests',
        {
          status,
          updated_at: new Date().toISOString(),
        },
        'id = ?',
        [id]
      );

      if (changes === 0) {
        return c.json({ error: 'Integration request not found' }, 404);
      }

      // Fetch and return the updated record
      const updated = await db.queryFirst<IntegrationRequestRecord>(
        'SELECT * FROM integration_requests WHERE id = ?',
        [id]
      );

      return c.json(updated);
    } catch (error) {
      return c.json({ error: 'Server error' }, 500);
    }
  }
);

/**
 * DELETE /api/integration-requests/admin/:id
 * Delete integration request (protected)
 */
integrationRequestsRoutes.delete(
  '/admin/:id',
  authenticateToken,
  zValidator('param', idSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid ID' }, 400);
    }
  }),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const db = createDatabaseService(c.env);

      const changes = await db.delete('integration_requests', 'id = ?', [id]);

      if (changes === 0) {
        return c.json({ error: 'Integration request not found' }, 404);
      }

      return c.json({ message: 'Integration request deleted successfully' });
    } catch (error) {
      return c.json({ error: 'Server error' }, 500);
    }
  }
);

export { integrationRequestsRoutes };
export default integrationRequestsRoutes;
