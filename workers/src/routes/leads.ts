/**
 * Lead Management Routes for Cloudflare Workers
 *
 * Provides endpoints for capturing and managing leads (contact form submissions).
 * Public endpoints are rate-limited, admin endpoints require authentication.
 *
 * Endpoints:
 * - POST /       - Capture a new lead (public, rate-limited)
 * - GET /        - Get all leads with pagination (protected)
 * - GET /stats   - Get lead statistics (protected)
 * - GET /:id     - Get a single lead (protected)
 * - DELETE /:id  - Delete a lead (protected)
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env, Variables } from '../types/bindings';
import { createDatabaseService } from '../db';
import { authenticateToken } from '../middleware/auth';
import { leadRateLimiter } from '../middleware/rateLimiter';
import { createEmailService, type LeadData } from '../services/email';

// Lead record type from database
interface LeadRecord {
  id: number;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  restaurant_type: string | null;
  message: string | null;
  form_type: string;
  source_page: string | null;
  created_at: string;
}

// Zod schemas for validation

/**
 * Schema for creating a new lead
 */
const createLeadSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  company: z.string().max(200, 'Company name is too long').optional().nullable(),
  phone: z.string().max(50, 'Phone number is too long').optional().nullable(),
  restaurant_type: z.string().max(100, 'Restaurant type is too long').optional().nullable(),
  message: z.string().max(5000, 'Message is too long').optional().nullable(),
  form_type: z.enum(['contact', 'demo', 'partnership', 'support']).optional().default('contact'),
  source_page: z.string().max(500, 'Source page URL is too long').optional().nullable(),
});

/**
 * Schema for pagination query parameters
 */
const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});

/**
 * Schema for lead ID parameter
 */
const leadIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid lead ID'),
});

// Create leads router
const leadsRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

/**
 * POST /api/leads
 * Capture a new lead (public, rate-limited)
 *
 * This endpoint is rate-limited to prevent spam:
 * - 10 submissions per hour in production
 * - 50 submissions per hour in development
 */
leadsRoutes.post(
  '/',
  leadRateLimiter(),
  zValidator('json', createLeadSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          error: 'Validation failed',
          details: result.error.flatten().fieldErrors,
        },
        400
      );
    }
  }),
  async (c) => {
    try {
      const body = c.req.valid('json');
      const db = createDatabaseService(c.env);

      // Insert lead into database
      const leadId = await db.insert('leads', {
        name: body.name,
        email: body.email,
        company: body.company || null,
        phone: body.phone || null,
        restaurant_type: body.restaurant_type || null,
        message: body.message || null,
        form_type: body.form_type || 'contact',
        source_page: body.source_page || null,
      });

      if (!leadId) {
        return c.json(
          {
            success: false,
            error: 'Failed to capture lead',
          },
          500
        );
      }

      // Send email notifications (async, don't block response)
      const emailService = createEmailService(c.env);
      const leadData: LeadData = {
        id: leadId,
        name: body.name,
        email: body.email,
        company: body.company || undefined,
        phone: body.phone || undefined,
        restaurantType: body.restaurant_type || undefined,
        message: body.message || undefined,
        formType: body.form_type,
        source: body.source_page || undefined,
      };

      // Fire and forget email sending (use waitUntil if available)
      const emailPromise = emailService.sendLeadEmails(leadData).catch(() => {
        // Silently fail - email sending shouldn't affect lead capture
      });

      // Use c.executionCtx.waitUntil if available (Cloudflare Workers)
      if (c.executionCtx && typeof c.executionCtx.waitUntil === 'function') {
        c.executionCtx.waitUntil(emailPromise);
      }

      return c.json(
        {
          success: true,
          message: 'Lead captured successfully',
          leadId,
        },
        201
      );
    } catch (error) {
      return c.json(
        {
          success: false,
          error: 'Failed to capture lead',
        },
        500
      );
    }
  }
);

/**
 * GET /api/leads
 * Get all leads with pagination (protected)
 */
