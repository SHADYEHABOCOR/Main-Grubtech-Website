/**
 * Testimonials Management Routes for Cloudflare Workers
 *
 * Provides endpoints for managing customer testimonials including public listing,
 * admin CRUD operations, and statistics.
 *
 * Endpoints:
 * - GET /admin/:id    - Get single testimonial by ID (protected)
 * - POST /admin/create - Create new testimonial (protected)
 * - PUT /admin/:id    - Update testimonial (protected)
 * - DELETE /admin/:id - Delete testimonial (protected)
 * - GET /stats        - Get testimonial statistics (protected)
 * - GET /             - Get published testimonials with pagination (public)
 * - GET /:id          - Get single testimonial by ID (public)
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env, Variables } from '../types/bindings';
import { createDatabaseService } from '../db';
import { authenticateToken } from '../middleware/auth';
import { createStorageService } from '../services/storage';

// Testimonial record type from database
interface TestimonialRecord {
  id: number;
  name: string;
  company: string;
  company_logo: string | null;
  headline: string | null;
  content: string;
  image: string | null;
  rating: number;
  headline_ar: string | null;
  content_ar: string | null;
  headline_es: string | null;
  content_es: string | null;
  headline_pt: string | null;
  content_pt: string | null;
  created_at: string;
  updated_at: string | null;
}

// Localized testimonial response
interface LocalizedTestimonial extends TestimonialRecord {
  headline: string | null;
  content: string;
}

// Zod schemas for validation

/**
 * Schema for creating a new testimonial
 */
const createTestimonialSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name is too long'),
  company: z.string().min(1, 'Company is required').max(200, 'Company is too long'),
  headline: z.string().max(500, 'Headline is too long').optional().nullable(),
  content: z.string().min(1, 'Content is required'),
  rating: z.union([
    z.number().min(1).max(5),
    z.string().regex(/^[1-5]$/).transform(Number)
  ]).optional().default(5),
  headline_ar: z.string().max(500, 'Headline is too long').optional().nullable(),
  content_ar: z.string().optional().nullable(),
  headline_es: z.string().max(500, 'Headline is too long').optional().nullable(),
  content_es: z.string().optional().nullable(),
  headline_pt: z.string().max(500, 'Headline is too long').optional().nullable(),
  content_pt: z.string().optional().nullable(),
});

/**
 * Schema for updating a testimonial
 */
const updateTestimonialSchema = createTestimonialSchema.partial();

/**
 * Schema for pagination query parameters
 */
const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  lang: z.string().max(10).optional(),
});

/**
 * Schema for testimonial ID parameter
 */
const testimonialIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid testimonial ID'),
});

// Helper function to localize testimonial content
function localizeTestimonial(testimonial: TestimonialRecord, lang: string): LocalizedTestimonial {
  let headline = testimonial.headline;
  let content = testimonial.content;

  // Use language-specific content if available
  if (lang === 'ar' && testimonial.headline_ar) {
    headline = testimonial.headline_ar;
    content = testimonial.content_ar || testimonial.content;
  } else if (lang === 'es' && testimonial.headline_es) {
    headline = testimonial.headline_es;
    content = testimonial.content_es || testimonial.content;
  } else if (lang === 'pt' && testimonial.headline_pt) {
    headline = testimonial.headline_pt;
    content = testimonial.content_pt || testimonial.content;
  }

  return {
    ...testimonial,
    headline,
    content,
  };
}

// Create testimonials router
const testimonialsRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// ============================================================================
// Admin Routes (Protected) - MUST come before /:id route
// ============================================================================

/**
 * GET /api/testimonials/admin/:id
 * Get single testimonial by ID (protected)
 */
testimonialsRoutes.get(
  '/admin/:id',
  authenticateToken,
  zValidator('param', testimonialIdSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid testimonial ID' }, 400);
    }
  }),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const db = createDatabaseService(c.env);

      const testimonial = await db.queryFirst<TestimonialRecord>(
        'SELECT * FROM testimonials WHERE id = ?',
        [id]
      );

      if (!testimonial) {
        return c.json({ error: 'Testimonial not found' }, 404);
      }

      return c.json(testimonial);
    } catch (error) {
      return c.json({ error: 'Server error' }, 500);
    }
  }
);

