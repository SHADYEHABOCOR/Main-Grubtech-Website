/**
 * Analytics Tracking Routes for Cloudflare Workers
 *
 * Provides endpoints for tracking page views, custom events, and user sessions.
 * Public tracking endpoints are rate-limited, dashboard endpoints require authentication.
 *
 * SECURITY NOTE: SQL Injection Prevention
 * All database queries use parameterized queries (prepared statements) to prevent
 * SQL injection vulnerabilities. User input is passed separately via .bind() and
 * is safely escaped by the D1 database driver.
 *
 * Endpoints:
 * - POST /track/pageview  - Track a page view (public, rate-limited)
 * - POST /track/event     - Track a custom event (public, rate-limited)
 * - POST /track/session   - Track/update a user session (public, rate-limited)
 * - GET /dashboard        - Get analytics dashboard data (protected)
 * - GET /realtime         - Get real-time analytics (protected)
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env, Variables } from '../types/bindings';
import { createDatabaseService } from '../db';
import { authenticateToken } from '../middleware/auth';
import { analyticsRateLimiter } from '../middleware/rateLimiter';

// =============================================================================
// Types
// =============================================================================

/**
 * Pageview record from database
 */
interface PageviewRecord {
  id: number;
  page_url: string;
  page_title: string | null;
  referrer: string | null;
  session_id: string;
  user_agent: string | null;
  viewport_width: number | null;
  viewport_height: number | null;
  created_at: string;
}

/**
 * Event record from database
 */
interface EventRecord {
  id: number;
  event_name: string;
  event_category: string | null;
  event_label: string | null;
  event_value: number | null;
  page_url: string;
  session_id: string;
  metadata: string | null;
  created_at: string;
}

/**
 * Session record from database
 */
interface SessionRecord {
  id: number;
  session_id: string;
  user_agent: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  country: string | null;
  language: string | null;
  started_at: string;
  last_active_at: string;
}

// =============================================================================
// Zod Schemas for Validation
// =============================================================================

/**
 * Schema for tracking page views
 */
const trackPageviewSchema = z.object({
  page_url: z.string().min(1, 'Page URL is required').max(2000, 'Page URL is too long'),
  page_title: z.string().max(500, 'Page title is too long').optional().nullable(),
  referrer: z.string().max(2000, 'Referrer is too long').optional().nullable(),
  session_id: z.string().min(1, 'Session ID is required').max(100, 'Session ID is too long'),
  user_agent: z.string().max(1000, 'User agent is too long').optional().nullable(),
  viewport_width: z.number().int().min(0).max(10000).optional().nullable(),
  viewport_height: z.number().int().min(0).max(10000).optional().nullable(),
});

/**
 * Schema for tracking custom events
 */
const trackEventSchema = z.object({
  event_name: z.string().min(1, 'Event name is required').max(200, 'Event name is too long'),
  event_category: z.string().max(100, 'Event category is too long').optional().nullable(),
  event_label: z.string().max(500, 'Event label is too long').optional().nullable(),
  event_value: z.number().optional().nullable(),
  page_url: z.string().min(1, 'Page URL is required').max(2000, 'Page URL is too long'),
  session_id: z.string().min(1, 'Session ID is required').max(100, 'Session ID is too long'),
  metadata: z.record(z.unknown()).optional().nullable(),
});

/**
 * Schema for tracking sessions
 */
const trackSessionSchema = z.object({
  session_id: z.string().min(1, 'Session ID is required').max(100, 'Session ID is too long'),
  user_agent: z.string().max(1000, 'User agent is too long').optional().nullable(),
  device_type: z.string().max(50, 'Device type is too long').optional().nullable(),
  browser: z.string().max(100, 'Browser is too long').optional().nullable(),
  os: z.string().max(100, 'OS is too long').optional().nullable(),
  country: z.string().max(100, 'Country is too long').optional().nullable(),
  language: z.string().max(50, 'Language is too long').optional().nullable(),
});

/**
 * Schema for dashboard query parameters
 */
const dashboardQuerySchema = z.object({
  timeRange: z.enum(['24h', '7d', '30d', '90d']).optional().default('7d'),
});

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Calculate cutoff date based on days back
 */
function getCutoffDate(daysBack: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysBack);
  return date.toISOString();
}

/**
 * Get the number of days back from a time range string
 */
function getDaysBack(timeRange: string): number {
  switch (timeRange) {
    case '24h':
      return 1;
    case '30d':
      return 30;
    case '90d':
      return 90;
    case '7d':
    default:
      return 7;
  }
}

// =============================================================================
// Routes
// =============================================================================

// Create analytics router
const analyticsRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

/**
 * POST /api/analytics/track/pageview
 * Track a page view (public, rate-limited)
 *
 * Rate limits:
 * - 500 requests per minute (production)
 * - 2000 requests per minute (development)
 */
