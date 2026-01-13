/**
 * Sentry Error Monitoring for Cloudflare Workers
 *
 * Lightweight Sentry integration for Workers runtime.
 * Uses Sentry's HTTP API directly since the full SDK doesn't work on Workers.
 *
 * Setup:
 * 1. Create a Sentry project at https://sentry.io
 * 2. Get your DSN from Project Settings > Client Keys
 * 3. Add SENTRY_DSN to your wrangler.toml secrets
 */

import type { Env } from '../types/bindings';

interface SentryEvent {
  event_id: string;
  timestamp: string;
  platform: string;
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
  logger?: string;
  transaction?: string;
  server_name?: string;
  release?: string;
  environment?: string;
  message?: string;
  exception?: {
    values: Array<{
      type: string;
      value: string;
      stacktrace?: {
        frames: Array<{
          filename: string;
          function: string;
          lineno?: number;
          colno?: number;
        }>;
      };
    }>;
  };
  request?: {
    url: string;
    method: string;
    headers?: Record<string, string>;
    query_string?: string;
  };
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  user?: {
    id?: string;
    email?: string;
    ip_address?: string;
  };
}

/**
 * Parse Sentry DSN into components
 */
function parseDSN(dsn: string): { publicKey: string; host: string; projectId: string } | null {
  try {
    const url = new URL(dsn);
    const publicKey = url.username;
    const host = url.host;
    const projectId = url.pathname.replace('/', '');

    if (!publicKey || !host || !projectId) {
      return null;
    }

    return { publicKey, host, projectId };
  } catch {
    return null;
  }
}

/**
 * Generate a unique event ID
 */
function generateEventId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Parse error stack trace into Sentry frames
 */
function parseStackTrace(
  stack: string
): Array<{ filename: string; function: string; lineno?: number; colno?: number }> {
  const lines = stack.split('\n').slice(1); // Skip the error message line
  const frames: Array<{ filename: string; function: string; lineno?: number; colno?: number }> = [];

  for (const line of lines) {
    const match = line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
    if (match) {
      frames.push({
        function: match[1],
        filename: match[2],
        lineno: parseInt(match[3], 10),
        colno: parseInt(match[4], 10),
      });
    } else {
      // Try alternative format: "at filename:line:col"
      const altMatch = line.match(/at\s+(.+?):(\d+):(\d+)/);
      if (altMatch) {
        frames.push({
          function: '<anonymous>',
          filename: altMatch[1],
          lineno: parseInt(altMatch[2], 10),
          colno: parseInt(altMatch[3], 10),
        });
      }
    }
  }

  // Sentry expects frames in reverse order (most recent last)
  return frames.reverse();
}

/**
 * Sentry client for Cloudflare Workers
 */
export class SentryClient {
  private dsn: ReturnType<typeof parseDSN>;
  private environment: string;
  private release?: string;

  constructor(dsnString: string, environment: string = 'production', release?: string) {
    this.dsn = parseDSN(dsnString);
    this.environment = environment;
    this.release = release;

    if (!this.dsn) {
      console.warn('Invalid Sentry DSN provided');
    }
  }

  /**
   * Check if Sentry is properly configured
   */
  isEnabled(): boolean {
    return this.dsn !== null;
  }

  /**
   * Capture an exception and send to Sentry
   */
  async captureException(
    error: Error,
    options?: {
      request?: Request;
      user?: { id?: string; email?: string };
      tags?: Record<string, string>;
      extra?: Record<string, unknown>;
    }
  ): Promise<string | null> {
    if (!this.dsn) {
      console.error('Sentry not configured:', error);
      return null;
    }

    const eventId = generateEventId();

    const event: SentryEvent = {
      event_id: eventId,
      timestamp: new Date().toISOString(),
      platform: 'javascript',
      level: 'error',
      logger: 'cloudflare-workers',
      environment: this.environment,
      release: this.release,
      exception: {
        values: [
          {
            type: error.name || 'Error',
            value: error.message,
            stacktrace: error.stack
              ? {
                  frames: parseStackTrace(error.stack),
                }
              : undefined,
          },
        ],
      },
    };

    // Add request context
    if (options?.request) {
      const url = new URL(options.request.url);
      event.request = {
        url: options.request.url,
        method: options.request.method,
        query_string: url.search,
        headers: Object.fromEntries(
          [...options.request.headers.entries()].filter(
            ([key]) => !['authorization', 'cookie', 'x-api-key'].includes(key.toLowerCase())
          )
        ),
      };
      event.transaction = `${options.request.method} ${url.pathname}`;
    }

    // Add user context
    if (options?.user) {
      event.user = options.user;
    }

    // Add tags
    if (options?.tags) {
      event.tags = options.tags;
    }

    // Add extra context
    if (options?.extra) {
      event.extra = options.extra;
    }

    // Send to Sentry
    await this.sendEvent(event);

    return eventId;
  }

  /**
   * Capture a message (for non-error events)
   */
  async captureMessage(
    message: string,
    level: 'info' | 'warning' | 'error' = 'info',
    options?: {
      tags?: Record<string, string>;
      extra?: Record<string, unknown>;
    }
  ): Promise<string | null> {
    if (!this.dsn) {
      console.log(`[Sentry ${level}]:`, message);
      return null;
    }

    const eventId = generateEventId();

    const event: SentryEvent = {
      event_id: eventId,
      timestamp: new Date().toISOString(),
      platform: 'javascript',
      level,
      logger: 'cloudflare-workers',
      environment: this.environment,
      release: this.release,
      message,
      tags: options?.tags,
      extra: options?.extra,
    };

    await this.sendEvent(event);

    return eventId;
  }

  /**
   * Send event to Sentry API
   */
  private async sendEvent(event: SentryEvent): Promise<void> {
    if (!this.dsn) return;

    const { publicKey, host, projectId } = this.dsn;
    const url = `https://${host}/api/${projectId}/store/`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Sentry-Auth': `Sentry sentry_version=7, sentry_client=cloudflare-workers/1.0.0, sentry_key=${publicKey}`,
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        console.error('Failed to send event to Sentry:', response.status, await response.text());
      }
    } catch (err) {
      console.error('Error sending event to Sentry:', err);
    }
  }
}

/**
 * Create Sentry client from environment
 */
export function createSentryClient(env: Env): SentryClient | null {
  const dsn = (env as Record<string, unknown>).SENTRY_DSN as string | undefined;

  if (!dsn) {
    return null;
  }

  return new SentryClient(dsn, env.ENVIRONMENT || 'production', '1.0.0');
}

/**
 * Sentry error handler middleware for Hono
 */
export function sentryErrorHandler(sentry: SentryClient | null) {
  return async (
    err: Error,
    request: Request,
    extra?: Record<string, unknown>
  ): Promise<string | null> => {
    if (!sentry) {
      console.error('Unhandled error:', err);
      return null;
    }

    return sentry.captureException(err, {
      request,
      extra,
    });
  };
}