/**
 * POST /api/testimonials/admin/create
 * Create new testimonial (protected)
 */
testimonialsRoutes.post('/admin/create', authenticateToken, async (c) => {
  try {
    const contentType = c.req.header('Content-Type') || '';
    const db = createDatabaseService(c.env);
    let data: z.infer<typeof createTestimonialSchema>;
    let imagePath: string | null = null;
    let companyLogoPath: string | null = null;

    // Handle multipart form data (with image upload)
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
      const parseResult = createTestimonialSchema.safeParse({
        name: formFields.name,
        company: formFields.company,
        headline: formFields.headline,
        content: formFields.content,
        rating: formFields.rating,
        headline_ar: formFields.headline_ar,
        content_ar: formFields.content_ar,
        headline_es: formFields.headline_es,
        content_es: formFields.content_es,
        headline_pt: formFields.headline_pt,
        content_pt: formFields.content_pt,
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

      // Handle image upload
      const imageFile = formData.get('image') as File | null;
      if (imageFile && imageFile.size > 0 && typeof imageFile.arrayBuffer === 'function') {
        const storage = createStorageService(c.env);
        const arrayBuffer = await imageFile.arrayBuffer();

        try {
          const uploadResult = await storage.uploadImage(arrayBuffer, {
            originalName: imageFile.name,
            contentType: imageFile.type,
            size: imageFile.size,
            category: 'testimonials',
          });
          imagePath = uploadResult.url;
        } catch (uploadError) {
          return c.json(
            {
              error: uploadError instanceof Error ? uploadError.message : 'Image upload failed',
            },
            400
          );
        }
      }

      // Handle company logo upload
      const companyLogoFile = formData.get('company_logo') as File | null;
      if (companyLogoFile && companyLogoFile.size > 0 && typeof companyLogoFile.arrayBuffer === 'function') {
        const storage = createStorageService(c.env);
        const arrayBuffer = await companyLogoFile.arrayBuffer();

        try {
          const uploadResult = await storage.uploadImage(arrayBuffer, {
            originalName: companyLogoFile.name,
            contentType: companyLogoFile.type,
            size: companyLogoFile.size,
            category: 'testimonials',
          });
          companyLogoPath = uploadResult.url;
        } catch (uploadError) {
          return c.json(
            {
              error: uploadError instanceof Error ? uploadError.message : 'Company logo upload failed',
            },
            400
          );
        }
      }
    } else {
      // Handle JSON body
      const body = await c.req.json();
      const parseResult = createTestimonialSchema.safeParse(body);

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

    // Insert testimonial
    const testimonialId = await db.insert('testimonials', {
      name: data.name,
      company: data.company,
      company_logo: companyLogoPath,
      headline: data.headline || null,
      content: data.content,
      image: imagePath,
      rating: data.rating || 5,
      headline_ar: data.headline_ar || null,
      content_ar: data.content_ar || null,
      headline_es: data.headline_es || null,
      content_es: data.content_es || null,
      headline_pt: data.headline_pt || null,
      content_pt: data.content_pt || null,
    });

    if (!testimonialId) {
      return c.json({ error: 'Failed to create testimonial' }, 500);
    }

    // Fetch the created testimonial
    const newTestimonial = await db.queryFirst<TestimonialRecord>(
      'SELECT * FROM testimonials WHERE id = ?',
      [testimonialId]
    );

    return c.json(newTestimonial, 201);
  } catch (error) {
    return c.json({ error: 'Server error' }, 500);
  }
});

/**
 * PUT /api/testimonials/admin/:id
 * Update testimonial (protected)
 */
testimonialsRoutes.put(
  '/admin/:id',
  authenticateToken,
  zValidator('param', testimonialIdSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid testimonial ID' }, 400);
    }
  }),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const contentType = c.req.header('Content-Type') || '';
      const db = createDatabaseService(c.env);

      // Check if testimonial exists
      const existing = await db.queryFirst<TestimonialRecord>(
        'SELECT * FROM testimonials WHERE id = ?',
        [id]
      );

      if (!existing) {
        return c.json({ error: 'Testimonial not found' }, 404);
      }

      let data: z.infer<typeof updateTestimonialSchema>;
      let imagePath: string | null = existing.image;
      let companyLogoPath: string | null = existing.company_logo;

      // Handle multipart form data (with image upload)
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
        const parseResult = updateTestimonialSchema.safeParse({
          name: formFields.name,
          company: formFields.company,
          headline: formFields.headline,
          content: formFields.content,
          rating: formFields.rating,
          headline_ar: formFields.headline_ar,
          content_ar: formFields.content_ar,
          headline_es: formFields.headline_es,
          content_es: formFields.content_es,
          headline_pt: formFields.headline_pt,
          content_pt: formFields.content_pt,
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

        // Handle image upload
        const imageFile = formData.get('image') as File | null;
        if (imageFile && imageFile.size > 0 && typeof imageFile.arrayBuffer === 'function') {
          const storage = createStorageService(c.env);
          const arrayBuffer = await imageFile.arrayBuffer();

          try {
            const uploadResult = await storage.uploadImage(arrayBuffer, {
              originalName: imageFile.name,
              contentType: imageFile.type,
              size: imageFile.size,
              category: 'testimonials',
            });
            imagePath = uploadResult.url;
          } catch (uploadError) {
            return c.json(
              {
                error: uploadError instanceof Error ? uploadError.message : 'Image upload failed',
              },
              400
            );
          }
        }

        // Handle company logo upload
        const companyLogoFile = formData.get('company_logo') as File | null;
        if (companyLogoFile && companyLogoFile.size > 0 && typeof companyLogoFile.arrayBuffer === 'function') {
          const storage = createStorageService(c.env);
          const arrayBuffer = await companyLogoFile.arrayBuffer();

          try {
            const uploadResult = await storage.uploadImage(arrayBuffer, {
              originalName: companyLogoFile.name,
              contentType: companyLogoFile.type,
              size: companyLogoFile.size,
              category: 'testimonials',
            });
            companyLogoPath = uploadResult.url;
          } catch (uploadError) {
            return c.json(
              {
                error: uploadError instanceof Error ? uploadError.message : 'Company logo upload failed',
              },
              400
            );
          }
        }
      } else {
        // Handle JSON body
        const body = await c.req.json();
        const parseResult = updateTestimonialSchema.safeParse(body);

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
        image: imagePath,
        company_logo: companyLogoPath,
        updated_at: new Date().toISOString(),
      };

      if (data.name !== undefined) updateData.name = data.name;
      if (data.company !== undefined) updateData.company = data.company;
      if (data.headline !== undefined) updateData.headline = data.headline || null;
      if (data.content !== undefined) updateData.content = data.content;
      if (data.rating !== undefined) updateData.rating = data.rating;
      if (data.headline_ar !== undefined) updateData.headline_ar = data.headline_ar || null;
      if (data.content_ar !== undefined) updateData.content_ar = data.content_ar || null;
      if (data.headline_es !== undefined) updateData.headline_es = data.headline_es || null;
      if (data.content_es !== undefined) updateData.content_es = data.content_es || null;
      if (data.headline_pt !== undefined) updateData.headline_pt = data.headline_pt || null;
      if (data.content_pt !== undefined) updateData.content_pt = data.content_pt || null;

      // Update the testimonial
      await db.update('testimonials', updateData, 'id = ?', [id]);

      // Fetch the updated testimonial
      const updatedTestimonial = await db.queryFirst<TestimonialRecord>(
        'SELECT * FROM testimonials WHERE id = ?',
        [id]
      );

      return c.json(updatedTestimonial);
    } catch (error) {
      return c.json({ error: 'Server error' }, 500);
    }
  }
);

