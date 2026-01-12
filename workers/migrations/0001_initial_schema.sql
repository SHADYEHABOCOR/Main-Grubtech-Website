-- Grubtech D1 Initial Schema Migration
-- This migration creates all tables required for the Grubtech CMS
-- Compatible with Cloudflare D1 (SQLite)

-- =============================================================================
-- Users & Authentication
-- =============================================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Refresh tokens table for secure token refresh flow
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token_hash TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  revoked_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================================================
-- Content Management
-- =============================================================================

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title_en TEXT NOT NULL,
  title_ar TEXT,
  title_es TEXT,
  title_pt TEXT,
  content_en TEXT NOT NULL,
  content_ar TEXT,
  content_es TEXT,
  content_pt TEXT,
  slug TEXT UNIQUE NOT NULL,
  featured_image TEXT,
  status TEXT DEFAULT 'draft',
  language TEXT DEFAULT 'en',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  company_logo TEXT,
  headline TEXT,
  headline_ar TEXT,
  headline_es TEXT,
  headline_pt TEXT,
  content TEXT NOT NULL,
  content_ar TEXT,
  content_es TEXT,
  content_pt TEXT,
  image TEXT,
  rating INTEGER DEFAULT 5,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Website content table - for editable text across the site
CREATE TABLE IF NOT EXISTS website_content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section TEXT UNIQUE NOT NULL,
  content_en TEXT,
  content_ar TEXT,
  content_es TEXT,
  content_pt TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Policy pages table - for legal/policy content (Privacy, Terms, etc.)
CREATE TABLE IF NOT EXISTS policy_pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title_en TEXT NOT NULL,
  title_ar TEXT,
  title_es TEXT,
  title_pt TEXT,
  content_en TEXT NOT NULL,
  content_ar TEXT,
  content_es TEXT,
  content_pt TEXT,
  meta_description TEXT,
  status TEXT DEFAULT 'published',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Video galleries table
CREATE TABLE IF NOT EXISTS video_galleries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title_en TEXT NOT NULL,
  title_ar TEXT,
  title_es TEXT,
  title_pt TEXT,
  description_en TEXT,
  description_ar TEXT,
  description_es TEXT,
  description_pt TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  logo_url TEXT,
  duration INTEGER,
  display_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- Team & Careers
-- =============================================================================

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_en TEXT NOT NULL,
  name_ar TEXT,
  name_es TEXT,
  name_pt TEXT,
  title_en TEXT NOT NULL,
  title_ar TEXT,
  title_es TEXT,
  title_pt TEXT,
  department TEXT NOT NULL,
  bio_en TEXT,
  bio_ar TEXT,
  bio_es TEXT,
  bio_pt TEXT,
  email TEXT,
  linkedin TEXT,
  image TEXT,
  display_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Job vacancies table
CREATE TABLE IF NOT EXISTS job_vacancies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT DEFAULT 'Full-time',
  description TEXT,
  requirements TEXT,
  application_link TEXT,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Job applications table
CREATE TABLE IF NOT EXISTS job_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  linkedin TEXT,
  expertise TEXT,
  cv_path TEXT,
  message TEXT,
  status TEXT DEFAULT 'new',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- Integrations & Partners
-- =============================================================================

-- Integrations table
CREATE TABLE IF NOT EXISTS integrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  display_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Integration requests table - for partner integration requests
CREATE TABLE IF NOT EXISTS integration_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  company_name TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- Leads & Marketing
-- =============================================================================

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  restaurant_type TEXT,
  message TEXT,
  form_type TEXT DEFAULT 'contact',
  source_page TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- Analytics
-- =============================================================================

-- Analytics sessions table
CREATE TABLE IF NOT EXISTS analytics_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT UNIQUE NOT NULL,
  user_agent TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  country TEXT,
  language TEXT,
  started_at TEXT NOT NULL,
  last_active_at TEXT NOT NULL
);

-- Analytics pageviews table
CREATE TABLE IF NOT EXISTS analytics_pageviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_url TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  session_id TEXT NOT NULL,
  user_agent TEXT,
  viewport_width INTEGER,
  viewport_height INTEGER,
  created_at TEXT NOT NULL
);

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_name TEXT NOT NULL,
  event_category TEXT,
  event_label TEXT,
  event_value REAL,
  page_url TEXT,
  session_id TEXT NOT NULL,
  metadata TEXT,
  created_at TEXT NOT NULL
);
