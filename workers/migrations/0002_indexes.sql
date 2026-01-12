-- Grubtech D1 Indexes Migration
-- This migration creates all indexes for optimized query performance
-- Compatible with Cloudflare D1 (SQLite)

-- =============================================================================
-- Team Members Indexes
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);
CREATE INDEX IF NOT EXISTS idx_team_members_department ON team_members(department);
CREATE INDEX IF NOT EXISTS idx_team_members_display_order ON team_members(display_order);

-- =============================================================================
-- Refresh Tokens Indexes
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- =============================================================================
-- Policy Pages Indexes
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_policy_pages_slug ON policy_pages(slug);

-- =============================================================================
-- Analytics Pageviews Indexes
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_pageviews_created_at ON analytics_pageviews(created_at);
CREATE INDEX IF NOT EXISTS idx_pageviews_session_id ON analytics_pageviews(session_id);
CREATE INDEX IF NOT EXISTS idx_pageviews_page_url ON analytics_pageviews(page_url);

-- =============================================================================
-- Analytics Events Indexes
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_event_name ON analytics_events(event_name);

-- =============================================================================
-- Analytics Sessions Indexes
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON analytics_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON analytics_sessions(session_id);

-- =============================================================================
-- Integration Requests Indexes
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_integration_requests_status ON integration_requests(status);
CREATE INDEX IF NOT EXISTS idx_integration_requests_created_at ON integration_requests(created_at);

-- =============================================================================
-- Composite Indexes for Common Query Patterns
-- =============================================================================

-- Pageviews composite indexes
CREATE INDEX IF NOT EXISTS idx_pageviews_created_at_page_url ON analytics_pageviews(created_at, page_url);
CREATE INDEX IF NOT EXISTS idx_pageviews_created_at_session_id ON analytics_pageviews(created_at, session_id);

-- Events composite indexes
CREATE INDEX IF NOT EXISTS idx_events_created_at_name_category ON analytics_events(created_at, event_name, event_category);

-- Sessions composite indexes
CREATE INDEX IF NOT EXISTS idx_sessions_started_at_device_type ON analytics_sessions(started_at, device_type);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at_browser ON analytics_sessions(started_at, browser);

-- Blog posts composite index
CREATE INDEX IF NOT EXISTS idx_blog_posts_status_created_at ON blog_posts(status, created_at);

-- Integrations composite indexes
CREATE INDEX IF NOT EXISTS idx_integrations_category_display_order ON integrations(category, display_order);
CREATE INDEX IF NOT EXISTS idx_integrations_status_category_order ON integrations(status, category, display_order);

-- Video galleries composite index
CREATE INDEX IF NOT EXISTS idx_video_galleries_active_order ON video_galleries(is_active, display_order);

-- Team members composite index
CREATE INDEX IF NOT EXISTS idx_team_members_status_order_created ON team_members(status, display_order, created_at);

-- Job vacancies composite index
CREATE INDEX IF NOT EXISTS idx_job_vacancies_status_created_at ON job_vacancies(status, created_at);

-- Leads composite indexes
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_form_type_created_at ON leads(form_type, created_at);

-- Job applications composite index
CREATE INDEX IF NOT EXISTS idx_job_applications_status_created_at ON job_applications(status, created_at);

-- Refresh tokens composite index for valid token lookups
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_valid ON refresh_tokens(user_id, revoked_at, expires_at);

-- Policy pages composite index
CREATE INDEX IF NOT EXISTS idx_policy_pages_slug_status ON policy_pages(slug, status);
