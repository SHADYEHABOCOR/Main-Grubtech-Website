/**
 * Policy Pages Routes for Cloudflare Workers
 *
 * Provides endpoints for legal policy pages (privacy policy, terms, etc.)
 * including public viewing and admin CRUD operations.
 *
 * Endpoints:
 * - GET /admin/all    - Get all policy pages including drafts (protected)
 * - GET /admin/:id    - Get single policy page by ID (protected)
 * - POST /admin       - Create new policy page (protected)
 * - PUT /admin/:id    - Update policy page (protected)
 * - DELETE /admin/:id - Delete policy page (protected)
 * - GET /             - Get all published policy pages (public)
 * - GET /:slug        - Get single policy page by slug (public)
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env, Variables } from '../types/bindings';
import { createDatabaseService } from '../db';
import { authenticateToken } from '../middleware/auth';

// Policy page record type from database
interface PolicyPageRecord {
  id: number;
  slug: string;
  title_en: string;
  title_ar: string | null;
  title_es: string | null;
  title_pt: string | null;
  content_en: string;
  content_ar: string | null;
  content_es: string | null;
  content_pt: string | null;
  meta_description: string | null;
  status: 'published' | 'draft';
  created_at: string;
  updated_at: string;
}

// Localized policy page response
interface LocalizedPolicyPage extends PolicyPageRecord {
  title: string;
  content: string;
}

// Allowed languages based on PolicyPage interface columns
const ALLOWED_LANGUAGES = ['en', 'ar', 'es', 'pt'] as const;

// Zod schemas for validation

/**
 * Schema for creating a new policy page
 */
const createPolicySchema = z.object({
  slug: z.string().min(1, 'Slug is required').max(255, 'Slug is too long'),
  title_en: z.string().min(1, 'English title is required').max(500, 'Title is too long'),
  title_ar: z.string().max(500, 'Title is too long').optional().nullable(),
  title_es: z.string().max(500, 'Title is too long').optional().nullable(),
  title_pt: z.string().max(500, 'Title is too long').optional().nullable(),
  content_en: z.string().min(1, 'English content is required'),
  content_ar: z.string().optional().nullable(),
  content_es: z.string().optional().nullable(),
  content_pt: z.string().optional().nullable(),
  meta_description: z.string().max(500, 'Meta description is too long').optional().nullable(),
  status: z.enum(['draft', 'published']).optional().default('published'),
});

/**
 * Schema for updating a policy page
 */
const updatePolicySchema = z.object({
  slug: z.string().min(1, 'Slug is required').max(255, 'Slug is too long').optional(),
  title_en: z.string().min(1, 'English title is required').max(500, 'Title is too long').optional(),
  title_ar: z.string().max(500, 'Title is too long').optional().nullable(),
  title_es: z.string().max(500, 'Title is too long').optional().nullable(),
  title_pt: z.string().max(500, 'Title is too long').optional().nullable(),
  content_en: z.string().min(1, 'English content is required').optional(),
  content_ar: z.string().optional().nullable(),
  content_es: z.string().optional().nullable(),
  content_pt: z.string().optional().nullable(),
  meta_description: z.string().max(500, 'Meta description is too long').optional().nullable(),
  status: z.enum(['draft', 'published']).optional(),
});

/**
 * Schema for policy page ID parameter
 */
const policyIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid policy ID'),
});

/**
 * Schema for policy page slug parameter
 */
const policySlugSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
});

/**
 * Schema for language query parameter
 */
const langQuerySchema = z.object({
  lang: z.string().max(10).optional(),
});

// Helper function to validate language parameter
function validateLanguage(lang: string | undefined): string {
  if (!lang || !ALLOWED_LANGUAGES.includes(lang as typeof ALLOWED_LANGUAGES[number])) {
    return 'en';
  }
  return lang;
}

