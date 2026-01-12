/**
 * Uploads Management Routes for Cloudflare Workers
 *
 * Provides endpoints for file upload, retrieval, and deletion using Cloudflare R2.
 * All endpoints are protected and require authentication.
 *
 * Note: Sharp image processing is NOT available on Cloudflare Workers.
 * For image transformation, use Cloudflare Images binding or pre-process at build time.
 *
 * Endpoints:
 * - POST /image              - Upload single image (protected)
 * - POST /images             - Upload multiple images (protected)
 * - DELETE /image/:filename  - Delete image and all its variants (protected)
 * - GET /images              - List all uploaded images (protected)
 * - GET /:key                - Get/serve a file by key (public)
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env, Variables } from '../types/bindings';
import { authenticateToken } from '../middleware/auth';
import { createStorageService, buildFileResponse, type UploadedFile } from '../services/storage';

// Zod schemas for validation

/**
 * Schema for filename parameter
 */
const filenameSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
});

/**
 * Schema for key parameter (for file retrieval)
 */
const keySchema = z.object({
  key: z.string().min(1, 'Key is required'),
});

/**
 * Schema for list query parameters
 */
const listQuerySchema = z.object({
  prefix: z.string().optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  cursor: z.string().optional(),
});

/**
 * Allowed MIME types for image uploads
 */
const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

/**
 * Maximum file size for uploads (10MB)
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Generate unique filename for upload
 */
function generateFilename(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const lastDot = originalName.lastIndexOf('.');
  const extension = lastDot === -1 ? '' : originalName.substring(lastDot).toLowerCase();
  const baseName = (lastDot === -1 ? originalName : originalName.substring(0, lastDot))
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);

  return `${baseName}-${timestamp}-${randomString}${extension}`;
}

/**
 * Validate file type and size
 */
function validateFile(
  file: File,
  allowedTypes: string[],
  maxSize: number
): { valid: boolean; error?: string } {
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}. Allowed: ${allowedTypes.join(', ')}`,
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large: ${file.size} bytes. Maximum: ${maxSize} bytes (${maxSize / 1024 / 1024}MB)`,
    };
  }

  return { valid: true };
}

// Create uploads router
const uploadsRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// ============================================================================
// Protected Routes (Admin only)
// ============================================================================

/**
 * POST /api/uploads/image
 * Upload single image (protected)
 */
uploadsRoutes.post('/image', authenticateToken, async (c) => {
  try {
    const contentType = c.req.header('Content-Type') || '';

    if (!contentType.includes('multipart/form-data')) {
      return c.json(
        {
          success: false,
          error: 'Content-Type must be multipart/form-data',
        },
        400
      );
    }

    const formData = await c.req.formData();
    const imageFile = formData.get('image');

    if (!imageFile || !(imageFile instanceof File)) {
      return c.json(
        {
          success: false,
          error: 'No image file provided',
        },
        400
      );
    }

    // Validate file
    const validation = validateFile(imageFile, ALLOWED_IMAGE_MIMES, MAX_FILE_SIZE);
    if (!validation.valid) {
      return c.json(
        {
          success: false,
          error: validation.error,
        },
        400
      );
    }

    // Generate unique filename and upload
    const filename = generateFilename(imageFile.name);
    const storage = createStorageService(c.env);
    const arrayBuffer = await imageFile.arrayBuffer();

    const uploadResult = await storage.uploadImage(arrayBuffer, {
      originalName: imageFile.name,
      contentType: imageFile.type,
      size: imageFile.size,
      category: 'images',
      customKey: `images/${filename}`,
    });

    return c.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        filename,
        originalName: imageFile.name,
        mimeType: imageFile.type,
        size: imageFile.size,
        paths: {
          original: uploadResult.url,
          // Note: WebP conversion and responsive sizes would require
          // Cloudflare Images binding or pre-processing
        },
      },
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload image',
      },
      500
    );
  }
});

/**
 * POST /api/uploads/images
 * Upload multiple images (protected)
 */
uploadsRoutes.post('/images', authenticateToken, async (c) => {
  try {
    const contentType = c.req.header('Content-Type') || '';

    if (!contentType.includes('multipart/form-data')) {
      return c.json(
        {
          success: false,
          error: 'Content-Type must be multipart/form-data',
        },
        400
      );
    }

    const formData = await c.req.formData();
    const files: File[] = [];

    // Collect all image files from form data
    for (const [key, value] of formData.entries()) {
      if (key === 'images' && value instanceof File) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return c.json(
        {
          success: false,
          error: 'No image files provided',
        },
        400
      );
    }

    // Limit number of files
    if (files.length > 10) {
      return c.json(
        {
          success: false,
          error: 'Maximum 10 images allowed per upload',
        },
        400
      );
    }

    // Validate all files first
    for (const file of files) {
      const validation = validateFile(file, ALLOWED_IMAGE_MIMES, MAX_FILE_SIZE);
      if (!validation.valid) {
        return c.json(
          {
            success: false,
            error: `File "${file.name}": ${validation.error}`,
          },
          400
        );
      }
    }

    // Upload all files
    const storage = createStorageService(c.env);
    const results: Array<{
      filename: string;
      originalName: string;
      mimeType: string;
      size: number;
      paths: { original: string };
    }> = [];

    for (const file of files) {
      const filename = generateFilename(file.name);
      const arrayBuffer = await file.arrayBuffer();

      const uploadResult = await storage.uploadImage(arrayBuffer, {
        originalName: file.name,
        contentType: file.type,
        size: file.size,
        category: 'images',
        customKey: `images/${filename}`,
      });

      results.push({
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        paths: {
          original: uploadResult.url,
        },
      });
    }

    return c.json({
      success: true,
      message: `${results.length} images uploaded successfully`,
      data: results,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload images',
      },
      500
    );
  }
});