analyticsRoutes.post(
  '/track/pageview',
  analyticsRateLimiter(),
  zValidator('json', trackPageviewSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          error: 'Validation failed',
          details: result.error.flatten().fieldErrors,
        },
        400
      );
    }
  }),
  async (c) => {
    try {
      const body = c.req.valid('json');
      const db = createDatabaseService(c.env);

      // Insert pageview using parameterized query to prevent SQL injection
      await db.execute(
        `INSERT INTO analytics_pageviews (
          page_url, page_title, referrer, session_id, user_agent,
          viewport_width, viewport_height, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [
          body.page_url,
          body.page_title || null,
          body.referrer || null,
          body.session_id,
          body.user_agent || null,
          body.viewport_width || null,
          body.viewport_height || null,
        ]
      );

      return c.json({ success: true }, 201);
    } catch (error) {
      return c.json(
        {
          success: false,
          error: 'Failed to track page view',
        },
        500
      );
    }
  }
);

/**
 * POST /api/analytics/track/event
 * Track a custom event (public, rate-limited)
 *
 * Rate limits:
 * - 500 requests per minute (production)
 * - 2000 requests per minute (development)
 */
analyticsRoutes.post(
  '/track/event',
  analyticsRateLimiter(),
  zValidator('json', trackEventSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          error: 'Validation failed',
          details: result.error.flatten().fieldErrors,
        },
        400
      );
    }
  }),
  async (c) => {
    try {
      const body = c.req.valid('json');
      const db = createDatabaseService(c.env);

      // Insert event using parameterized query to prevent SQL injection
      await db.execute(
        `INSERT INTO analytics_events (
          event_name, event_category, event_label, event_value,
          page_url, session_id, metadata, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [
          body.event_name,
          body.event_category || null,
          body.event_label || null,
          body.event_value || null,
          body.page_url,
          body.session_id,
          body.metadata ? JSON.stringify(body.metadata) : null,
        ]
      );

      return c.json({ success: true }, 201);
    } catch (error) {
      return c.json(
        {
          success: false,
          error: 'Failed to track event',
        },
        500
      );
    }
  }
);

/**
 * POST /api/analytics/track/session
 * Track or update a user session (public, rate-limited)
 *
 * Creates a new session if one doesn't exist, or updates the last_active_at
 * timestamp if the session already exists.
 *
 * Rate limits:
 * - 500 requests per minute (production)
 * - 2000 requests per minute (development)
 */
