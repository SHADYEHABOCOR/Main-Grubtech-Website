/**
 * Blog Management Routes for Cloudflare Workers
 *
 * Provides endpoints for blog post management including public listing,
 * admin CRUD operations, and statistics.
 *
 * Endpoints:
 * - GET /admin/all    - Get all posts including drafts (protected)
 * - GET /admin/:id    - Get single post by ID (protected)
 * - POST /admin/create - Create new blog post (protected)
 * - PUT /admin/:id    - Update blog post (protected)
 * - DELETE /admin/:id - Delete blog post (protected)
 * - GET /stats        - Get blog statistics (protected)
 * - GET /             - Get published posts with pagination (public)
 * - GET /:slug        - Get single post by slug (public)
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env, Variables } from '../types/bindings';
import { createDatabaseService } from '../db';
import { authenticateToken } from '../middleware/auth';
import { createStorageService } from '../services/storage';

// Blog post record type from database
interface BlogPostRecord {
  id: number;
  title_en: string;
  title_ar: string | null;
  title_es: string | null;
  title_pt: string | null;
  content_en: string;
  content_ar: string | null;
  content_es: string | null;
  content_pt: string | null;
  excerpt_en: string | null;
  excerpt_ar: string | null;
  excerpt_es: string | null;
  excerpt_pt: string | null;
  slug: string;
  featured_image: string | null;
  status: 'draft' | 'published';
  language: string;
  created_at: string;
  updated_at: string;
}

// Localized blog post response
interface LocalizedBlogPost extends Omit<BlogPostRecord, 'title_en' | 'title_ar' | 'title_es' | 'title_pt' | 'content_en' | 'content_ar' | 'content_es' | 'content_pt' | 'excerpt_en' | 'excerpt_ar' | 'excerpt_es' | 'excerpt_pt'> {
  title: string;
  content: string;
  excerpt: string | null;
  title_en: string;
  title_ar: string | null;
  title_es: string | null;
  title_pt: string | null;
  content_en: string;
  content_ar: string | null;
  content_es: string | null;
  content_pt: string | null;
  excerpt_en: string | null;
  excerpt_ar: string | null;
  excerpt_es: string | null;
  excerpt_pt: string | null;
}

// Zod schemas for validation

/**
 * Schema for creating a new blog post
 */
const createBlogPostSchema = z.object({
  title_en: z.string().min(1, 'English title is required').max(500, 'Title is too long'),
  title_ar: z.string().max(500, 'Title is too long').optional().nullable(),
  title_es: z.string().max(500, 'Title is too long').optional().nullable(),
  title_pt: z.string().max(500, 'Title is too long').optional().nullable(),
  content_en: z.string().min(1, 'English content is required'),
  content_ar: z.string().optional().nullable(),
  content_es: z.string().optional().nullable(),
  content_pt: z.string().optional().nullable(),
  excerpt_en: z.string().max(1000, 'Excerpt is too long').optional().nullable(),
  excerpt_ar: z.string().max(1000, 'Excerpt is too long').optional().nullable(),
  excerpt_es: z.string().max(1000, 'Excerpt is too long').optional().nullable(),
  excerpt_pt: z.string().max(1000, 'Excerpt is too long').optional().nullable(),
  status: z.enum(['draft', 'published']).optional().default('draft'),
  language: z.string().max(10).optional().default('en'),
});

/**
 * Schema for updating a blog post
 */
const updateBlogPostSchema = createBlogPostSchema.partial();

/**
 * Schema for pagination query parameters
 */
const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  lang: z.string().max(10).optional(),
});

/**
 * Schema for blog post ID parameter
 */
const postIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid post ID'),
});

/**
 * Schema for blog post slug parameter
 */
const postSlugSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
});

