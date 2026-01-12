/**
 * XML Sitemap generation utilities
 */

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

// API response types for sitemap generation
interface BlogPostResponse {
  slug: string;
  updated_at?: string;
  created_at?: string;
}

interface CareerResponse {
  id: number | string;
  updated_at?: string;
  created_at?: string;
}

interface IntegrationResponse {
  id: number | string;
  updated_at?: string;
  created_at?: string;
}

/**
 * Static routes configuration for sitemap
 */
export const STATIC_ROUTES: SitemapUrl[] = [
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
 * Generate XML sitemap content
 */
export const generateSitemap = (
  baseUrl: string,
  staticRoutes: SitemapUrl[],
  dynamicUrls?: SitemapUrl[]
): string => {
  const allUrls = [...staticRoutes, ...(dynamicUrls || [])];

  const urlElements = allUrls.map(url => {
    const lastmod = url.lastmod || new Date().toISOString().split('T')[0];

    return `  <url>
    <loc>${baseUrl}${url.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority !== undefined ? `<priority>${url.priority}</priority>` : ''}
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
};

/**
 * Fetch dynamic blog posts for sitemap
 */
export const fetchBlogUrls = async (apiBaseUrl: string): Promise<SitemapUrl[]> => {
  try {
    const response = await fetch(`${apiBaseUrl}/api/blog/posts`);
    if (!response.ok) return [];

    const posts: BlogPostResponse[] = await response.json();
    return posts.map((post) => ({
      loc: `/blog/${post.slug}`,
      lastmod: post.updated_at || post.created_at,
      changefreq: 'monthly' as const,
      priority: 0.7
    }));
  } catch (error) {
    console.error('Error fetching blog URLs for sitemap:', error);
    return [];
  }
};

/**
 * Fetch dynamic career posts for sitemap
 */
export const fetchCareerUrls = async (apiBaseUrl: string): Promise<SitemapUrl[]> => {
  try {
    const response = await fetch(`${apiBaseUrl}/api/careers`);
    if (!response.ok) return [];

    const careers: CareerResponse[] = await response.json();
    return careers.map((career) => ({
      loc: `/careers#${career.id}`,
      lastmod: career.updated_at || career.created_at,
      changefreq: 'weekly' as const,
      priority: 0.6
    }));
  } catch (error) {
    console.error('Error fetching career URLs for sitemap:', error);
    return [];
  }
};

/**
 * Fetch dynamic integration pages for sitemap
 */
export const fetchIntegrationUrls = async (apiBaseUrl: string): Promise<SitemapUrl[]> => {
  try {
    const response = await fetch(`${apiBaseUrl}/api/integrations`);
    if (!response.ok) return [];

    const integrations: IntegrationResponse[] = await response.json();
    return integrations.map((integration) => ({
      loc: `/integrations#${integration.id}`,
      lastmod: integration.updated_at || integration.created_at,
      changefreq: 'monthly' as const,
      priority: 0.6
    }));
  } catch (error) {
    console.error('Error fetching integration URLs for sitemap:', error);
    return [];
  }
};

/**
 * Generate complete sitemap with all dynamic content
 */
export const generateCompleteSitemap = async (
  baseUrl: string,
  apiBaseUrl: string
): Promise<string> => {
  const [blogUrls, careerUrls, integrationUrls] = await Promise.all([
    fetchBlogUrls(apiBaseUrl),
    fetchCareerUrls(apiBaseUrl),
    fetchIntegrationUrls(apiBaseUrl)
  ]);

  const dynamicUrls = [...blogUrls, ...careerUrls, ...integrationUrls];

  return generateSitemap(baseUrl, STATIC_ROUTES, dynamicUrls);
};