// Helper function to localize policy content
function localizePolicy(policy: PolicyPageRecord, lang: string): LocalizedPolicyPage {
  let title = policy.title_en;
  let content = policy.content_en;

  // Use language-specific content if available
  if (lang === 'ar' && policy.title_ar) {
    title = policy.title_ar;
    content = policy.content_ar || policy.content_en;
  } else if (lang === 'es' && policy.title_es) {
    title = policy.title_es;
    content = policy.content_es || policy.content_en;
  } else if (lang === 'pt' && policy.title_pt) {
    title = policy.title_pt;
    content = policy.content_pt || policy.content_en;
  }

  return {
    ...policy,
    title,
    content,
  };
}

// Create policies router
const policiesRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// ============================================================================
// Admin Routes (Protected) - MUST come before /:slug route
// ============================================================================

/**
 * GET /api/policies/admin/all
 * Get all policy pages including drafts (protected)
 */
policiesRoutes.get('/admin/all', authenticateToken, async (c) => {
  try {
    const db = createDatabaseService(c.env);

    const pages = await db.query<PolicyPageRecord>(
      'SELECT * FROM policy_pages ORDER BY created_at DESC'
    );

    return c.json({ data: pages });
  } catch {
    return c.json({ error: 'Server error' }, 500);
  }
});

/**
 * GET /api/policies/admin/:id
 * Get single policy page by ID (protected)
 */
policiesRoutes.get(
  '/admin/:id',
  authenticateToken,
  zValidator('param', policyIdSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid policy ID' }, 400);
    }
  }),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const db = createDatabaseService(c.env);

      const page = await db.queryFirst<PolicyPageRecord>(
        'SELECT * FROM policy_pages WHERE id = ?',
        [id]
      );

      if (!page) {
        return c.json({ error: 'Policy page not found' }, 404);
      }

      return c.json(page);
    } catch {
      return c.json({ error: 'Server error' }, 500);
    }
  }
);

/**
 * POST /api/policies/admin
 * Create new policy page (protected)
 */
policiesRoutes.post('/admin', authenticateToken, async (c) => {
  try {
    const body = await c.req.json();
    const parseResult = createPolicySchema.safeParse(body);

    if (!parseResult.success) {
      return c.json(
        {
          error: 'Validation failed',
          details: parseResult.error.flatten().fieldErrors,
        },
        400
      );
    }

    const data = parseResult.data;
    const db = createDatabaseService(c.env);

    // Check if slug already exists
    const existing = await db.queryFirst<{ id: number }>(
      'SELECT id FROM policy_pages WHERE slug = ?',
      [data.slug]
    );

    if (existing) {
      return c.json({ error: 'A policy page with this slug already exists' }, 400);
    }

    // Insert policy page
    const pageId = await db.insert('policy_pages', {
      slug: data.slug,
      title_en: data.title_en,
      title_ar: data.title_ar || null,
      title_es: data.title_es || null,
      title_pt: data.title_pt || null,
      content_en: data.content_en,
      content_ar: data.content_ar || null,
      content_es: data.content_es || null,
      content_pt: data.content_pt || null,
      meta_description: data.meta_description || null,
      status: data.status || 'published',
    });

    if (!pageId) {
      return c.json({ error: 'Failed to create policy page' }, 500);
    }

    // Fetch the created page
    const newPage = await db.queryFirst<PolicyPageRecord>(
      'SELECT * FROM policy_pages WHERE id = ?',
      [pageId]
    );

    return c.json(
      {
        success: true,
        message: 'Policy page created successfully',
        data: newPage,
      },
      201
    );
  } catch {
    return c.json({ error: 'Server error' }, 500);
  }
});

/**
 * PUT /api/policies/admin/:id
 * Update policy page (protected)
 */
