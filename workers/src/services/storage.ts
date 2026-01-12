/**
 * R2 Storage Service for Cloudflare Workers
 * Handles file upload, retrieval, and deletion operations using Cloudflare R2
 *
 * R2 Binding: UPLOADS
 * Configuration: wrangler.toml [[r2_buckets]]
 *
 * Key patterns:
 * - Zero egress fees compared to S3
 * - S3-compatible API if needed
 * - Direct binding for best performance
 *
 * Usage in route handlers:
 * ```typescript
 * import { createStorageService, buildFileResponse } from '../services/storage';
 *
 * // Upload: equivalent to UPLOADS.put(key, data, options)
 * const storage = createStorageService(c.env);
 * const file = await storage.upload(data, { originalName: 'photo.jpg' });
 *
 * // Get: equivalent to UPLOADS.get(key)
 * const object = await storage.get('images/photo.jpg');
 * if (object) return buildFileResponse(object);
 *
 * // Delete: equivalent to UPLOADS.delete(key)
 * await storage.delete('images/photo.jpg');
 * ```
 *
 * Direct R2 binding usage (for reference):
 * - Upload:  await c.env.UPLOADS.put(key, data, { httpMetadata: { contentType } });
 * - Get:     const obj = await c.env.UPLOADS.get(key);
 * - Delete:  await c.env.UPLOADS.delete(key);
 */

import type { Env } from '../types/bindings';

/**
 * Result interface for storage operations
 */
export interface StorageResult {
  success: boolean;
  message: string;
  key?: string;
  url?: string;
}

/**
 * Uploaded file metadata interface
 */
export interface UploadedFile {
  key: string;
  size: number;
  contentType: string;
  originalName?: string;
  uploadedAt: string;
  etag?: string;
  url: string;
}

/**
 * File metadata stored in R2
 */
export interface FileMetadata {
  originalName?: string;
  uploadedBy?: string;
  uploadedAt: string;
  category?: string;
  description?: string;
}

/**
 * Upload options configuration
 */
export interface UploadOptions {
  contentType?: string;
  originalName?: string;
  category?: string;
  description?: string;
  uploadedBy?: string;
  customKey?: string;
}

/**
 * List options configuration
 */
export interface ListOptions {
  prefix?: string;
  limit?: number;
  cursor?: string;
  delimiter?: string;
}

/**
 * List result interface
 */
export interface ListResult {
  objects: UploadedFile[];
  truncated: boolean;
  cursor?: string;
}

/**
 * Allowed MIME types for file uploads
 */
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const ALLOWED_RESUME_TYPES = [
  ...ALLOWED_DOCUMENT_TYPES,
  'text/plain',
];

/**
 * Maximum file sizes in bytes
 */
const MAX_FILE_SIZES = {
  image: 10 * 1024 * 1024, // 10MB
  document: 20 * 1024 * 1024, // 20MB
  resume: 5 * 1024 * 1024, // 5MB
  default: 10 * 1024 * 1024, // 10MB
};

/**
 * Generate a unique file key
 */
function generateFileKey(originalName: string, prefix?: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = getFileExtension(originalName);
  const baseName = getBaseName(originalName)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);

  const key = `${baseName}-${timestamp}-${randomString}${extension}`;
  return prefix ? `${prefix}/${key}` : key;
}

/**
 * Get file extension including the dot
 */
function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot === -1 ? '' : filename.substring(lastDot).toLowerCase();
}

/**
 * Get base filename without extension
 */
function getBaseName(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot === -1 ? filename : filename.substring(0, lastDot);
}

/**
 * Validate file type against allowed types
 */
function validateFileType(
  contentType: string,
  allowedTypes: string[]
): boolean {
  return allowedTypes.includes(contentType.toLowerCase());
}

/**
 * Validate file size against maximum limit
 */
function validateFileSize(size: number, maxSize: number): boolean {
  return size <= maxSize;
}

/**
 * Get content type from file extension if not provided
 */
function inferContentType(filename: string): string {
  const extension = getFileExtension(filename).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.txt': 'text/plain',
  };
  return mimeTypes[extension] || 'application/octet-stream';
}

/**
 * Build public URL for an uploaded file
 */
function buildFileUrl(key: string, bucketUrl?: string): string {
  // If a custom bucket URL is provided, use it
  if (bucketUrl) {
    return `${bucketUrl}/${key}`;
  }
  // Default to relative path for serving through the API
  return `/api/uploads/${key}`;
}

/**
 * Storage Service class for Cloudflare Workers
 * Uses R2 bucket binding for file operations
 */
export class StorageService {
  private bucket: R2Bucket;
  private bucketUrl?: string;

