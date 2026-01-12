-- Migration: Update integration logo paths from /src/assets/ to /integration-logos/
-- Date: 2025-11-07
-- Description: Move integration logos from src/assets (dev-only) to public folder for production builds

UPDATE integrations
SET logo_url = REPLACE(logo_url, '/src/assets/integration logos/', '/integration-logos/')
WHERE logo_url LIKE '/src/assets/integration logos/%';

-- Verify the update
SELECT id, name, logo_url FROM integrations;
