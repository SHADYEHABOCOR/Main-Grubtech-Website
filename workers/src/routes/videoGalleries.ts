/**
 * Video Galleries Management Routes for Cloudflare Workers
 *
 * Provides endpoints for managing video gallery content including public listing,
 * admin CRUD operations, and pagination.
 *
 * Endpoints:
 * - GET /admin/:id    - Get single video by ID (protected)
 * - GET /admin        - Get all videos with pagination (protected)
 * - POST /admin/create - Create new video (protected)
 * - PUT /admin/:id    - Update video (protected)
 * - DELETE /admin/:id - Delete video (protected)
 * - GET /             - Get active videos (public)
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env, Variables } from '../types/bindings';
import { createDatabaseService } from '../db';
import { authenticateToken } from '../middleware/auth';

// Video gallery record type from database
interface VideoGalleryRecord {
  id: number;
  title_en: string;
  title_ar: string | null;
  title_es: string | null;
  title_pt: string | null;
  description_en: string | null;
  description_ar: string | null;
  description_es: string | null;
  description_pt: string | null;
  video_url: string;
  thumbnail_url: string | null;
  logo_url: string | null;
  duration: string | null;
  display_order: number;
  is_active: number;
  created_at: string;
  updated_at: string | null;
}

// Localized video gallery response for public API
interface LocalizedVideoGallery {
  id: number;
  title: string;
  description: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  logoUrl: string | null;
  duration: string | null;
  displayOrder: number;
}

// Zod schemas for validation

/**
 * Schema for creating a new video
 */
const createVideoSchema = z.object({
  title_en: z.string().min(1, 'English title is required').max(500, 'Title is too long'),
  title_ar: z.string().max(500, 'Title is too long').optional().nullable(),
  title_es: z.string().max(500, 'Title is too long').optional().nullable(),
  title_pt: z.string().max(500, 'Title is too long').optional().nullable(),
  video_url: z.string().min(1, 'Video URL is required').url('Invalid video URL'),
  description_en: z.string().optional().nullable(),
  description_ar: z.string().optional().nullable(),
  description_es: z.string().optional().nullable(),
  description_pt: z.string().optional().nullable(),
  thumbnail_url: z.string().url('Invalid thumbnail URL').optional().nullable(),
  logo_url: z.string().url('Invalid logo URL').optional().nullable(),
  duration: z.string().max(50, 'Duration is too long').optional().nullable(),
  display_order: z.union([
    z.number().int().min(0),
    z.string().regex(/^\d+$/).transform(Number)
  ]).optional().default(0),
  is_active: z.union([
    z.boolean(),
    z.number().min(0).max(1),
    z.string().regex(/^[01]$/).transform((v) => parseInt(v, 10))
  ]).optional().default(1),
});

/**
 * Schema for updating a video
 */
const updateVideoSchema = createVideoSchema.partial();

/**
 * Schema for pagination query parameters
 */
const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  lang: z.string().max(10).optional(),
});

/**
 * Schema for video ID parameter
 */
const videoIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid video ID'),
});

// Helper function to localize video content
function localizeVideo(video: VideoGalleryRecord, lang: string): LocalizedVideoGallery {
  let title = video.title_en;
  let description = video.description_en;

  // Use language-specific content if available
  if (lang === 'ar' && video.title_ar) {
    title = video.title_ar;
    description = video.description_ar;
  } else if (lang === 'es' && video.title_es) {
    title = video.title_es;
    description = video.description_es;
  } else if (lang === 'pt' && video.title_pt) {
    title = video.title_pt;
    description = video.description_pt;
  }

  return {
    id: video.id,
    title,
    description,
    videoUrl: video.video_url,
    thumbnailUrl: video.thumbnail_url,
    logoUrl: video.logo_url,
    duration: video.duration,
    displayOrder: video.display_order,
  };
}

// Create video galleries router
const videoGalleriesRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// ============================================================================
// Admin Routes (Protected) - MUST come before public routes
// ============================================================================

/**
 * GET /api/video-galleries/admin/:id
 * Get single video by ID (protected)
 */
videoGalleriesRoutes.get(
  '/admin/:id',
  authenticateToken,
  zValidator('param', videoIdSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid video ID' }, 400);
    }
  }),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const db = createDatabaseService(c.env);

      const video = await db.queryFirst<VideoGalleryRecord>(
        'SELECT * FROM video_galleries WHERE id = ?',
        [id]
      );

      if (!video) {
        return c.json({ error: 'Video not found' }, 404);
      }

      return c.json(video);
    } catch (error) {
      return c.json({ error: 'Server error' }, 500);
    }
  }
);

/**
 * GET /api/video-galleries/admin
 * Get all videos for admin with pagination (protected)
 */