// Helper function to generate slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Helper function to localize blog post content
function localizePost(post: BlogPostRecord, lang: string): LocalizedBlogPost {
  let title = post.title_en;
  let content = post.content_en;
  let excerpt = post.excerpt_en;

  // Use language-specific content if available
  if (lang === 'ar' && post.title_ar) {
    title = post.title_ar;
    content = post.content_ar || post.content_en;
    excerpt = post.excerpt_ar || post.excerpt_en;
  } else if (lang === 'es' && post.title_es) {
    title = post.title_es;
    content = post.content_es || post.content_en;
    excerpt = post.excerpt_es || post.excerpt_en;
  } else if (lang === 'pt' && post.title_pt) {
    title = post.title_pt;
    content = post.content_pt || post.content_en;
    excerpt = post.excerpt_pt || post.excerpt_en;
  }

  return {
    ...post,
    title,
    content,
    excerpt,
  };
}

// Create blog router
const blogRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// ============================================================================
// Admin Routes (Protected) - MUST come before /:slug route
// ============================================================================

/**
 * GET /api/blog/admin/all
 * Get all posts including drafts (protected)
 */
blogRoutes.get('/admin/all', authenticateToken, async (c) => {
  try {
    const db = createDatabaseService(c.env);

    const posts = await db.query<BlogPostRecord>(
      'SELECT * FROM blog_posts ORDER BY created_at DESC'
    );

    return c.json(posts);
  } catch (error) {
    return c.json({ error: 'Server error' }, 500);
  }
});

/**
 * GET /api/blog/admin/:id
 * Get single post by ID (protected)
 */
blogRoutes.get(
  '/admin/:id',
  authenticateToken,
  zValidator('param', postIdSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid post ID' }, 400);
    }
  }),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const db = createDatabaseService(c.env);

      const post = await db.queryFirst<BlogPostRecord>(
        'SELECT * FROM blog_posts WHERE id = ?',
        [id]
      );

      if (!post) {
        return c.json({ error: 'Post not found' }, 404);
      }

      return c.json(post);
    } catch (error) {
      return c.json({ error: 'Server error' }, 500);
    }
  }
);

/**
 * POST /api/blog/admin/create
 * Create new blog post (protected)
 */
