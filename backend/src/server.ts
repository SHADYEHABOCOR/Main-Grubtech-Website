/**
 * Grubtech API Server
 *
 * Enterprise-ready Express server with:
 * - Environment validation at startup
 * - Structured logging (CloudWatch compatible)
 * - Request correlation IDs
 * - Standardized error handling
 * - Security middleware (Helmet, CORS, Rate Limiting)
 * - Graceful shutdown handling
 *
 * AWS Deployment Ready:
 * - ECS/Fargate compatible
 * - ALB health checks
 * - CloudWatch Logs integration
 * - S3 storage abstraction
 */

import 'dotenv/config';
import express from 'express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, existsSync } from 'fs';

// Configuration (must be imported first to validate env)
import { env, getAllowedOrigins, isProduction } from './config/env.js';
import { logger, httpLogger, dbLogger } from './config/logger.js';

// Middleware
import { requestIdMiddleware, getRequestDuration } from './middleware/requestId.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { apiRateLimiter } from './middleware/security.js';

// Database
import { initDatabase, getDatabase } from './config/database.js';

// Routes
import authRoutes from './routes/auth.js';
import blogRoutes from './routes/blog.js';
import testimonialsRoutes from './routes/testimonials.js';
import contentRoutes from './routes/content.js';
import careersRoutes from './routes/careers.js';
import integrationsRoutes from './routes/integrations.js';
import integrationRequestsRoutes from './routes/integration-requests.js';
import videoGalleriesRoutes from './routes/videoGalleries.js';
import leadRoutes from './routes/leads.js';
import analyticsRoutes from './routes/analytics.js';
import sitemapRoutes from './routes/sitemap.js';
import policiesRoutes from './routes/policies.js';
import uploadRoutes from './routes/uploads.js';
import setupAdminRoutes from './routes/setup-admin.js';
import teamRoutes from './routes/team.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===========================================
// Global Error Handlers
// ===========================================

process.on('unhandledRejection', (reason: unknown, _promise: Promise<unknown>) => {
  logger.error('Unhandled Promise Rejection', {
    reason: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
  });

  if (isProduction) {
    // In production, log and continue - let monitoring catch patterns
    // Consider integrating with Sentry or similar
  }
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception', {
    message: error.message,
    stack: error.stack,
  });

  // Uncaught exceptions leave app in undefined state
  // Always exit and let process manager restart
  logger.info('Shutting down due to uncaught exception...');
  process.exit(1);
});

// ===========================================
// Graceful Shutdown
// ===========================================

let isShuttingDown = false;
let server: ReturnType<typeof app.listen>;

async function gracefulShutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(`${signal} received. Starting graceful shutdown...`);

  // Stop accepting new connections
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
    });
  }

  // Close database connections
  try {
    const db = getDatabase();
    if (db) {
      db.close();
      dbLogger.connection('disconnected', 'Graceful shutdown');
    }
  } catch (error) {
    logger.error('Error closing database', { error });
  }

  // Give time for cleanup, then exit
  setTimeout(() => {
    logger.info('Graceful shutdown complete');
    process.exit(0);
  }, 5000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ===========================================
// Express App Setup
// ===========================================

const app = express();

// Trust proxy - required for rate limiting behind reverse proxies (AWS ALB, CloudFront)
// Set to 1 for single proxy, or 'loopback' for localhost only
app.set('trust proxy', isProduction ? 1 : 'loopback');

// Disable x-powered-by header
app.disable('x-powered-by');

// ===========================================
// Initialize Database
// ===========================================

try {
  initDatabase();
  dbLogger.connection('connected', 'Database initialized successfully');
} catch (error) {
  logger.error('Failed to initialize database', { error });
  process.exit(1);
}

// ===========================================
// Middleware Stack (Order Matters!)
// ===========================================

// 1. Request ID - First to ensure all logs have correlation ID
app.use(requestIdMiddleware);

// 2. Request logging
app.use((req, res, next) => {
  httpLogger.request({
    method: req.method,
    url: req.url,
    requestId: req.requestId,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Log response when finished
  res.on('finish', () => {
    httpLogger.response({
      method: req.method,
      url: req.url,
      requestId: req.requestId,
      statusCode: res.statusCode,
      duration: getRequestDuration(req),
    });
  });

  next();
});

// 3. Compression - Early to compress all responses
app.use(compression({
  threshold: 1024,
  level: 6,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
}));

// 4. Security headers (Helmet)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      scriptSrc: ["'none'"],
      styleSrc: ["'none'"],
      imgSrc: ["'self'"],
      connectSrc: ["'self'"],
      fontSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'none'"],
      frameSrc: ["'none'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  strictTransportSecurity: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  dnsPrefetchControl: { allow: false },
  ieNoOpen: true,
  noSniff: true,
  frameguard: { action: 'deny' },
  xssFilter: true,
}));

// 5. CORS - Configured with environment-specific origins
const allowedOrigins = getAllowedOrigins();

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    // Check explicit allowlist
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow Vercel preview deployments (only in non-production or if configured)
    if (origin.endsWith('.vercel.app') && !isProduction) {
      return callback(null, true);
    }

    // Allow grubtech.com domains
    if (origin.includes('grubtech.com')) {
      return callback(null, true);
    }

    // In development, be permissive
    if (!isProduction) {
      return callback(null, true);
    }

    logger.warn('CORS blocked origin', { origin, allowedOrigins });
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID'],
}));

