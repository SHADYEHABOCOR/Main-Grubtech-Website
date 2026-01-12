/**
 * Cloudflare Workers environment bindings type definitions
 *
 * These types define the shape of the environment object (c.env)
 * available in all Hono route handlers.
 */

export interface Env {
  // Cloudflare D1 Database
  DB: D1Database;

  // Cloudflare KV Namespace for caching and rate limiting
  CACHE: KVNamespace;

  // Cloudflare R2 Bucket for file uploads
  UPLOADS: R2Bucket;

  // Cloudflare Images binding for image transformation
  IMAGES?: ImagesBinding;

  // Environment variables (non-sensitive, from wrangler.toml [vars])
  ENVIRONMENT: string;
  ALLOWED_ORIGINS: string;
  LOG_LEVEL: string;
  RATE_LIMIT_WINDOW_MS: string;
  RATE_LIMIT_MAX_REQUESTS: string;

  // Secrets (via `wrangler secret put`)
  JWT_SECRET: string;
  EMAIL_API_KEY: string;
  ADMIN_EMAIL: string;
  SETUP_SECRET_TOKEN: string;
  SENTRY_DSN?: string;
}

/**
 * Extended context variables set by middleware
 */
export interface Variables {
  user?: JWTPayload;
  requestId?: string;
  startTime?: number;
}

/**
 * JWT payload structure for authenticated users
 */
export interface JWTPayload {
  id: string;
  username: string;
  iat: number;
  exp: number;
}

/**
 * Cloudflare Images binding interface
 * Used for image transformation within Workers
 */
export interface ImagesBinding {
  transform(input: Blob | ArrayBuffer | ReadableStream, options: ImageTransformOptions): Promise<Blob>;
}

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad';
  gravity?: 'auto' | 'left' | 'right' | 'top' | 'bottom' | 'center';
  quality?: number;
  format?: 'avif' | 'webp' | 'json' | 'jpeg' | 'png';
  background?: string;
  rotate?: 0 | 90 | 180 | 270;
}

/**
 * Type-safe Hono app with Cloudflare bindings
 */
import type { Context, Next } from 'hono';

export type AppContext = Context<{ Bindings: Env; Variables: Variables }>;
export type AppNext = Next;

/**
 * Common response types
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