videoGalleriesRoutes.get(
  '/admin',
  authenticateToken,
  zValidator('query', paginationSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid pagination parameters' }, 400);
    }
  }),
  async (c) => {
    try {
      const { page = 1, limit = 10 } = c.req.valid('query');
      const db = createDatabaseService(c.env);

      // Ensure reasonable limits
      const safeLimit = Math.min(Math.max(1, limit), 100);
      const safePage = Math.max(1, page);
      const offset = (safePage - 1) * safeLimit;

      // Get total count
      const countResult = await db.queryFirst<{ total: number }>(
        'SELECT COUNT(*) as total FROM video_galleries'
      );
      const total = countResult?.total || 0;

      // Get paginated videos
      const videos = await db.query<VideoGalleryRecord>(
        'SELECT * FROM video_galleries ORDER BY display_order ASC LIMIT ? OFFSET ?',
        [safeLimit, offset]
      );

      return c.json({
        data: videos,
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
 * POST /api/video-galleries/admin/create
 * Create new video (protected)
 */
videoGalleriesRoutes.post('/admin/create', authenticateToken, async (c) => {
  try {
    const db = createDatabaseService(c.env);
    const body = await c.req.json();

    // Validate request body
    const parseResult = createVideoSchema.safeParse(body);

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

    // Check required fields
    if (!data.title_en || !data.video_url) {
      return c.json({ error: 'Title (English) and video URL are required' }, 400);
    }

    // Insert video
    const videoId = await db.insert('video_galleries', {
      title_en: data.title_en,
      title_ar: data.title_ar || null,
      title_es: data.title_es || null,
      title_pt: data.title_pt || null,
      video_url: data.video_url,
      description_en: data.description_en || null,
      description_ar: data.description_ar || null,
      description_es: data.description_es || null,
      description_pt: data.description_pt || null,
      thumbnail_url: data.thumbnail_url || null,
      logo_url: data.logo_url || null,
      duration: data.duration || null,
      display_order: data.display_order || 0,
      is_active: data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1,
    });

    if (!videoId) {
      return c.json({ error: 'Failed to create video' }, 500);
    }

    // Fetch the created video
    const newVideo = await db.queryFirst<VideoGalleryRecord>(
      'SELECT * FROM video_galleries WHERE id = ?',
      [videoId]
    );

    return c.json(newVideo, 201);
  } catch (error) {
    return c.json({ error: 'Server error' }, 500);
  }
});

/**
 * PUT /api/video-galleries/admin/:id
 * Update video (protected)
 */
videoGalleriesRoutes.put(
  '/admin/:id',
  authenticateToken,
  zValidator('param', videoIdSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid video ID' }, 400);
    }
  }),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const db = createDatabaseService(c.env);

      // Check if video exists
      const existing = await db.queryFirst<VideoGalleryRecord>(
        'SELECT * FROM video_galleries WHERE id = ?',
        [id]
      );

      if (!existing) {
        return c.json({ error: 'Video not found' }, 404);
      }

      const body = await c.req.json();
      const parseResult = updateVideoSchema.safeParse(body);

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

      // Build update data
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (data.title_en !== undefined) updateData.title_en = data.title_en;
      if (data.title_ar !== undefined) updateData.title_ar = data.title_ar || null;
      if (data.title_es !== undefined) updateData.title_es = data.title_es || null;
      if (data.title_pt !== undefined) updateData.title_pt = data.title_pt || null;
      if (data.video_url !== undefined) updateData.video_url = data.video_url;
      if (data.description_en !== undefined) updateData.description_en = data.description_en || null;
      if (data.description_ar !== undefined) updateData.description_ar = data.description_ar || null;
      if (data.description_es !== undefined) updateData.description_es = data.description_es || null;
      if (data.description_pt !== undefined) updateData.description_pt = data.description_pt || null;
      if (data.thumbnail_url !== undefined) updateData.thumbnail_url = data.thumbnail_url || null;
      if (data.logo_url !== undefined) updateData.logo_url = data.logo_url || null;
      if (data.duration !== undefined) updateData.duration = data.duration || null;
      if (data.display_order !== undefined) updateData.display_order = data.display_order || 0;
      if (data.is_active !== undefined) updateData.is_active = data.is_active ? 1 : 0;

      // Update the video
      await db.update('video_galleries', updateData, 'id = ?', [id]);

      // Fetch the updated video
      const updatedVideo = await db.queryFirst<VideoGalleryRecord>(
        'SELECT * FROM video_galleries WHERE id = ?',
        [id]
      );

      return c.json(updatedVideo);
    } catch (error) {
      return c.json({ error: 'Server error' }, 500);
    }
  }
);

/**
 * DELETE /api/video-galleries/admin/:id
 * Delete video (protected)
 */
videoGalleriesRoutes.delete(
  '/admin/:id',
  authenticateToken,
  zValidator('param', videoIdSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid video ID' }, 400);
    }
  }),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const db = createDatabaseService(c.env);

      const changes = await db.delete('video_galleries', 'id = ?', [id]);

      if (changes === 0) {
        return c.json({ error: 'Video not found' }, 404);
      }

      return c.json({ message: 'Video deleted successfully' });
    } catch (error) {
      return c.json({ error: 'Server error' }, 500);
    }
  }
);

// ============================================================================
// Public Routes
// ============================================================================

/**
 * GET /api/video-galleries
 * Get all active videos (public)
 */
videoGalleriesRoutes.get(
  '/',
  zValidator('query', paginationSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid query parameters' }, 400);
    }
  }),
  async (c) => {
    try {
      const { lang = 'en' } = c.req.valid('query');
      const db = createDatabaseService(c.env);

      // Get all active videos ordered by display_order
      const videos = await db.query<VideoGalleryRecord>(
        'SELECT * FROM video_galleries WHERE is_active = 1 ORDER BY display_order ASC'
      );

      // Localize each video based on requested language
      const localizedVideos = videos.map((video) => localizeVideo(video, lang));

      return c.json(localizedVideos);
    } catch (error) {
      return c.json({ error: 'Server error' }, 500);
    }
  }
);

export { videoGalleriesRoutes };
export default videoGalleriesRoutes;
