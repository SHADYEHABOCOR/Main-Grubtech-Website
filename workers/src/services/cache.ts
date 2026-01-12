/**
 * KV Cache Service for Cloudflare Workers
 * Provides a type-safe caching layer using Cloudflare KV namespace
 *
 * KV Binding: CACHE
 * Configuration: wrangler.toml [[kv_namespaces]]
 *
 * Key patterns:
 * - Automatic TTL expiration via expirationTtl
 * - Cache-aside pattern with getOrFetch helper
 * - Type-safe serialization/deserialization
 * - Eventual consistency (KV has ~60s propagation)
 *
 * Usage in route handlers:
 * ```typescript
 * import { createCacheService } from '../services/cache';
 *
 * // Simple get/set
 * const cache = createCacheService(c.env);
 * await cache.set('user:123', { name: 'John' }, { expirationTtl: 3600 });
 * const user = await cache.get<User>('user:123');
 *
 * // Cache-aside pattern (most common)
 * const posts = await cache.getOrFetch('blog:posts',
 *   async () => fetchFromDatabase(),
 *   { expirationTtl: 300 }
 * );
 * ```
 *
 * Direct KV binding usage (for reference):
 * - Get:    const value = await c.env.CACHE.get(key);
 * - Set:    await c.env.CACHE.put(key, value, { expirationTtl: seconds });
 * - Delete: await c.env.CACHE.delete(key);
 */

import type { Env } from '../types/bindings';

/**
 * Cache configuration options for set operations
 */
export interface CacheOptions {
  /** Time-to-live in seconds (60 to 157,680,000 = 5 years) */
  expirationTtl?: number;
  /** Absolute expiration timestamp (seconds since Unix epoch) */
  expiration?: number;
  /** Optional metadata to store with the value */
  metadata?: Record<string, string>;
}

/**
 * Result from getWithMetadata operations
 */
export interface CacheResult<T> {
  value: T | null;
  metadata: Record<string, string> | null;
}

/**
 * Cache key prefixes for organized namespacing
 */
export const CACHE_PREFIXES = {
  /** Content pages cache */
  CONTENT: 'content',
  /** Blog posts cache */
  BLOG: 'blog',
  /** Testimonials cache */
  TESTIMONIALS: 'testimonials',
  /** Integrations cache */
  INTEGRATIONS: 'integrations',
  /** Team members cache */
  TEAM: 'team',
  /** Policies cache */
  POLICIES: 'policies',
  /** Video galleries cache */
  VIDEO: 'video',
  /** Analytics aggregations cache */
  ANALYTICS: 'analytics',
  /** General API responses cache */
  API: 'api',
  /** User session data cache */
  SESSION: 'session',
  /** Rate limiting counters (handled by rateLimiter middleware) */
  RATE_LIMIT: 'ratelimit',
} as const;

/**
 * Default TTL values in seconds
 */
export const CACHE_TTL = {
  /** Very short-lived cache (1 minute) */
  SHORT: 60,
  /** Default cache duration (5 minutes) */
  DEFAULT: 300,
  /** Medium cache duration (15 minutes) */
  MEDIUM: 900,
  /** Long cache duration (1 hour) */
  LONG: 3600,
  /** Extended cache duration (6 hours) */
  EXTENDED: 21600,
  /** Daily cache refresh (24 hours) */
  DAILY: 86400,
  /** Weekly cache (7 days) */
  WEEKLY: 604800,
} as const;

/**
 * Build a namespaced cache key
 */
export function buildCacheKey(prefix: string, ...parts: (string | number)[]): string {
  const sanitizedParts = parts.map(part =>
    String(part).replace(/[^a-zA-Z0-9_-]/g, '_')
  );
  return `${prefix}:${sanitizedParts.join(':')}`;
}

/**
 * Cache Service class for Cloudflare Workers
 * Uses KV namespace binding for cache operations
 */
export class CacheService {
  private kv: KVNamespace;
  private defaultTtl: number;

  constructor(env: Env, defaultTtl: number = CACHE_TTL.DEFAULT) {
    this.kv = env.CACHE;
    this.defaultTtl = defaultTtl;
  }

  /**
   * Get a value from cache
   * Returns null if key doesn't exist or value has expired
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.kv.get(key, 'text');
      if (value === null) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch {
      // Invalid JSON or other error
      return null;
    }
  }

  /**
   * Get a raw string value from cache (for non-JSON data)
   */
  async getRaw(key: string): Promise<string | null> {
    return this.kv.get(key, 'text');
  }

