/**
 * Sitemap & SEO Routes for Cloudflare Workers
 *
 * Provides endpoints for SEO-related content including sitemap.xml and robots.txt.
 * These endpoints are public and generate dynamic content based on database entries.
 *
 * Endpoints:
 * - GET /sitemap.xml  - Generate XML sitemap with all pages
 * - GET /robots.txt   - Generate robots.txt with sitemap reference
 */

import { Hono } from 'hono';
import type { Env, Variables } from '../types/bindings';
import { createDatabaseService } from '../db';

/**
 * URL entry for sitemap
 */
interface SitemapUrl {
  loc: string;
  changefreq?: string;
  priority?: number;
  lastmod?: string;
}

/**
 * Blog post record from database
 */
interface BlogPostRecord {
  slug: string;
  updated_at: string | null;
  created_at: string;
}

/**
 * Career record from database
 */
interface CareerRecord {
  id: number;
  updated_at: string | null;
  created_at: string;
}

/**
 * Integration record from database
 */
interface IntegrationRecord {
  id: number;
  updated_at: string | null;
  created_at: string;
}

/**
 * Static routes configuration for sitemap
 */
const STATIC_ROUTES: SitemapUrl[] = [
  // Home
  { loc: '/', changefreq: 'daily', priority: 1.0 },

  // Main pages
  { loc: '/about', changefreq: 'monthly', priority: 0.8 },
  { loc: '/contact', changefreq: 'monthly', priority: 0.8 },
  { loc: '/connect', changefreq: 'monthly', priority: 0.8 },
  { loc: '/careers', changefreq: 'weekly', priority: 0.7 },
  { loc: '/faqs', changefreq: 'monthly', priority: 0.7 },
  { loc: '/integrations', changefreq: 'weekly', priority: 0.8 },
  { loc: '/video-showcase', changefreq: 'monthly', priority: 0.6 },

  // Solutions
  { loc: '/solutions/g-online', changefreq: 'monthly', priority: 0.9 },
  { loc: '/solutions/g-online-lite', changefreq: 'monthly', priority: 0.9 },
  { loc: '/solutions/g-kds', changefreq: 'monthly', priority: 0.9 },
  { loc: '/solutions/g-dispatch', changefreq: 'monthly', priority: 0.9 },
  { loc: '/solutions/g-data', changefreq: 'monthly', priority: 0.9 },

  // Personas
  { loc: '/persona/smbs', changefreq: 'monthly', priority: 0.8 },
  { loc: '/persona/regional-chains', changefreq: 'monthly', priority: 0.8 },
  { loc: '/persona/global-chains', changefreq: 'monthly', priority: 0.8 },
  { loc: '/persona/dark-kitchens', changefreq: 'monthly', priority: 0.8 },

  // Regional
  { loc: '/gcc', changefreq: 'monthly', priority: 0.7 },
  { loc: '/mea', changefreq: 'monthly', priority: 0.7 },
  { loc: '/sea', changefreq: 'monthly', priority: 0.7 },

  // Legal
  { loc: '/legal/privacy', changefreq: 'yearly', priority: 0.5 },
  { loc: '/legal/terms', changefreq: 'yearly', priority: 0.5 },
  { loc: '/legal/dpa', changefreq: 'yearly', priority: 0.5 },
  { loc: '/legal/sla', changefreq: 'yearly', priority: 0.5 },
  { loc: '/legal/gdpr', changefreq: 'yearly', priority: 0.5 },
  { loc: '/legal/cookie-settings', changefreq: 'yearly', priority: 0.4 },

  // Blog
  { loc: '/blog', changefreq: 'daily', priority: 0.8 },
];

/**
 * Generate sitemap URL entry XML
 */
const generateUrlEntry = (baseUrl: string, url: SitemapUrl): string => {
  const lastmod = url.lastmod || new Date().toISOString().split('T')[0];

  return `  <url>
    <loc>${baseUrl}${url.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority !== undefined ? `<priority>${url.priority}</priority>` : ''}
  </url>`;
};

// Create sitemap router
const sitemapRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

/**
 * GET /api/sitemap.xml
 * Generate and return XML sitemap
 *
 * Includes:
 * - Static routes (pages, solutions, legal)
 * - Dynamic blog post URLs from database
 * - Dynamic career listings from database
 * - Dynamic integration references from database
 */
sitemapRoutes.get('/sitemap.xml', async (c) => {
  try {
    // Use BASE_URL from environment or default to grubtech.com
    const baseUrl = 'https://grubtech.com';
    const urls: SitemapUrl[] = [...STATIC_ROUTES];

    const db = createDatabaseService(c.env);

    // Fetch blog posts
    try {
      const posts = await db.query<BlogPostRecord>(
        'SELECT slug, updated_at, created_at FROM blog_posts WHERE published = 1'
      );

      posts.forEach((post) => {
        urls.push({
          loc: `/blog/${post.slug}`,
          lastmod: post.updated_at || post.created_at,
          changefreq: 'monthly',
          priority: 0.7,
        });
      });
    } catch {
      // Silently fail - blog posts are optional for sitemap
    }

    // Fetch careers
    try {
      const careers = await db.query<CareerRecord>(
        "SELECT id, updated_at, created_at FROM job_vacancies WHERE status = 'open'"
      );

      careers.forEach((career) => {
        urls.push({
          loc: `/careers#${career.id}`,
          lastmod: career.updated_at || career.created_at,
          changefreq: 'weekly',
          priority: 0.6,
        });
      });
    } catch {
      // Silently fail - careers are optional for sitemap
    }

    // Fetch integrations
    try {
      const integrations = await db.query<IntegrationRecord>(
        'SELECT id, updated_at, created_at FROM integrations WHERE active = 1'
      );

      integrations.forEach((integration) => {
        urls.push({
          loc: `/integrations#${integration.id}`,
          lastmod: integration.updated_at || integration.created_at,
          changefreq: 'monthly',
          priority: 0.6,
        });
      });
    } catch {
      // Silently fail - integrations are optional for sitemap
    }

    // Generate XML
    const urlEntries = urls.map((url) => generateUrlEntry(baseUrl, url)).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

    return c.body(xml, 200, {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    });
  } catch {
    return c.json(
      {
        success: false,
        error: 'Failed to generate sitemap',
      },
      500
    );
  }
});

/**
 * GET /api/robots.txt
 * Generate and return robots.txt
 *
 * Allows all crawlers access to public content,
 * disallows admin and API routes, and provides sitemap location.
 */
sitemapRoutes.get('/robots.txt', (c) => {
  const baseUrl = 'https://grubtech.com';

  const robotsTxt = `# Robots.txt for Grubtech
User-agent: *
Allow: /

# Disallow admin routes
Disallow: /admin/
Disallow: /api/

# Sitemap
Sitemap: ${baseUrl}/api/sitemap.xml
`;

  return c.body(robotsTxt, 200, {
    'Content-Type': 'text/plain',
    'Cache-Control': 'public, max-age=86400',
  });
});

export { sitemapRoutes };
export default sitemapRoutes;