/**
 * DELETE /api/uploads/image/:filename
 * Delete image and all its variants (protected)
 */
uploadsRoutes.delete(
  '/image/:filename',
  authenticateToken,
  zValidator('param', filenameSchema, (result, c) => {
    if (!result.success) {
      return c.json({ success: false, error: 'Invalid filename' }, 400);
    }
  }),
  async (c) => {
    try {
      const { filename } = c.req.valid('param');

      // Security: prevent directory traversal
      if (filename.includes('..') || filename.includes('/')) {
        return c.json(
          {
            success: false,
            error: 'Invalid filename',
          },
          400
        );
      }

      const storage = createStorageService(c.env);

      // Remove extension to get base filename for finding variants
      const baseFilename = filename.replace(/\.(jpg|jpeg|png|webp|gif|svg)$/i, '');

      // List all files that start with the base filename
      const listResult = await storage.list({ prefix: 'images/' });
      const filesToDelete: string[] = [];

      for (const obj of listResult.objects) {
        // Extract the filename part from the key (remove 'images/' prefix)
        const keyFilename = obj.key.replace(/^images\//, '');
        const keyBase = keyFilename.replace(/\.(jpg|jpeg|png|webp|gif|svg)$/i, '');

        // Match files that start with the base filename (original + variants)
        if (keyBase === baseFilename || keyBase.startsWith(baseFilename + '-')) {
          filesToDelete.push(obj.key);
        }
      }

      // Also check thumbnails directory
      const thumbnailsResult = await storage.list({ prefix: 'images/thumbnails/' });
      for (const obj of thumbnailsResult.objects) {
        const keyFilename = obj.key.replace(/^images\/thumbnails\//, '');
        const keyBase = keyFilename.replace(/\.(jpg|jpeg|png|webp|gif|svg)$/i, '');

        if (keyBase === baseFilename || keyBase.startsWith(baseFilename + '-')) {
          filesToDelete.push(obj.key);
        }
      }

      if (filesToDelete.length === 0) {
        return c.json(
          {
            success: false,
            error: 'Image not found',
          },
          404
        );
      }

      // Delete all matching files
      await storage.deleteMany(filesToDelete);

      return c.json({
        success: true,
        message: 'Image and all variants deleted',
        deletedFiles: filesToDelete,
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to delete image',
        },
        500
      );
    }
  }
);

/**
 * GET /api/uploads/images
 * List all uploaded images (protected)
 */
uploadsRoutes.get(
  '/images',
  authenticateToken,
  zValidator('query', listQuerySchema, (result, c) => {
    if (!result.success) {
      return c.json({ success: false, error: 'Invalid query parameters' }, 400);
    }
  }),
  async (c) => {
    try {
      const { limit = 100, cursor } = c.req.valid('query');
      const storage = createStorageService(c.env);

      // Get images from storage
      const listResult = await storage.list({
        prefix: 'images/',
        limit: Math.min(limit, 1000),
        cursor,
      });

      // Group files by base filename
      const images: Record<
        string,
        {
          original?: string;
          webp?: string;
          sizes: string[];
          metadata?: Partial<UploadedFile>;
        }
      > = {};

      for (const obj of listResult.objects) {
        // Skip thumbnails directory in main listing
        if (obj.key.includes('/thumbnails/')) continue;

        // Extract filename from key (remove 'images/' prefix)
        const filename = obj.key.replace(/^images\//, '');

        // Match filename pattern: baseName-suffix.ext
        const match = filename.match(/^(.+?)(?:-(large|medium|small|thumbnail|thumb))?\.(\w+)$/);
        if (match) {
          const [, baseName, sizeSuffix, ext] = match;
          const key = baseName;

          if (!images[key]) {
            images[key] = { sizes: [], metadata: obj };
          }

          if (!sizeSuffix) {
            // Original size
            if (ext === 'webp') {
              images[key].webp = obj.url;
            } else {
              images[key].original = obj.url;
            }
          } else {
            images[key].sizes.push(obj.url);
          }
        }
      }

      return c.json({
        success: true,
        data: images,
        pagination: {
          truncated: listResult.truncated,
          cursor: listResult.cursor,
        },
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to list images',
        },
        500
      );
    }
  }
);

// ============================================================================
// Public Routes (File serving)
// ============================================================================

/**
 * GET /api/uploads/:key
 * Get/serve a file by key (public)
 * This allows serving uploaded files through the API
 */
uploadsRoutes.get('/:key{.+}', async (c) => {
  try {
    const key = c.req.param('key');

    // Security: prevent directory traversal
    if (key.includes('..')) {
      return c.json(
        {
          success: false,
          error: 'Invalid file path',
        },
        400
      );
    }

    const storage = createStorageService(c.env);
    const object = await storage.get(key);

    if (!object) {
      return c.json(
        {
          success: false,
          error: 'File not found',
        },
        404
      );
    }

    // Return the file with appropriate headers
    return buildFileResponse(object, {
      disposition: 'inline',
      cacheControl: 'public, max-age=31536000, immutable',
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve file',
      },
      500
    );
  }
});

export { uploadsRoutes };
export default uploadsRoutes;
