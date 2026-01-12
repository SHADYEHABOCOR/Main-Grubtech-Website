import express from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import analyticsService, { getCutoffDate } from '../services/analyticsService.js';

const router = express.Router();

/**
 * SECURITY NOTE: SQL Injection Prevention
 *
 * All database queries in this file use parameterized queries (prepared statements) to prevent
 * SQL injection vulnerabilities. This is critical because:
 *
 * 1. These endpoints accept user input that gets inserted into database queries
 * 2. Without parameterization, malicious users could inject SQL commands through input fields
 * 3. Parameterized queries treat user input as data, not executable SQL code
 *
 * Example of UNSAFE code (never do this):
 *   db.prepare(`SELECT * FROM users WHERE id = ${userId}`).get()
 *   // An attacker could set userId to: "1 OR 1=1" to access all users
 *
 * Example of SAFE code (always use this pattern):
 *   db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
 *   // The ? placeholder safely escapes the input, preventing injection
 *
 * The database driver automatically escapes and sanitizes all parameters passed via .run(),
 * .get(), or .all() methods, making it impossible to execute arbitrary SQL commands.
 */

// Track page view (public endpoint - no auth required)
router.post('/track/pageview', (req, res) => {
  try {
    const { page_url, page_title, referrer, session_id, user_agent, viewport_width, viewport_height } = req.body;

    // Use parameterized query with ? placeholders to prevent SQL injection.
    // User input is passed separately via stmt.run() and is safely escaped by the database driver.
    const stmt = db.prepare(`
      INSERT INTO analytics_pageviews (
        page_url, page_title, referrer, session_id, user_agent,
        viewport_width, viewport_height, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    stmt.run(page_url, page_title, referrer || null, session_id, user_agent, viewport_width, viewport_height);

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error tracking page view:', error);
    res.status(500).json({ error: 'Failed to track page view' });
  }
});

// Track custom event (public endpoint - no auth required)
router.post('/track/event', (req, res) => {
  try {
    const { event_name, event_category, event_label, event_value, page_url, session_id, metadata } = req.body;

    const stmt = db.prepare(`
      INSERT INTO analytics_events (
        event_name, event_category, event_label, event_value,
        page_url, session_id, metadata, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    stmt.run(
      event_name,
      event_category || null,
      event_label || null,
      event_value || null,
      page_url,
      session_id,
      metadata ? JSON.stringify(metadata) : null
    );

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error tracking event:', error);
    res.status(500).json({ error: 'Failed to track event' });
  }
});

// Track user session (public endpoint - no auth required)
router.post('/track/session', (req, res) => {
  try {
    const { session_id, user_agent, device_type, browser, os, country, language } = req.body;

    // Check if session exists - using parameterized query to safely handle session_id from user input
    const existingSession = db.prepare('SELECT id FROM analytics_sessions WHERE session_id = ?').get(session_id);

    if (!existingSession) {
      const stmt = db.prepare(`
        INSERT INTO analytics_sessions (
          session_id, user_agent, device_type, browser, os,
          country, language, started_at, last_active_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `);

      stmt.run(session_id, user_agent, device_type, browser, os, country || null, language);
    } else {
      const stmt = db.prepare('UPDATE analytics_sessions SET last_active_at = datetime(\'now\') WHERE session_id = ?');
      stmt.run(session_id);
    }

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error tracking session:', error);
    res.status(500).json({ error: 'Failed to track session' });
  }
});

// Get analytics dashboard data (protected endpoint for admin users)
router.get('/dashboard', authenticateToken, (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;

    // Calculate date range
    let daysBack = 7;
    if (timeRange === '24h') daysBack = 1;
    else if (timeRange === '30d') daysBack = 30;
    else if (timeRange === '90d') daysBack = 90;

    // Date is calculated in JavaScript (getCutoffDate) and passed as a parameter
    // to prevent SQL injection. The service uses parameterized queries for all database operations.
    const cutoffDate = getCutoffDate(daysBack);

    // Use the consolidated analytics service which executes all 11 queries
    // in a single database transaction for optimal performance
    const dashboardData = analyticsService.getDashboardData(cutoffDate);

    res.json(dashboardData);
  } catch (error) {
    console.error('Error fetching analytics dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// Get real-time analytics (protected endpoint for admin users)
router.get('/realtime', authenticateToken, (req, res) => {
  try {
    // Use the consolidated analytics service which executes all 4 queries
    // in a single database transaction for optimal performance
    const realtimeData = analyticsService.getRealtimeData();

    res.json(realtimeData);
  } catch (error) {
    console.error('Error fetching real-time analytics:', error);
    res.status(500).json({ error: 'Failed to fetch real-time analytics' });
  }
});

export default router;