leadsRoutes.get(
  '/',
  authenticateToken,
  zValidator('query', paginationSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          error: 'Invalid pagination parameters',
        },
        400
      );
    }
  }),
  async (c) => {
    try {
      const { page = 1, limit = 50 } = c.req.valid('query');
      const db = createDatabaseService(c.env);

      // Ensure reasonable limits
      const safeLimit = Math.min(Math.max(1, limit), 100);
      const safePage = Math.max(1, page);
      const offset = (safePage - 1) * safeLimit;

      // Get leads with pagination
      const leads = await db.query<LeadRecord>(
        `SELECT * FROM leads ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [safeLimit, offset]
      );

      // Get total count
      const countResult = await db.queryFirst<{ count: number }>(
        'SELECT COUNT(*) as count FROM leads'
      );
      const totalCount = countResult?.count || 0;

      return c.json({
        success: true,
        leads,
        pagination: {
          page: safePage,
          limit: safeLimit,
          total: totalCount,
          pages: Math.ceil(totalCount / safeLimit),
        },
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          error: 'Failed to fetch leads',
        },
        500
      );
    }
  }
);

/**
 * GET /api/leads/stats
 * Get lead statistics (protected)
 */
leadsRoutes.get('/stats', authenticateToken, async (c) => {
  try {
    const db = createDatabaseService(c.env);

    // Execute all stats queries in parallel
    const [total, today, thisWeek, thisMonth, byType, bySource] = await Promise.all([
      // Total leads
      db.queryFirst<{ count: number }>('SELECT COUNT(*) as count FROM leads'),

      // Leads today
      db.queryFirst<{ count: number }>(
        "SELECT COUNT(*) as count FROM leads WHERE DATE(created_at) = DATE('now')"
      ),

      // Leads this week
      db.queryFirst<{ count: number }>(
        "SELECT COUNT(*) as count FROM leads WHERE created_at >= datetime('now', '-7 days')"
      ),

      // Leads this month
      db.queryFirst<{ count: number }>(
        "SELECT COUNT(*) as count FROM leads WHERE created_at >= datetime('now', '-30 days')"
      ),

      // Leads by form type
      db.query<{ form_type: string; count: number }>(
        'SELECT form_type, COUNT(*) as count FROM leads GROUP BY form_type'
      ),

      // Leads by source (top 5)
      db.query<{ source: string; count: number }>(
        `SELECT source_page as source, COUNT(*) as count
         FROM leads
         WHERE source_page IS NOT NULL
         GROUP BY source_page
         ORDER BY count DESC
         LIMIT 5`
      ),
    ]);

    return c.json({
      success: true,
      stats: {
        total: total?.count || 0,
        today: today?.count || 0,
        thisWeek: thisWeek?.count || 0,
        thisMonth: thisMonth?.count || 0,
        byType,
        bySource,
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

/**
 * GET /api/leads/:id
 * Get a single lead by ID (protected)
 */
leadsRoutes.get(
  '/:id',
  authenticateToken,
  zValidator('param', leadIdSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          error: 'Invalid lead ID',
        },
        400
      );
    }
  }),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const db = createDatabaseService(c.env);

      const lead = await db.queryFirst<LeadRecord>(
        'SELECT * FROM leads WHERE id = ?',
        [id]
      );

      if (!lead) {
        return c.json(
          {
            success: false,
            error: 'Lead not found',
          },
          404
        );
      }

      return c.json({
        success: true,
        lead,
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          error: 'Failed to fetch lead',
        },
        500
      );
    }
  }
);

/**
 * DELETE /api/leads/:id
 * Delete a lead by ID (protected)
 */
leadsRoutes.delete(
  '/:id',
  authenticateToken,
  zValidator('param', leadIdSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          error: 'Invalid lead ID',
        },
        400
      );
    }
  }),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const db = createDatabaseService(c.env);

      const changes = await db.delete('leads', 'id = ?', [id]);

      if (changes === 0) {
        return c.json(
          {
            success: false,
            error: 'Lead not found',
          },
          404
        );
      }

      return c.json({
        success: true,
        message: 'Lead deleted successfully',
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          error: 'Failed to delete lead',
        },
        500
      );
    }
  }
);

export { leadsRoutes };
export default leadsRoutes;
