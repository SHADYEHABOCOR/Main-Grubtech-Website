import express, { Request, Response } from 'express';
import db from '../config/database.js';

const router = express.Router();

/**
 * Static routes configuration for sitemap
 */
interface SitemapUrl {
  loc: string;
  changefreq?: string;
  priority?: number;
  lastmod?: string;
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
  { loc: '/blog', changefreq: 'daily', priority: 0.8 }
];

/**
 * Generate sitemap URL entry
 */
/**
 * Generate sitemap URL entry
 */
const generateUrlEntry = (baseUrl: string, url: any) => {
  const lastmod = url.lastmod || new Date().toISOString().split('T')[0];

  return `  <url>
    <loc>${baseUrl}${url.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority !== undefined ? `<priority>${url.priority}</priority>` : ''}
  </url>`;
};

/**
 * GET /api/sitemap.xml
 * Generate and return XML sitemap
 */
router.get('/sitemap.xml', async (req: Request, res: Response) => {
  try {
    const baseUrl = process.env.BASE_URL || 'https://grubtech.com';
    const urls = [...STATIC_ROUTES];

    // Fetch blog posts
    try {
      const posts = db.prepare('SELECT slug, updated_at, created_at FROM blog_posts WHERE published = 1').all();

      posts.forEach((post: any) => {
        urls.push({
          loc: `/blog/${post.slug}`,
          lastmod: post.updated_at || post.created_at,
          changefreq: 'monthly',
          priority: 0.7
        });
      });
    } catch (error) {
      console.error('Error fetching blog posts for sitemap:', error);
    }

    // Fetch careers
    try {
      const careers = db.prepare('SELECT id, updated_at, created_at FROM careers WHERE status = ?').all('open');

      careers.forEach((career: any) => {
        urls.push({
          loc: `/careers#${career.id}`,
          lastmod: career.updated_at || career.created_at,
          changefreq: 'weekly',
          priority: 0.6
        });
      });
    } catch (error) {
      console.error('Error fetching careers for sitemap:', error);
    }

    // Fetch integrations
    try {
      const integrations = db.prepare('SELECT id, updated_at, created_at FROM integrations WHERE active = 1').all();

      integrations.forEach((integration: any) => {
        urls.push({
          loc: `/integrations#${integration.id}`,
          lastmod: integration.updated_at || integration.created_at,
          changefreq: 'monthly',
          priority: 0.6
        });
      });
    } catch (error) {
      console.error('Error fetching integrations for sitemap:', error);
    }

    // Generate XML
    const urlEntries = urls.map(url => generateUrlEntry(baseUrl, url)).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
});

/**
 * GET /api/robots.txt
 * Generate and return robots.txt
 */
router.get('/robots.txt', (req: Request, res: Response) => {
  const baseUrl = process.env.BASE_URL || 'https://grubtech.com';

  const robotsTxt = `# Robots.txt for Grubtech
User-agent: *
Allow: /

# Disallow admin routes
Disallow: /admin/
Disallow: /api/

# Sitemap
Sitemap: ${baseUrl}/api/sitemap.xml
`;

  res.header('Content-Type', 'text/plain');
  res.send(robotsTxt);
});

export default router;
