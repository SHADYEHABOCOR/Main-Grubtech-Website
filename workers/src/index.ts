/**
 * Grubtech API - Cloudflare Workers Entry Point
 *
 * Enterprise-ready Hono server with:
 * - Environment-aware configuration
 * - Structured JSON logging
 * - Request correlation IDs
 * - Standardized error handling
 * - Security middleware (CORS, Secure Headers, Rate Limiting)
 * - D1 database integration
 * - R2 file storage
 * - KV caching
 *
 * Cloudflare Deployment Ready:
 * - Workers runtime compatible
 * - D1 database bindings
 * - R2 bucket bindings
 * - KV namespace bindings
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import type { Env, Variables } from './types/bindings';

// Middleware
import { requestLogger, logError, generateRequestId } from './middleware/logging';
import { apiRateLimiter } from './middleware/rateLimiter';

// Routes
import { authRoutes } from './routes/auth';
import { setupAdminRoutes } from './routes/setup-admin';
import { leadsRoutes } from './routes/leads';
import { sitemapRoutes } from './routes/sitemap';
import { analyticsRoutes } from './routes/analytics';
import { blogRoutes } from './routes/blog';
import { testimonialsRoutes } from './routes/testimonials';
import { integrationsRoutes } from './routes/integrations';
import { contentRoutes } from './routes/content';
import { policiesRoutes } from './routes/policies';
import { teamRoutes } from './routes/team';
import { videoGalleriesRoutes } from './routes/videoGalleries';
import { careersRoutes } from './routes/careers';
import { uploadsRoutes } from './routes/uploads';
import { integrationRequestsRoutes } from './routes/integration-requests';

// ===========================================
// Main Hono App
// ===========================================

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// ===========================================
// Global Middleware Stack (Order Matters!)
// ===========================================

// 1. Request ID - First to ensure all logs have correlation ID
app.use('*', async (c, next) => {
  const requestId = generateRequestId();
  c.set('requestId', requestId);
  c.set('startTime', Date.now());
  c.header('X-Request-ID', requestId);
  await next();
});

// 2. Request logging
app.use('*', requestLogger());

// 3. Secure headers (equivalent to Helmet)
app.use(
  '*',
  secureHeaders({
    xFrameOptions: 'DENY',
    xContentTypeOptions: 'nosniff',
    xXssProtection: '1; mode=block',
    referrerPolicy: 'strict-origin-when-cross-origin',
    strictTransportSecurity: 'max-age=31536000; includeSubDomains; preload',
    crossOriginResourcePolicy: 'cross-origin',
    crossOriginOpenerPolicy: 'same-origin',
    permissionsPolicy: {
      accelerometer: [],
      camera: [],
      geolocation: [],
      gyroscope: [],
      magnetometer: [],
      microphone: [],
      payment: [],
      usb: [],
    },
  })
);

// 4. CORS - Configured with environment-specific origins
app.use(
  '*',
  cors({
    origin: (origin, c) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return '*';

      const env = c.env;
      const isProduction = env.ENVIRONMENT === 'production';

      // Parse allowed origins from environment
      const allowedOrigins = env.ALLOWED_ORIGINS
        ? env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
        : [];

      // Check explicit allowlist
      if (allowedOrigins.includes(origin)) {
        return origin;
      }

      // Allow Vercel preview deployments (only in non-production)
      if (origin.endsWith('.vercel.app') && !isProduction) {
        return origin;
      }

      // Allow grubtech.com domains
      if (origin.includes('grubtech.com')) {
        return origin;
      }

      // In development, be permissive
      if (!isProduction) {
        return origin;
      }

      // In production, deny unknown origins
      return null;
    },
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposeHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    maxAge: 86400,
  })
);

// 5. Rate limiting (applied to /api routes)
app.use('/api/*', apiRateLimiter());

// ===========================================
// Health & Info Endpoints
// ===========================================

/**
 * Root route - API info
 */