blogRoutes.post('/admin/create', authenticateToken, async (c) => {
  try {
    const contentType = c.req.header('Content-Type') || '';
    const db = createDatabaseService(c.env);
    let data: z.infer<typeof createBlogPostSchema>;
    let featuredImage: string | null = null;

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
      const parseResult = createBlogPostSchema.safeParse({
        title_en: formFields.title_en,
        title_ar: formFields.title_ar,
        title_es: formFields.title_es,
        title_pt: formFields.title_pt,
        content_en: formFields.content_en,
        content_ar: formFields.content_ar,
        content_es: formFields.content_es,
        content_pt: formFields.content_pt,
        excerpt_en: formFields.excerpt_en,
        excerpt_ar: formFields.excerpt_ar,
        excerpt_es: formFields.excerpt_es,
        excerpt_pt: formFields.excerpt_pt,
        status: formFields.status,
        language: formFields.language,
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
      const imageFile = formData.get('featured_image');
      if (imageFile && imageFile instanceof File && imageFile.size > 0) {
        const storage = createStorageService(c.env);
        const arrayBuffer = await imageFile.arrayBuffer();

        try {
          const uploadResult = await storage.uploadImage(arrayBuffer, {
            originalName: imageFile.name,
            contentType: imageFile.type,
            size: imageFile.size,
            category: 'blog',
          });
          featuredImage = uploadResult.url;
        } catch (uploadError) {
          return c.json(
            {
              error: uploadError instanceof Error ? uploadError.message : 'Image upload failed',
            },
            400
          );
        }
      }
    } else {
      // Handle JSON body
      const body = await c.req.json();
      const parseResult = createBlogPostSchema.safeParse(body);

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

    // Generate slug from title
    const slug = generateSlug(data.title_en) + '-' + Date.now();

    // Insert blog post
    const postId = await db.insert('blog_posts', {
      title_en: data.title_en,
      title_ar: data.title_ar || null,
      title_es: data.title_es || null,
      title_pt: data.title_pt || null,
      content_en: data.content_en,
      content_ar: data.content_ar || null,
      content_es: data.content_es || null,
      content_pt: data.content_pt || null,
      excerpt_en: data.excerpt_en || null,
      excerpt_ar: data.excerpt_ar || null,
      excerpt_es: data.excerpt_es || null,
      excerpt_pt: data.excerpt_pt || null,
      slug,
      featured_image: featuredImage,
      status: data.status || 'draft',
      language: data.language || 'en',
    });

    if (!postId) {
      return c.json({ error: 'Failed to create post' }, 500);
    }

    // Fetch the created post
    const newPost = await db.queryFirst<BlogPostRecord>(
      'SELECT * FROM blog_posts WHERE id = ?',
      [postId]
    );

    return c.json(newPost, 201);
  } catch (error) {
    return c.json({ error: 'Server error' }, 500);
  }
});

/**
 * PUT /api/blog/admin/:id
 * Update blog post (protected)
 */
blogRoutes.put(
  '/admin/:id',
  authenticateToken,
  zValidator('param', postIdSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid post ID' }, 400);
    }
  }),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const contentType = c.req.header('Content-Type') || '';
      const db = createDatabaseService(c.env);

      // Check if post exists
      const existing = await db.queryFirst<BlogPostRecord>(
        'SELECT * FROM blog_posts WHERE id = ?',
        [id]
      );

      if (!existing) {
        return c.json({ error: 'Post not found' }, 404);
      }

      let data: z.infer<typeof updateBlogPostSchema>;
      let featuredImage: string | null = existing.featured_image;

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
        const parseResult = updateBlogPostSchema.safeParse({
          title_en: formFields.title_en,
          title_ar: formFields.title_ar,
          title_es: formFields.title_es,
          title_pt: formFields.title_pt,
          content_en: formFields.content_en,
          content_ar: formFields.content_ar,
          content_es: formFields.content_es,
          content_pt: formFields.content_pt,
          excerpt_en: formFields.excerpt_en,
          excerpt_ar: formFields.excerpt_ar,
          excerpt_es: formFields.excerpt_es,
          excerpt_pt: formFields.excerpt_pt,
          status: formFields.status,
          language: formFields.language,
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
        const imageFile = formData.get('featured_image');
        if (imageFile && imageFile instanceof File && imageFile.size > 0) {
          const storage = createStorageService(c.env);
          const arrayBuffer = await imageFile.arrayBuffer();

          try {
            const uploadResult = await storage.uploadImage(arrayBuffer, {
              originalName: imageFile.name,
              contentType: imageFile.type,
              size: imageFile.size,
              category: 'blog',
            });
            featuredImage = uploadResult.url;
          } catch (uploadError) {
            return c.json(
              {
                error: uploadError instanceof Error ? uploadError.message : 'Image upload failed',
              },
              400
            );
          }
        }
      } else {
        // Handle JSON body
        const body = await c.req.json();
        const parseResult = updateBlogPostSchema.safeParse(body);

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
        featured_image: featuredImage,
        updated_at: new Date().toISOString(),
      };

      if (data.title_en !== undefined) updateData.title_en = data.title_en;
      if (data.title_ar !== undefined) updateData.title_ar = data.title_ar || null;
      if (data.title_es !== undefined) updateData.title_es = data.title_es || null;
      if (data.title_pt !== undefined) updateData.title_pt = data.title_pt || null;
      if (data.content_en !== undefined) updateData.content_en = data.content_en;
      if (data.content_ar !== undefined) updateData.content_ar = data.content_ar || null;
      if (data.content_es !== undefined) updateData.content_es = data.content_es || null;
      if (data.content_pt !== undefined) updateData.content_pt = data.content_pt || null;
      if (data.excerpt_en !== undefined) updateData.excerpt_en = data.excerpt_en || null;
      if (data.excerpt_ar !== undefined) updateData.excerpt_ar = data.excerpt_ar || null;
      if (data.excerpt_es !== undefined) updateData.excerpt_es = data.excerpt_es || null;
      if (data.excerpt_pt !== undefined) updateData.excerpt_pt = data.excerpt_pt || null;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.language !== undefined) updateData.language = data.language;

      // Update the post
      await db.update('blog_posts', updateData, 'id = ?', [id]);

      // Fetch the updated post
      const updatedPost = await db.queryFirst<BlogPostRecord>(
        'SELECT * FROM blog_posts WHERE id = ?',
        [id]
      );

      return c.json(updatedPost);
    } catch (error) {
      return c.json({ error: 'Server error' }, 500);
    }
  }
);