// 6. Body parsing with error handling for invalid JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Handle JSON parsing errors (return 400 instead of 500)
app.use((err: any, req: any, res: any, next: any) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Invalid JSON in request body',
      },
      meta: {
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      },
    });
  }
  next(err);
});

// 7. Cookie parser
app.use(cookieParser());

// 8. Rate limiting (applied to /api routes)
app.use('/api/', apiRateLimiter);

// ===========================================
// Static File Serving
// ===========================================

// Create uploads directories
const uploadsImagesDir = path.join(__dirname, '../uploads/images/thumbnails');
if (!existsSync(uploadsImagesDir)) {
  mkdirSync(uploadsImagesDir, { recursive: true });
}

// Serve uploaded files with appropriate headers
// Note: Serves from both /uploads (new) and /public/uploads (legacy) directories
const uploadsMiddleware = (_req: any, res: any, next: any) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  next();
};

// New uploads directory (for new image upload API)
app.use('/uploads', uploadsMiddleware, express.static(path.join(__dirname, '../uploads')));

// Legacy uploads directory (for existing integrations, blog, etc.)
app.use('/uploads', uploadsMiddleware, express.static(path.join(__dirname, '../public/uploads')));

// ===========================================
// API Routes
// ===========================================

app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/testimonials', testimonialsRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/careers', careersRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/integration-requests', integrationRequestsRoutes);
app.use('/api/video-galleries', videoGalleriesRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/policies', policiesRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/team', teamRoutes);
app.use('/api', sitemapRoutes);