analyticsRoutes.post(
  '/track/session',
  analyticsRateLimiter(),
  zValidator('json', trackSessionSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          error: 'Validation failed',
          details: result.error.flatten().fieldErrors,
        },
        400
      );
    }
  }),
  async (c) => {
    try {
      const body = c.req.valid('json');
      const db = createDatabaseService(c.env);

      // Check if session exists using parameterized query
      const existingSession = await db.queryFirst<{ id: number }>(
        'SELECT id FROM analytics_sessions WHERE session_id = ?',
        [body.session_id]
      );

      if (!existingSession) {
        // Create new session
        await db.execute(
          `INSERT INTO analytics_sessions (
            session_id, user_agent, device_type, browser, os,
            country, language, started_at, last_active_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
          [
            body.session_id,
            body.user_agent || null,
            body.device_type || null,
            body.browser || null,
            body.os || null,
            body.country || null,
            body.language || null,
          ]
        );
      } else {
        // Update last active timestamp
        await db.execute(
          "UPDATE analytics_sessions SET last_active_at = datetime('now') WHERE session_id = ?",
          [body.session_id]
        );
      }

      return c.json({ success: true }, 201);
    } catch (error) {
      return c.json(
        {
          success: false,
          error: 'Failed to track session',
        },
        500
      );
    }
  }
);

/**
 * GET /api/analytics/dashboard
 * Get analytics dashboard data (protected)
 *
 * Returns comprehensive analytics data including:
 * - Total page views
 * - Unique visitors
 * - Top pages
 * - Traffic sources
 * - Device breakdown
 * - Browser breakdown
 * - Geographic data
 */
analyticsRoutes.get(
  '/dashboard',
  authenticateToken,
  zValidator('query', dashboardQuerySchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          error: 'Invalid query parameters',
        },
        400
      );
    }
  }),
  async (c) => {
    try {
      const { timeRange } = c.req.valid('query');
      const db = createDatabaseService(c.env);

      // Calculate date range
      const daysBack = getDaysBack(timeRange || '7d');
      const cutoffDate = getCutoffDate(daysBack);

      // Execute all analytics queries in parallel for optimal performance
      const [
        totalPageviews,
        uniqueVisitors,
        totalEvents,
        topPages,
        topReferrers,
        deviceBreakdown,
        browserBreakdown,
        osBreakdown,
        countryBreakdown,
        pageviewsByDay,
        topEvents,
      ] = await Promise.all([
        // Total page views
        db.queryFirst<{ count: number }>(
          'SELECT COUNT(*) as count FROM analytics_pageviews WHERE created_at >= ?',
          [cutoffDate]
        ),

        // Unique visitors (by session)
        db.queryFirst<{ count: number }>(
          'SELECT COUNT(DISTINCT session_id) as count FROM analytics_pageviews WHERE created_at >= ?',
          [cutoffDate]
        ),

        // Total events
        db.queryFirst<{ count: number }>(
          'SELECT COUNT(*) as count FROM analytics_events WHERE created_at >= ?',
          [cutoffDate]
        ),

        // Top pages
        db.query<{ page_url: string; page_title: string | null; count: number }>(
          `SELECT page_url, page_title, COUNT(*) as count
           FROM analytics_pageviews
           WHERE created_at >= ?
           GROUP BY page_url
           ORDER BY count DESC
           LIMIT 10`,
          [cutoffDate]
        ),

        // Top referrers
        db.query<{ referrer: string; count: number }>(
          `SELECT referrer, COUNT(*) as count
           FROM analytics_pageviews
           WHERE created_at >= ? AND referrer IS NOT NULL AND referrer != ''
           GROUP BY referrer
           ORDER BY count DESC
           LIMIT 10`,
          [cutoffDate]
        ),

        // Device breakdown
        db.query<{ device_type: string; count: number }>(
          `SELECT device_type, COUNT(*) as count
           FROM analytics_sessions
           WHERE started_at >= ? AND device_type IS NOT NULL
           GROUP BY device_type
           ORDER BY count DESC`,
          [cutoffDate]
        ),

        // Browser breakdown
        db.query<{ browser: string; count: number }>(
          `SELECT browser, COUNT(*) as count
           FROM analytics_sessions
           WHERE started_at >= ? AND browser IS NOT NULL
           GROUP BY browser
           ORDER BY count DESC
           LIMIT 10`,
          [cutoffDate]
        ),

        // OS breakdown
        db.query<{ os: string; count: number }>(
          `SELECT os, COUNT(*) as count
           FROM analytics_sessions
           WHERE started_at >= ? AND os IS NOT NULL
           GROUP BY os
           ORDER BY count DESC
           LIMIT 10`,
          [cutoffDate]
        ),

        // Country breakdown
        db.query<{ country: string; count: number }>(
          `SELECT country, COUNT(*) as count
           FROM analytics_sessions
           WHERE started_at >= ? AND country IS NOT NULL
           GROUP BY country
           ORDER BY count DESC
           LIMIT 10`,
          [cutoffDate]
        ),

        // Page views by day
        db.query<{ date: string; count: number }>(
          `SELECT DATE(created_at) as date, COUNT(*) as count
           FROM analytics_pageviews
           WHERE created_at >= ?
           GROUP BY DATE(created_at)
           ORDER BY date ASC`,
          [cutoffDate]
        ),

        // Top events
        db.query<{ event_name: string; event_category: string | null; count: number }>(
          `SELECT event_name, event_category, COUNT(*) as count
           FROM analytics_events
           WHERE created_at >= ?
           GROUP BY event_name, event_category
           ORDER BY count DESC
           LIMIT 10`,
          [cutoffDate]
        ),
      ]);

      return c.json({
        success: true,
        data: {
          summary: {
            totalPageviews: totalPageviews?.count || 0,
            uniqueVisitors: uniqueVisitors?.count || 0,
            totalEvents: totalEvents?.count || 0,
          },
          topPages,
          topReferrers,
          deviceBreakdown,
          browserBreakdown,
          osBreakdown,
          countryBreakdown,
          pageviewsByDay,
          topEvents,
          timeRange,
        },
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          error: 'Failed to fetch analytics data',
        },
        500
      );
    }
  }
);

/**
 * GET /api/analytics/realtime
 * Get real-time analytics (protected)
 *
 * Returns analytics data for the last 30 minutes:
 * - Active visitors
 * - Recent page views
 * - Active pages
 * - Recent events
 */
analyticsRoutes.get('/realtime', authenticateToken, async (c) => {
  try {
    const db = createDatabaseService(c.env);

    // Execute all real-time queries in parallel
    const [activeVisitors, recentPageviews, activePages, recentEvents] = await Promise.all([
      // Active visitors in last 30 minutes
      db.queryFirst<{ count: number }>(
        `SELECT COUNT(DISTINCT session_id) as count
         FROM analytics_pageviews
         WHERE created_at >= datetime('now', '-30 minutes')`,
        []
      ),

      // Recent page views (last 100)
      db.query<PageviewRecord>(
        `SELECT * FROM analytics_pageviews
         WHERE created_at >= datetime('now', '-30 minutes')
         ORDER BY created_at DESC
         LIMIT 100`,
        []
      ),

      // Currently active pages
      db.query<{ page_url: string; page_title: string | null; count: number }>(
        `SELECT page_url, page_title, COUNT(*) as count
         FROM analytics_pageviews
         WHERE created_at >= datetime('now', '-30 minutes')
         GROUP BY page_url
         ORDER BY count DESC
         LIMIT 20`,
        []
      ),

      // Recent events (last 50)
      db.query<EventRecord>(
        `SELECT * FROM analytics_events
         WHERE created_at >= datetime('now', '-30 minutes')
         ORDER BY created_at DESC
         LIMIT 50`,
        []
      ),
    ]);

    return c.json({
      success: true,
      data: {
        activeVisitors: activeVisitors?.count || 0,
        recentPageviews,
        activePages,
        recentEvents,
      },
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: 'Failed to fetch real-time analytics',
      },
      500
    );
  }
});

export { analyticsRoutes };
export default analyticsRoutes;