  constructor(env: Env, bucketUrl?: string) {
    this.bucket = env.UPLOADS;
    this.bucketUrl = bucketUrl;
  }

  /**
   * Upload a file to R2 storage
   */
  async upload(
    data: ArrayBuffer | ReadableStream | Blob,
    options: UploadOptions
  ): Promise<UploadedFile> {
    const originalName = options.originalName || 'unnamed-file';
    const contentType = options.contentType || inferContentType(originalName);
    const key = options.customKey || generateFileKey(originalName, options.category);
    const uploadedAt = new Date().toISOString();

    // Build custom metadata
    const customMetadata: FileMetadata = {
      originalName,
      uploadedAt,
      ...(options.uploadedBy && { uploadedBy: options.uploadedBy }),
      ...(options.category && { category: options.category }),
      ...(options.description && { description: options.description }),
    };

    // Upload to R2
    const result = await this.bucket.put(key, data, {
      httpMetadata: {
        contentType,
        cacheControl: 'public, max-age=31536000', // 1 year cache
      },
      customMetadata: customMetadata as Record<string, string>,
    });

    return {
      key,
      size: result?.size || 0,
      contentType,
      originalName,
      uploadedAt,
      etag: result?.etag,
      url: buildFileUrl(key, this.bucketUrl),
    };
  }

  /**
   * Upload an image with validation
   */
  async uploadImage(
    data: ArrayBuffer | ReadableStream | Blob,
    options: UploadOptions & { size?: number }
  ): Promise<UploadedFile> {
    const contentType = options.contentType || inferContentType(options.originalName || '');

    // Validate image type
    if (!validateFileType(contentType, ALLOWED_IMAGE_TYPES)) {
      throw new Error(
        `Invalid file type: ${contentType}. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`
      );
    }

    // Validate size if provided
    if (options.size && !validateFileSize(options.size, MAX_FILE_SIZES.image)) {
      throw new Error(
        `File too large: ${options.size} bytes. Maximum: ${MAX_FILE_SIZES.image} bytes`
      );
    }

    return this.upload(data, {
      ...options,
      category: options.category || 'images',
    });
  }

  /**
   * Upload a resume/CV with validation
   */
  async uploadResume(
    data: ArrayBuffer | ReadableStream | Blob,
    options: UploadOptions & { size?: number }
  ): Promise<UploadedFile> {
    const contentType = options.contentType || inferContentType(options.originalName || '');

    // Validate resume type
    if (!validateFileType(contentType, ALLOWED_RESUME_TYPES)) {
      throw new Error(
        `Invalid file type: ${contentType}. Allowed: ${ALLOWED_RESUME_TYPES.join(', ')}`
      );
    }

    // Validate size if provided
    if (options.size && !validateFileSize(options.size, MAX_FILE_SIZES.resume)) {
      throw new Error(
        `File too large: ${options.size} bytes. Maximum: ${MAX_FILE_SIZES.resume} bytes`
      );
    }

    return this.upload(data, {
      ...options,
      category: options.category || 'resumes',
    });
  }

  /**
   * Get a file from R2 storage
   */
  async get(key: string): Promise<R2ObjectBody | null> {
    const object = await this.bucket.get(key);
    return object;
  }

  /**
   * Get file with metadata
   */
  async getWithMetadata(key: string): Promise<{
    body: ReadableStream | null;
    metadata: UploadedFile | null;
  }> {
    const object = await this.bucket.get(key);

    if (!object) {
      return { body: null, metadata: null };
    }

    const customMetadata = object.customMetadata || {};

    return {
      body: object.body,
      metadata: {
        key: object.key,
        size: object.size,
        contentType: object.httpMetadata?.contentType || 'application/octet-stream',
        originalName: customMetadata.originalName,
        uploadedAt: customMetadata.uploadedAt || object.uploaded.toISOString(),
        etag: object.etag,
        url: buildFileUrl(object.key, this.bucketUrl),
      },
    };
  }

  /**
   * Check if a file exists in R2 storage
   */
  async exists(key: string): Promise<boolean> {
    const head = await this.bucket.head(key);
    return head !== null;
  }

  /**
   * Get file metadata without downloading the body
   */
  async head(key: string): Promise<UploadedFile | null> {
    const object = await this.bucket.head(key);

    if (!object) {
      return null;
    }

    const customMetadata = object.customMetadata || {};

    return {
      key: object.key,
      size: object.size,
      contentType: object.httpMetadata?.contentType || 'application/octet-stream',
      originalName: customMetadata.originalName,
      uploadedAt: customMetadata.uploadedAt || object.uploaded.toISOString(),
      etag: object.etag,
      url: buildFileUrl(object.key, this.bucketUrl),
    };
  }

