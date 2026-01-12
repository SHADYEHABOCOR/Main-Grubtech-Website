const db = require('../db');

async function initializeAnalyticsTables() {
  try {
    // Analytics sessions table
    await db.run(`
      CREATE TABLE IF NOT EXISTS analytics_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL UNIQUE,
        user_agent TEXT,
        device_type TEXT,
        browser TEXT,
        os TEXT,
        country TEXT,
        language TEXT,
        started_at TEXT NOT NULL,
        last_active_at TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);

    // Analytics page views table
    await db.run(`
      CREATE TABLE IF NOT EXISTS analytics_pageviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        page_url TEXT NOT NULL,
        page_title TEXT,
        referrer TEXT,
        session_id TEXT NOT NULL,
        user_agent TEXT,
        viewport_width INTEGER,
        viewport_height INTEGER,
        created_at TEXT NOT NULL,
        FOREIGN KEY (session_id) REFERENCES analytics_sessions(session_id)
      )
    `);

    // Analytics events table
    await db.run(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_name TEXT NOT NULL,
        event_category TEXT,
        event_label TEXT,
        event_value REAL,
        page_url TEXT,
        session_id TEXT NOT NULL,
        metadata TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (session_id) REFERENCES analytics_sessions(session_id)
      )
    `);

    // Create indexes for better query performance
    await db.run('CREATE INDEX IF NOT EXISTS idx_pageviews_created_at ON analytics_pageviews(created_at)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_pageviews_session_id ON analytics_pageviews(session_id)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_pageviews_page_url ON analytics_pageviews(page_url)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_events_created_at ON analytics_events(created_at)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_events_session_id ON analytics_events(session_id)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_events_event_name ON analytics_events(event_name)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON analytics_sessions(started_at)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON analytics_sessions(session_id)');

    // Composite indexes for common query patterns
    await db.run('CREATE INDEX IF NOT EXISTS idx_pageviews_created_at_page_url ON analytics_pageviews(created_at, page_url)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_pageviews_created_at_session_id ON analytics_pageviews(created_at, session_id)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_events_created_at_name_category ON analytics_events(created_at, event_name, event_category)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_sessions_started_at_device_type ON analytics_sessions(started_at, device_type)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_sessions_started_at_browser ON analytics_sessions(started_at, browser)');

    console.log('Analytics tables initialized successfully');
  } catch (error) {
    console.error('Error initializing analytics tables:', error);
    throw error;
  }
}

module.exports = { initializeAnalyticsTables };