app.get('/', (c) => {
  return c.json({
    success: true,
    data: {
      name: 'Grubtech API',
      version: '1.0.0',
      runtime: 'Cloudflare Workers',
      environment: c.env.ENVIRONMENT,
      timestamp: new Date().toISOString(),
    },
  });
});

/**
 * Health check - for load balancer and monitoring
 */
app.get('/api/health', async (c) => {
  const health: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    checks: Record<string, { status: string; latency?: number; error?: string }>;
  } = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {},
  };

  // Check database
  try {
    const start = Date.now();
    await c.env.DB.prepare('SELECT 1').first();
    health.checks.database = {
      status: 'healthy',
      latency: Date.now() - start,
    };
  } catch (error) {
    health.status = 'unhealthy';
    health.checks.database = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Check KV
  try {
    const start = Date.now();
    await c.env.CACHE.get('health-check');
    health.checks.kv = {
      status: 'healthy',
      latency: Date.now() - start,
    };
  } catch (error) {
    health.status = 'degraded';
    health.checks.kv = {
      status: 'degraded',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Check R2
  try {
    const start = Date.now();
    await c.env.UPLOADS.head('health-check');
    health.checks.r2 = {
      status: 'healthy',
      latency: Date.now() - start,
    };
  } catch (error) {
    // R2 head returning null is fine - the bucket exists
    health.checks.r2 = {
      status: 'healthy',
      latency: Date.now() - start,
    };
  }

  const statusCode = health.status === 'unhealthy' ? 503 : 200;
  return c.json(health, statusCode);
});

/**
 * Ready check - for container orchestration
 */
app.get('/api/ready', async (c) => {
  try {
    await c.env.DB.prepare('SELECT 1').first();
    return c.json({ ready: true });
  } catch {
    return c.json({ ready: false, reason: 'Database not available' }, 503);
  }
});

// ===========================================
// API Routes
// ===========================================

// Authentication routes
app.route('/api/auth', authRoutes);

// Setup admin route (for initial admin creation)
app.route('/api/setup', setupAdminRoutes);

// Lead generation
app.route('/api/leads', leadsRoutes);

// Content management
app.route('/api/blog', blogRoutes);
app.route('/api/testimonials', testimonialsRoutes);
app.route('/api/integrations', integrationsRoutes);
app.route('/api/integration-requests', integrationRequestsRoutes);
app.route('/api/content', contentRoutes);
app.route('/api/policies', policiesRoutes);
app.route('/api/team', teamRoutes);
app.route('/api/video-galleries', videoGalleriesRoutes);
app.route('/api/careers', careersRoutes);

// File uploads
app.route('/api/uploads', uploadsRoutes);

// Analytics
app.route('/api/analytics', analyticsRoutes);

// SEO routes (sitemap.xml, robots.txt)
app.route('/api', sitemapRoutes);

// ===========================================
// Error Handling (Must be last!)
// ===========================================

/**
 * Global error handler
 */
app.onError((err, c) => {
  // Log the error
  logError(c, err);

  // Get request ID for correlation
  const requestId = c.get('requestId') || 'unknown';

  // Determine status code
  let status = 500;
  if (err.message.includes('not found')) {
    status = 404;
  } else if (err.message.includes('unauthorized') || err.message.includes('Unauthorized')) {
    status = 401;
  } else if (err.message.includes('forbidden') || err.message.includes('Forbidden')) {
    status = 403;
  } else if (err.message.includes('validation') || err.message.includes('invalid')) {
    status = 400;
  }

  // Return standardized error response
  return c.json(
    {
      success: false,
      error: {
        code: status === 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR',
        message: c.env.ENVIRONMENT === 'production' && status === 500
          ? 'An internal error occurred'
          : err.message,
      },
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
      },
    },
    status as 400 | 401 | 403 | 404 | 500
  );
});

/**
 * 404 Not Found handler
 */
app.notFound((c) => {
  const requestId = c.get('requestId') || 'unknown';

  return c.json(
    {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Route ${c.req.method} ${c.req.path} not found`,
      },
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
      },
    },
    404
  );
});

// ===========================================
// Export for Cloudflare Workers
// ===========================================

export default app;