  /**
   * Delete a file from R2 storage
   */
  async delete(key: string): Promise<StorageResult> {
    await this.bucket.delete(key);

    return {
      success: true,
      message: 'File deleted successfully',
      key,
    };
  }

  /**
   * Delete multiple files from R2 storage
   */
  async deleteMany(keys: string[]): Promise<StorageResult> {
    if (keys.length === 0) {
      return {
        success: true,
        message: 'No files to delete',
      };
    }

    await this.bucket.delete(keys);

    return {
      success: true,
      message: `Deleted ${keys.length} files successfully`,
    };
  }

  /**
   * List files in R2 storage
   */
  async list(options: ListOptions = {}): Promise<ListResult> {
    const listOptions: R2ListOptions = {
      limit: options.limit || 100,
      ...(options.prefix && { prefix: options.prefix }),
      ...(options.cursor && { cursor: options.cursor }),
      ...(options.delimiter && { delimiter: options.delimiter }),
    };

    const result = await this.bucket.list(listOptions);

    const objects: UploadedFile[] = result.objects.map((obj) => {
      const customMetadata = obj.customMetadata || {};
      return {
        key: obj.key,
        size: obj.size,
        contentType: obj.httpMetadata?.contentType || 'application/octet-stream',
        originalName: customMetadata.originalName,
        uploadedAt: customMetadata.uploadedAt || obj.uploaded.toISOString(),
        etag: obj.etag,
        url: buildFileUrl(obj.key, this.bucketUrl),
      };
    });

    return {
      objects,
      truncated: result.truncated,
      cursor: result.truncated ? result.cursor : undefined,
    };
  }

  /**
   * List images in storage
   */
  async listImages(options: Omit<ListOptions, 'prefix'> = {}): Promise<ListResult> {
    return this.list({ ...options, prefix: 'images/' });
  }

  /**
   * List resumes in storage
   */
  async listResumes(options: Omit<ListOptions, 'prefix'> = {}): Promise<ListResult> {
    return this.list({ ...options, prefix: 'resumes/' });
  }

  /**
   * Copy a file within R2 storage
   */
  async copy(sourceKey: string, destinationKey: string): Promise<UploadedFile> {
    const source = await this.bucket.get(sourceKey);

    if (!source) {
      throw new Error(`Source file not found: ${sourceKey}`);
    }

    const customMetadata = source.customMetadata || {};

    const result = await this.bucket.put(destinationKey, source.body, {
      httpMetadata: source.httpMetadata,
      customMetadata: {
        ...customMetadata,
        copiedFrom: sourceKey,
        copiedAt: new Date().toISOString(),
      },
    });

    return {
      key: destinationKey,
      size: result?.size || source.size,
      contentType: source.httpMetadata?.contentType || 'application/octet-stream',
      originalName: customMetadata.originalName,
      uploadedAt: new Date().toISOString(),
      etag: result?.etag,
      url: buildFileUrl(destinationKey, this.bucketUrl),
    };
  }

  /**
   * Create a presigned URL for direct browser uploads (if needed)
   * Note: This requires additional R2 configuration
   */
  getUploadUrl(key: string): string {
    // For now, return the API upload endpoint
    // Presigned URLs require S3-compatible API setup
    return `/api/uploads/${key}`;
  }
}

/**
 * Create storage service instance from environment
 * Use this in route handlers: const storage = createStorageService(c.env)
 */
export function createStorageService(env: Env, bucketUrl?: string): StorageService {
  return new StorageService(env, bucketUrl);
}

/**
 * Utility function to build a Response from an R2 object
 * Use this in route handlers for serving files
 */
export function buildFileResponse(
  object: R2ObjectBody,
  options: {
    disposition?: 'inline' | 'attachment';
    filename?: string;
    cacheControl?: string;
  } = {}
): Response {
  const headers = new Headers();

  // Set content type
  if (object.httpMetadata?.contentType) {
    headers.set('Content-Type', object.httpMetadata.contentType);
  }

  // Set content length
  headers.set('Content-Length', object.size.toString());

  // Set etag for caching
  if (object.etag) {
    headers.set('ETag', object.etag);
  }

  // Set cache control
  headers.set(
    'Cache-Control',
    options.cacheControl || object.httpMetadata?.cacheControl || 'public, max-age=31536000'
  );

  // Set content disposition for downloads
  if (options.disposition) {
    const filename = options.filename || object.customMetadata?.originalName || object.key;
    headers.set(
      'Content-Disposition',
      `${options.disposition}; filename="${filename}"`
    );
  }

  return new Response(object.body, { headers });
}

/**
 * Export constants for use in validation
 */
export const STORAGE_CONFIG = {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  ALLOWED_RESUME_TYPES,
  MAX_FILE_SIZES,
};