/**
 * DELETE /api/testimonials/admin/:id
 * Delete testimonial (protected)
 */
testimonialsRoutes.delete(
  '/admin/:id',
  authenticateToken,
  zValidator('param', testimonialIdSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid testimonial ID' }, 400);
    }
  }),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const db = createDatabaseService(c.env);

      const changes = await db.delete('testimonials', 'id = ?', [id]);

      if (changes === 0) {
        return c.json({ error: 'Testimonial not found' }, 404);
      }

      return c.json({ message: 'Testimonial deleted successfully' });
    } catch (error) {
      return c.json({ error: 'Server error' }, 500);
    }
  }
);

/**
 * GET /api/testimonials/stats
 * Get testimonial statistics (protected)
 */
testimonialsRoutes.get('/stats', authenticateToken, async (c) => {
  try {
    const db = createDatabaseService(c.env);

    // Execute all stats queries in parallel
    const [total, today, thisWeek, thisMonth, byRating, averageRating] = await Promise.all([
      // Total testimonials
      db.queryFirst<{ count: number }>('SELECT COUNT(*) as count FROM testimonials'),

      // Testimonials created today
      db.queryFirst<{ count: number }>(
        "SELECT COUNT(*) as count FROM testimonials WHERE DATE(created_at) = DATE('now')"
      ),

      // Testimonials this week
      db.queryFirst<{ count: number }>(
        "SELECT COUNT(*) as count FROM testimonials WHERE created_at >= datetime('now', '-7 days')"
      ),

      // Testimonials this month
      db.queryFirst<{ count: number }>(
        "SELECT COUNT(*) as count FROM testimonials WHERE created_at >= datetime('now', '-30 days')"
      ),

      // Testimonials by rating
      db.query<{ rating: number; count: number }>(
        'SELECT rating, COUNT(*) as count FROM testimonials GROUP BY rating ORDER BY rating'
      ),

      // Average rating
      db.queryFirst<{ average: number | null }>(
        'SELECT AVG(rating) as average FROM testimonials'
      ),
    ]);

    return c.json({
      success: true,
      stats: {
        total: total?.count || 0,
        today: today?.count || 0,
        thisWeek: thisWeek?.count || 0,
        thisMonth: thisMonth?.count || 0,
        byRating,
        averageRating: averageRating?.average || 0,
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
 * GET /api/testimonials
 * Get all testimonials with pagination (public)
 */
testimonialsRoutes.get(
  '/',
  zValidator('query', paginationSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: 'Invalid pagination parameters',
        },
        400
      );
    }
  }),
  async (c) => {
    try {
      const { page = 1, limit = 10, lang = 'en' } = c.req.valid('query');
      const db = createDatabaseService(c.env);

      // Ensure reasonable limits
      const safeLimit = Math.min(Math.max(1, limit), 100);
      const safePage = Math.max(1, page);
      const offset = (safePage - 1) * safeLimit;

      // Get total count
      const countResult = await db.queryFirst<{ total: number }>(
        'SELECT COUNT(*) as total FROM testimonials'
      );
      const total = countResult?.total || 0;

      // Get paginated testimonials
      const testimonials = await db.query<TestimonialRecord>(
        'SELECT * FROM testimonials ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [safeLimit, offset]
      );

      // Localize each testimonial based on requested language
      const localizedTestimonials = testimonials.map((testimonial) =>
        localizeTestimonial(testimonial, lang)
      );

      return c.json({
        data: localizedTestimonials,
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
 * GET /api/testimonials/:id
 * Get single testimonial by ID (public) - MUST come after admin routes
 */
testimonialsRoutes.get(
  '/:id',
  zValidator('param', testimonialIdSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid testimonial ID' }, 400);
    }
  }),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const lang = c.req.query('lang') || 'en';
      const db = createDatabaseService(c.env);

      const testimonial = await db.queryFirst<TestimonialRecord>(
        'SELECT * FROM testimonials WHERE id = ?',
        [id]
      );

      if (!testimonial) {
        return c.json({ error: 'Testimonial not found' }, 404);
      }

      // Localize the testimonial based on requested language
      return c.json(localizeTestimonial(testimonial, lang));
    } catch (error) {
      return c.json({ error: 'Server error' }, 500);
    }
  }
);

export { testimonialsRoutes };
export default testimonialsRoutes;