// Setup admin route - ONLY enabled when ENABLE_SETUP_ADMIN=true
if (env.ENABLE_SETUP_ADMIN) {
  // Check if any users already exist in the database
  try {
    const db = getDatabase();
    const existingUsersCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };

    if (existingUsersCount.count > 0) {
      // Users already exist - auto-disable setup endpoint for security
      logger.warn('Setup admin route NOT registered - admin user(s) already exist', {
        endpoint: `/api/setup/create-admin`,
        environment: env.NODE_ENV,
        existingUsersCount: existingUsersCount.count,
        message: 'ENABLE_SETUP_ADMIN is true but route was automatically disabled because users already exist. Set ENABLE_SETUP_ADMIN=false in .env to remove this warning.',
      });

      console.error('\n');
      console.error('╔════════════════════════════════════════════════════════════════════════════════╗');
      console.error('║                                                                                ║');
      console.error('║                           ⚠️  SECURITY NOTICE  ⚠️                               ║');
      console.error('║                                                                                ║');
      console.error('║                 SETUP ENDPOINT AUTOMATICALLY DISABLED                          ║');
      console.error('║                                                                                ║');
      console.error('╠════════════════════════════════════════════════════════════════════════════════╣');
      console.error('║                                                                                ║');
      console.error('║  The setup admin endpoint was NOT registered because admin users already      ║');
      console.error('║  exist in the database. This is a security safeguard to prevent unauthorized  ║');
      console.error('║  admin creation after initial setup is complete.                              ║');
      console.error('║                                                                                ║');
      console.error(`║  Existing users in database: ${existingUsersCount.count}                                                ║`);
      console.error('║                                                                                ║');
      console.error('║  ACTION REQUIRED:                                                              ║');
      console.error('║    Set ENABLE_SETUP_ADMIN=false in your .env file to remove this warning     ║');
      console.error('║                                                                                ║');
      console.error('╚════════════════════════════════════════════════════════════════════════════════╝');
      console.error('\n');
    } else {
      // No users exist - display warning banner and register route
      console.error('\n');
      console.error('╔════════════════════════════════════════════════════════════════════════════════╗');
      console.error('║                                                                                ║');
      console.error('║                           ⚠️  SECURITY WARNING  ⚠️                              ║');
      console.error('║                                                                                ║');
      console.error('║                      SETUP ADMIN ENDPOINT IS ENABLED                           ║');
      console.error('║                                                                                ║');
      console.error('╠════════════════════════════════════════════════════════════════════════════════╣');
      console.error('║                                                                                ║');
      console.error('║  This endpoint allows creating the first admin account and should ONLY be     ║');
      console.error('║  enabled during initial setup. It is protected by a setup token but should    ║');
      console.error('║  be disabled immediately after creating your first admin account.             ║');
      console.error('║                                                                                ║');
      console.error('║  Endpoint URL:                                                                 ║');
      console.error(`║    POST http://localhost:${env.PORT}/api/setup/create-admin                           ║`);
      console.error('║                                                                                ║');
      console.error('║  Required Header:                                                              ║');
      console.error('║    X-Setup-Token: <your_SETUP_SECRET_TOKEN>                                    ║');
      console.error('║                                                                                ║');
      console.error('║  AFTER CREATING YOUR FIRST ADMIN:                                              ║');
      console.error('║    1. Set ENABLE_SETUP_ADMIN=false in your .env file                          ║');
      console.error('║    2. Remove or secure the SETUP_SECRET_TOKEN                                  ║');
      console.error('║    3. Restart the server                                                       ║');
      console.error('║                                                                                ║');
      console.error('║  This endpoint is automatically disabled in production mode.                  ║');
      console.error('║                                                                                ║');
      console.error('╚════════════════════════════════════════════════════════════════════════════════╝');
      console.error('\n');

      logger.warn('Setup admin route is ENABLED', {
        endpoint: `/api/setup/create-admin`,
        environment: env.NODE_ENV,
        message: 'Disable ENABLE_SETUP_ADMIN after creating first admin',
      });

      app.use('/api/setup', setupAdminRoutes);
    }
  } catch (error) {
    logger.error('Failed to check existing users for setup route', { error });
    // On error, fail safe by not registering the route
    logger.warn('Setup admin route NOT registered due to database check error');
  }
}

// ===========================================
// Health & Info Endpoints
// ===========================================

// Root route - API info
app.get('/', (_req, res) => {
  res.json({
    success: true,
    data: {
      name: 'Grubtech API',
      version: '1.0.0',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
  });
});

// Health check - for load balancer and monitoring
app.get('/api/health', async (_req, res) => {
  const health: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    uptime: number;
    checks: Record<string, { status: string; latency?: number; error?: string }>;
  } = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {},
  };

  // Check database
  try {
    const start = Date.now();
    const db = getDatabase();
    db.prepare('SELECT 1').get();
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

  // Memory check - use absolute threshold (512MB) instead of ratio
  const memoryUsage = process.memoryUsage();
  const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
  const memoryThresholdMB = 512; // Consider degraded if using more than 512MB

  health.checks.memory = {
    status: heapUsedMB < memoryThresholdMB ? 'healthy' : 'degraded',
    latency: heapUsedMB,
  };

  if (health.checks.memory.status === 'degraded' && health.status === 'healthy') {
    health.status = 'degraded';
  }

  const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Ready check - for container orchestration
app.get('/api/ready', (_req, res) => {
  if (isShuttingDown) {
    return res.status(503).json({ ready: false, reason: 'Shutting down' });
  }

  try {
    const db = getDatabase();
    db.prepare('SELECT 1').get();
    res.json({ ready: true });
  } catch {
    res.status(503).json({ ready: false, reason: 'Database not available' });
  }
});

// ===========================================
// Error Handling (Must be last!)
// ===========================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ===========================================
// Start Server
// ===========================================

server = app.listen(env.PORT, () => {
  logger.info('Server started', {
    port: env.PORT,
    environment: env.NODE_ENV,
    nodeVersion: process.version,
  });
});

// Handle server errors
server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    logger.error(`Port ${env.PORT} is already in use`);
  } else {
    logger.error('Server error', { error });
  }
  process.exit(1);
});

export default app;