policiesRoutes.put(
  '/admin/:id',
  authenticateToken,
  zValidator('param', policyIdSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid policy ID' }, 400);
    }
  }),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const body = await c.req.json();
      const parseResult = updatePolicySchema.safeParse(body);

      if (!parseResult.success) {
        return c.json(
          {
            error: 'Validation failed',
            details: parseResult.error.flatten().fieldErrors,
          },
          400
        );
      }

      const data = parseResult.data;
      const db = createDatabaseService(c.env);

      // Check if page exists
      const existing = await db.queryFirst<PolicyPageRecord>(
        'SELECT * FROM policy_pages WHERE id = ?',
        [id]
      );

      if (!existing) {
        return c.json({ error: 'Policy page not found' }, 404);
      }

      // Check if slug is being changed and if new slug already exists
      if (data.slug && data.slug !== existing.slug) {
        const slugExists = await db.queryFirst<{ id: number }>(
          'SELECT id FROM policy_pages WHERE slug = ? AND id != ?',
          [data.slug, id]
        );
        if (slugExists) {
          return c.json({ error: 'A policy page with this slug already exists' }, 400);
        }
      }

      // Build update data
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (data.slug !== undefined) updateData.slug = data.slug;
      if (data.title_en !== undefined) updateData.title_en = data.title_en;
      if (data.title_ar !== undefined) updateData.title_ar = data.title_ar || null;
      if (data.title_es !== undefined) updateData.title_es = data.title_es || null;
      if (data.title_pt !== undefined) updateData.title_pt = data.title_pt || null;
      if (data.content_en !== undefined) updateData.content_en = data.content_en;
      if (data.content_ar !== undefined) updateData.content_ar = data.content_ar || null;
      if (data.content_es !== undefined) updateData.content_es = data.content_es || null;
      if (data.content_pt !== undefined) updateData.content_pt = data.content_pt || null;
      if (data.meta_description !== undefined) updateData.meta_description = data.meta_description || null;
      if (data.status !== undefined) updateData.status = data.status;

      // Update the page
      await db.update('policy_pages', updateData, 'id = ?', [id]);

      // Fetch the updated page
      const updatedPage = await db.queryFirst<PolicyPageRecord>(
        'SELECT * FROM policy_pages WHERE id = ?',
        [id]
      );

      return c.json({
        success: true,
        message: 'Policy page updated successfully',
        data: updatedPage,
      });
    } catch {
      return c.json({ error: 'Server error' }, 500);
    }
  }
);

/**
 * DELETE /api/policies/admin/:id
 * Delete policy page (protected)
 */
policiesRoutes.delete(
  '/admin/:id',
  authenticateToken,
  zValidator('param', policyIdSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid policy ID' }, 400);
    }
  }),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const db = createDatabaseService(c.env);

      const changes = await db.delete('policy_pages', 'id = ?', [id]);

      if (changes === 0) {
        return c.json({ error: 'Policy page not found' }, 404);
      }

      return c.json({
        success: true,
        message: 'Policy page deleted successfully',
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
 * GET /api/policies
 * Get all published policy pages (public)
 */
policiesRoutes.get(
  '/',
  zValidator('query', langQuerySchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid query parameters' }, 400);
    }
  }),
  async (c) => {
    try {
      const { lang } = c.req.valid('query');
      const validatedLang = validateLanguage(lang);
      const db = createDatabaseService(c.env);

      const pages = await db.query<PolicyPageRecord>(
        "SELECT * FROM policy_pages WHERE status = 'published' ORDER BY title_en"
      );

      // Localize each policy based on requested language
      const localizedPages = pages.map((page) => localizePolicy(page, validatedLang));

      return c.json({ data: localizedPages });
    } catch {
      return c.json({ error: 'Server error' }, 500);
    }
  }
);

/**
 * GET /api/policies/:slug
 * Get single policy page by slug (public) - MUST come after admin routes
 */
policiesRoutes.get(
  '/:slug',
  zValidator('param', policySlugSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid slug' }, 400);
    }
  }),
  async (c) => {
    try {
      const { slug } = c.req.valid('param');
      const lang = c.req.query('lang') || 'en';
      const validatedLang = validateLanguage(lang);
      const db = createDatabaseService(c.env);

      const page = await db.queryFirst<PolicyPageRecord>(
        "SELECT * FROM policy_pages WHERE slug = ? AND status = 'published'",
        [slug]
      );

      if (!page) {
        return c.json({ error: 'Policy page not found' }, 404);
      }

      // Localize the policy based on requested language
      return c.json(localizePolicy(page, validatedLang));
    } catch {
      return c.json({ error: 'Server error' }, 500);
    }
  }
);

export { policiesRoutes };
export default policiesRoutes;
