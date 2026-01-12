/**
 * Storage Service Abstraction Layer
 *
 * Provides a unified interface for file storage that works with:
 * - Local filesystem (development)
 * - AWS S3 (production)
 *
 * This abstraction allows seamless switching between storage backends
 * without changing application code.
 *
 * AWS Best Practices:
 * - Uses AWS SDK v3 (modular, smaller bundles)
 * - Supports presigned URLs for secure uploads
 * - Integrates with CloudFront for CDN delivery
 * - Handles multipart uploads for large files
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env.js';
import { uploadLogger } from '../config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Storage interface for type safety
export interface StorageFile {
  key: string;           // Unique identifier/path
  url: string;           // Public URL to access the file
  size: number;
  contentType: string;
  etag?: string;
}

export interface UploadOptions {
  contentType: string;
  metadata?: Record<string, string>;
  cacheControl?: string;
  acl?: 'private' | 'public-read';
}

export interface StorageProvider {
  upload(key: string, buffer: Buffer, options: UploadOptions): Promise<StorageFile>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  getUrl(key: string): string;
  getSignedUploadUrl?(key: string, contentType: string, expiresIn?: number): Promise<string>;
}

// ============================================
// S3 Storage Provider (Production)
// ============================================

class S3StorageProvider implements StorageProvider {
  private client: S3Client;
  private bucket: string;
  private cdnUrl?: string;

  constructor() {
    if (!env.S3_BUCKET_NAME) {
      throw new Error('S3_BUCKET_NAME is required for S3 storage');
    }

    this.bucket = env.S3_BUCKET_NAME;
    this.cdnUrl = env.CLOUDFRONT_URL;

    this.client = new S3Client({
      region: env.AWS_REGION,
      credentials: env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: env.AWS_ACCESS_KEY_ID,
            secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
          }
        : undefined, // Use IAM role if no explicit credentials (EC2/ECS)
    });
  }

  async upload(key: string, buffer: Buffer, options: UploadOptions): Promise<StorageFile> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: options.contentType,
      CacheControl: options.cacheControl || 'public, max-age=31536000, immutable',
      Metadata: options.metadata,
      ACL: options.acl || 'public-read',
    });

    const result = await this.client.send(command);

    uploadLogger.success(key, buffer.length, options.contentType);

    return {
      key,
      url: this.getUrl(key),
      size: buffer.length,
      contentType: options.contentType,
      etag: result.ETag,
    };
  }

  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
    uploadLogger.deleted(key);
  }

  async exists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await this.client.send(command);
      return true;
    } catch {
      return false;
    }
  }

  getUrl(key: string): string {
    // Use CloudFront URL if available, otherwise S3 URL
    if (this.cdnUrl) {
      return `${this.cdnUrl}/${key}`;
    }
    return `https://${this.bucket}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
  }

  async getSignedUploadUrl(key: string, contentType: string, expiresIn = 3600): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    return getSignedUrl(this.client, command, { expiresIn });
  }
}

// ============================================
// Local Storage Provider (Development)
// ============================================

class LocalStorageProvider implements StorageProvider {
  private basePath: string;
  private baseUrl: string;

  constructor() {
    this.basePath = path.join(__dirname, '../../uploads');
    this.baseUrl = '/uploads';

    // Ensure directories exist
    const dirs = [
      this.basePath,
      path.join(this.basePath, 'images'),
      path.join(this.basePath, 'images/thumbnails'),
      path.join(this.basePath, 'blog'),
      path.join(this.basePath, 'testimonials'),
    ];

    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  async upload(key: string, buffer: Buffer, options: UploadOptions): Promise<StorageFile> {
    const filePath = path.join(this.basePath, key);
    const dir = path.dirname(filePath);

    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write file
    fs.writeFileSync(filePath, buffer);

    uploadLogger.success(key, buffer.length, options.contentType);

    return {
      key,
      url: this.getUrl(key),
      size: buffer.length,
      contentType: options.contentType,
    };
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(this.basePath, key);

    // Security: prevent directory traversal
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(path.resolve(this.basePath))) {
      throw new Error('Invalid file path');
    }

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      uploadLogger.deleted(key);
    }
  }

  async exists(key: string): Promise<boolean> {
    const filePath = path.join(this.basePath, key);
    return fs.existsSync(filePath);
  }

  getUrl(key: string): string {
    return `${this.baseUrl}/${key}`;
  }
}

// ============================================
// Storage Factory
// ============================================

let storageInstance: StorageProvider | null = null;

export function getStorage(): StorageProvider {
  if (!storageInstance) {
    if (env.STORAGE_TYPE === 's3') {
      storageInstance = new S3StorageProvider();
    } else {
      storageInstance = new LocalStorageProvider();
    }
  }
  return storageInstance;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Generate a unique, safe filename
 */
export function generateFileKey(originalName: string, folder = 'images'): string {
  const ext = path.extname(originalName).toLowerCase();
  const baseName = path.basename(originalName, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);

  const uniqueId = uuidv4().substring(0, 8);
  const timestamp = Date.now();

  return `${folder}/${baseName}-${timestamp}-${uniqueId}${ext}`;
}

/**
 * Get content type from file extension
 */
export function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const types: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.avif': 'image/avif',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
  };
  return types[ext] || 'application/octet-stream';
}

/**
 * Validate file is an allowed image type
 */
export function isValidImageType(mimetype: string): boolean {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/avif',
  ];
  return allowedTypes.includes(mimetype);
}

// Export storage instance
export const storage = getStorage();

export default storage;