  /**
   * Get a value with its metadata
   */
  async getWithMetadata<T>(key: string): Promise<CacheResult<T>> {
    try {
      const result = await this.kv.getWithMetadata<Record<string, string>>(key, 'text');

      if (result.value === null) {
        return { value: null, metadata: null };
      }

      return {
        value: JSON.parse(result.value) as T,
        metadata: result.metadata,
      };
    } catch {
      return { value: null, metadata: null };
    }
  }

  /**
   * Set a value in cache with optional TTL
   * Value is JSON serialized automatically
   */
  async set<T>(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);
      const putOptions: KVNamespacePutOptions = {};

      // Set expiration (TTL takes precedence)
      if (options.expirationTtl) {
        putOptions.expirationTtl = options.expirationTtl;
      } else if (options.expiration) {
        putOptions.expiration = options.expiration;
      } else {
        putOptions.expirationTtl = this.defaultTtl;
      }

      // Set metadata if provided
      if (options.metadata) {
        putOptions.metadata = options.metadata;
      }

      await this.kv.put(key, serialized, putOptions);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Set a raw string value (for non-JSON data)
   */
  async setRaw(
    key: string,
    value: string,
    options: CacheOptions = {}
  ): Promise<boolean> {
    try {
      const putOptions: KVNamespacePutOptions = {};

      if (options.expirationTtl) {
        putOptions.expirationTtl = options.expirationTtl;
      } else if (options.expiration) {
        putOptions.expiration = options.expiration;
      } else {
        putOptions.expirationTtl = this.defaultTtl;
      }

      if (options.metadata) {
        putOptions.metadata = options.metadata;
      }

      await this.kv.put(key, value, putOptions);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Delete a value from cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      await this.kv.delete(key);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Delete multiple keys from cache
   */
  async deleteMany(keys: string[]): Promise<boolean> {
    try {
      await Promise.all(keys.map(key => this.kv.delete(key)));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Delete all keys matching a prefix
   * Note: This uses list + delete, which may be slow for many keys
   */
  async deleteByPrefix(prefix: string): Promise<number> {
    let deleted = 0;
    let cursor: string | undefined;

    try {
      do {
        const result = await this.kv.list({ prefix, cursor });

        if (result.keys.length > 0) {
          await Promise.all(result.keys.map(key => this.kv.delete(key.name)));
          deleted += result.keys.length;
        }

        cursor = result.list_complete ? undefined : result.cursor;
      } while (cursor);

      return deleted;
    } catch {
      return deleted;
    }
  }

  /**
   * Check if a key exists in cache
   */
  async exists(key: string): Promise<boolean> {
    const value = await this.kv.get(key, 'text');
    return value !== null;
  }

  /**
   * Get or fetch pattern (cache-aside)
   * Returns cached value if available, otherwise fetches fresh data and caches it
   *
   * @example
   * const posts = await cache.getOrFetch(
   *   'blog:posts:all',
   *   async () => await db.select('SELECT * FROM posts'),
   *   { expirationTtl: 300 }
   * );
   */
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const fresh = await fetcher();

    // Cache the fresh data (don't await to avoid blocking response)
    // In production, use c.executionCtx.waitUntil() instead
    this.set(key, fresh, options).catch(() => {
      // Silently ignore cache write errors
    });

    return fresh;
  }

  /**
   * Get or fetch with stale-while-revalidate pattern
   * Returns stale data immediately while refreshing in background
   *
   * Note: Requires passing executionCtx.waitUntil for proper background refresh
   */
  async getOrFetchStale<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions & {
      staleWhileRevalidate?: number;
      waitUntil?: (promise: Promise<void>) => void;
    } = {}
  ): Promise<T> {
    const result = await this.getWithMetadata<T>(key);

    // If we have a cached value, check if it's stale
    if (result.value !== null && result.metadata) {
      const cachedAt = parseInt(result.metadata.cachedAt || '0', 10);
      const now = Math.floor(Date.now() / 1000);
      const staleThreshold = options.staleWhileRevalidate || CACHE_TTL.DEFAULT;

      // If within stale threshold, return cached and refresh in background
      if (now - cachedAt < (options.expirationTtl || this.defaultTtl) + staleThreshold) {
        if (options.waitUntil) {
          options.waitUntil(this.refreshInBackground(key, fetcher, options));
        }
        return result.value;
      }
    }

    // No valid cached value, fetch fresh
    return this.getOrFetch(key, fetcher, {
      ...options,
      metadata: {
        ...options.metadata,
        cachedAt: Math.floor(Date.now() / 1000).toString(),
      },
    });
  }

  /**
   * Refresh cache in background (for stale-while-revalidate)
   */
  private async refreshInBackground<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions
  ): Promise<void> {
    try {
      const fresh = await fetcher();
      await this.set(key, fresh, {
        ...options,
        metadata: {
          ...options.metadata,
          cachedAt: Math.floor(Date.now() / 1000).toString(),
        },
      });
    } catch {
      // Silently ignore background refresh errors
    }
  }

  /**
   * List all keys matching a prefix
   */
  async list(prefix?: string): Promise<string[]> {
    const keys: string[] = [];
    let cursor: string | undefined;

    try {
      do {
        const result = await this.kv.list({ prefix, cursor });
        keys.push(...result.keys.map(k => k.name));
        cursor = result.list_complete ? undefined : result.cursor;
      } while (cursor);

      return keys;
    } catch {
      return keys;
    }
  }

  /**
   * Increment a numeric counter in cache
   * Useful for simple counters without race conditions concerns
   * Note: Not atomic - for true counters use Durable Objects
   */
  async increment(
    key: string,
    delta: number = 1,
    options: CacheOptions = {}
  ): Promise<number> {
    const current = await this.get<number>(key);
    const newValue = (current || 0) + delta;
    await this.set(key, newValue, options);
    return newValue;
  }

  /**
   * Decrement a numeric counter in cache
   */
  async decrement(
    key: string,
    delta: number = 1,
    options: CacheOptions = {}
  ): Promise<number> {
    return this.increment(key, -delta, options);
  }

  /**
   * Get multiple values by keys
   * Returns a map of key -> value (null for missing keys)
   */
  async getMany<T>(keys: string[]): Promise<Map<string, T | null>> {
    const results = new Map<string, T | null>();

    await Promise.all(
      keys.map(async (key) => {
        const value = await this.get<T>(key);
        results.set(key, value);
      })
    );

    return results;
  }

  /**
   * Set multiple values at once
   */
  async setMany<T>(
    entries: Array<{ key: string; value: T }>,
    options: CacheOptions = {}
  ): Promise<boolean> {
    try {
      await Promise.all(
        entries.map(({ key, value }) => this.set(key, value, options))
      );
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Touch a key to extend its TTL without changing the value
   */
  async touch(key: string, expirationTtl?: number): Promise<boolean> {
    const value = await this.getRaw(key);
    if (value === null) {
      return false;
    }

    return this.setRaw(key, value, {
      expirationTtl: expirationTtl || this.defaultTtl,
    });
  }
}

/**
 * Create cache service instance from environment
 * Use this in route handlers: const cache = createCacheService(c.env)
 */
export function createCacheService(env: Env, defaultTtl?: number): CacheService {
  return new CacheService(env, defaultTtl);
}

/**
 * Helper to wrap a function with caching
 * Useful for creating cached versions of database queries
 *
 * @example
 * const getCachedPosts = withCache(
 *   'blog:posts',
 *   async (db) => db.query('SELECT * FROM posts'),
 *   { expirationTtl: 300 }
 * );
 * const posts = await getCachedPosts(cache, db);
 */
export function withCache<TArgs extends unknown[], TResult>(
  keyOrKeyFn: string | ((...args: TArgs) => string),
  fetcher: (...args: TArgs) => Promise<TResult>,
  options: CacheOptions = {}
): (cache: CacheService, ...args: TArgs) => Promise<TResult> {
  return async (cache: CacheService, ...args: TArgs) => {
    const key = typeof keyOrKeyFn === 'function'
      ? keyOrKeyFn(...args)
      : keyOrKeyFn;

    return cache.getOrFetch(key, () => fetcher(...args), options);
  };
}

/**
 * Export commonly used cache key builders for consistency
 */
export const cacheKeys = {
  content: (pageKey: string) => buildCacheKey(CACHE_PREFIXES.CONTENT, pageKey),
  blogPost: (slug: string) => buildCacheKey(CACHE_PREFIXES.BLOG, 'post', slug),
  blogList: (page: number = 1) => buildCacheKey(CACHE_PREFIXES.BLOG, 'list', page),
  blogAll: () => buildCacheKey(CACHE_PREFIXES.BLOG, 'all'),
  testimonials: () => buildCacheKey(CACHE_PREFIXES.TESTIMONIALS, 'all'),
  integrations: (category?: string) =>
    buildCacheKey(CACHE_PREFIXES.INTEGRATIONS, category || 'all'),
  team: () => buildCacheKey(CACHE_PREFIXES.TEAM, 'all'),
  policies: (slug: string) => buildCacheKey(CACHE_PREFIXES.POLICIES, slug),
  videoGalleries: () => buildCacheKey(CACHE_PREFIXES.VIDEO, 'all'),
  analytics: (metric: string, period: string) =>
    buildCacheKey(CACHE_PREFIXES.ANALYTICS, metric, period),
};