/**
 * DELETE /api/blog/admin/:id
 * Delete blog post (protected)
 */
blogRoutes.delete(
  '/admin/:id',
  authenticateToken,
  zValidator('param', postIdSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid post ID' }, 400);
    }
  }),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const db = createDatabaseService(c.env);

      const changes = await db.delete('blog_posts', 'id = ?', [id]);

      if (changes === 0) {
        return c.json({ error: 'Post not found' }, 404);
      }

      return c.json({ message: 'Post deleted successfully' });
    } catch (error) {
      return c.json({ error: 'Server error' }, 500);
    }
  }
);

/**
 * GET /api/blog/stats
 * Get blog statistics (protected)
 */
blogRoutes.get('/stats', authenticateToken, async (c) => {
  try {
    const db = createDatabaseService(c.env);

    // Execute all stats queries in parallel
    const [total, today, thisWeek, thisMonth, byStatus, byLanguage] = await Promise.all([
      // Total posts
      db.queryFirst<{ count: number }>('SELECT COUNT(*) as count FROM blog_posts'),

      // Posts created today
      db.queryFirst<{ count: number }>(
        "SELECT COUNT(*) as count FROM blog_posts WHERE DATE(created_at) = DATE('now')"
      ),

      // Posts this week
      db.queryFirst<{ count: number }>(
        "SELECT COUNT(*) as count FROM blog_posts WHERE created_at >= datetime('now', '-7 days')"
      ),

      // Posts this month
      db.queryFirst<{ count: number }>(
        "SELECT COUNT(*) as count FROM blog_posts WHERE created_at >= datetime('now', '-30 days')"
      ),

      // Posts by status
      db.query<{ status: string; count: number }>(
        'SELECT status, COUNT(*) as count FROM blog_posts GROUP BY status'
      ),

      // Posts by language
      db.query<{ language: string; count: number }>(
        'SELECT language, COUNT(*) as count FROM blog_posts GROUP BY language'
      ),
    ]);

    return c.json({
      success: true,
      stats: {
        total: total?.count || 0,
        today: today?.count || 0,
        thisWeek: thisWeek?.count || 0,
        thisMonth: thisMonth?.count || 0,
        byStatus,
        byLanguage,
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
 * GET /api/blog
 * Get all published blog posts with pagination (public)
 */
blogRoutes.get(
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

      // Get total count of published posts
      const countResult = await db.queryFirst<{ total: number }>(
        'SELECT COUNT(*) as total FROM blog_posts WHERE status = ?',
        ['published']
      );
      const total = countResult?.total || 0;

      // Get paginated posts
      const posts = await db.query<BlogPostRecord>(
        'SELECT * FROM blog_posts WHERE status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
        ['published', safeLimit, offset]
      );

      // Localize each post based on requested language
      const localizedPosts = posts.map((post) => localizePost(post, lang));

      return c.json({
        data: localizedPosts,
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
 * GET /api/blog/:slug
 * Get single blog post by slug (public) - MUST come after admin routes
 */
blogRoutes.get(
  '/:slug',
  zValidator('param', postSlugSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid slug' }, 400);
    }
  }),
  async (c) => {
    try {
      const { slug } = c.req.valid('param');
      const lang = c.req.query('lang') || 'en';
      const db = createDatabaseService(c.env);

      const post = await db.queryFirst<BlogPostRecord>(
        'SELECT * FROM blog_posts WHERE slug = ?',
        [slug]
      );

      if (!post) {
        return c.json({ error: 'Post not found' }, 404);
      }

      // Localize the post based on requested language
      return c.json(localizePost(post, lang));
    } catch (error) {
      return c.json({ error: 'Server error' }, 500);
    }
  }
);

export { blogRoutes };
export default blogRoutes;
