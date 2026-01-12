/**
 * PageHead Component
 *
 * Dynamic resource hints management based on page requirements.
 * This component allows pages to specify exactly which preconnects,
 * prefetches, and other resource hints they need, reducing unnecessary
 * network requests on pages that don't need certain resources.
 *
 * Performance Benefits:
 * - Static pages (legal, privacy) don't load analytics preconnects
 * - Video pages get YouTube/Vimeo preconnects only when needed
 * - Font preconnects are always included for consistent typography
 */

import { Helmet } from 'react-helmet-async';

export interface PageHeadProps {
  /** Include preconnects for font CDNs (default: true) */
  includeFonts?: boolean;
  /** Include preconnects for analytics services (default: true) */
  includeAnalytics?: boolean;
  /** Include preconnects for video platforms (default: false) */
  includeVideoPlatforms?: boolean;
  /** Additional preconnect URLs specific to this page */
  preconnects?: string[];
  /** Additional dns-prefetch URLs for non-critical resources */
  dnsPrefetch?: string[];
  /** Preload critical resources (fonts, images, etc.) */
  preloads?: Array<{
    href: string;
    as: 'font' | 'image' | 'script' | 'style' | 'fetch';
    type?: string;
    crossOrigin?: 'anonymous' | 'use-credentials';
  }>;
}

// Core resource hint domains
const FONT_DOMAINS = [
  'https://api.fontshare.com',
  'https://cdn.fontshare.com',
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
];

const ANALYTICS_DOMAINS = [
  'https://www.googletagmanager.com',
  'https://www.google-analytics.com',
  'https://static.hotjar.com',
];

const VIDEO_DOMAINS = [
  'https://www.youtube.com',
  'https://img.youtube.com',
  'https://i.ytimg.com',
  'https://player.vimeo.com',
  'https://vimeo.com',
];

export function PageHead({
  includeFonts = true,
  includeAnalytics = true,
  includeVideoPlatforms = false,
  preconnects = [],
  dnsPrefetch = [],
  preloads = [],
}: PageHeadProps) {
  // Build the list of preconnect domains
  const preconnectDomains: string[] = [];

  if (includeFonts) {
    preconnectDomains.push(...FONT_DOMAINS);
  }

  // Add custom preconnects
  preconnectDomains.push(...preconnects);

  // Build dns-prefetch list (for less critical resources)
  const dnsPrefetchDomains: string[] = [...dnsPrefetch];

  if (includeAnalytics) {
    dnsPrefetchDomains.push(...ANALYTICS_DOMAINS);
  }

  if (includeVideoPlatforms) {
    dnsPrefetchDomains.push(...VIDEO_DOMAINS);
  }

  return (
    <Helmet>
      {/* Preconnect for critical resources */}
      {preconnectDomains.map((domain) => (
        <link
          key={`preconnect-${domain}`}
          rel="preconnect"
          href={domain}
          crossOrigin="anonymous"
        />
      ))}

      {/* DNS Prefetch for non-critical resources */}
      {dnsPrefetchDomains.map((domain) => (
        <link
          key={`dns-prefetch-${domain}`}
          rel="dns-prefetch"
          href={domain}
        />
      ))}

      {/* Preload critical resources */}
      {preloads.map((preload) => (
        <link
          key={`preload-${preload.href}`}
          rel="preload"
          href={preload.href}
          as={preload.as}
          type={preload.type}
          crossOrigin={preload.crossOrigin}
        />
      ))}
    </Helmet>
  );
}

/**
 * Preset configurations for common page types
 */

/** For static content pages like privacy policy, terms, etc. */
export const STATIC_PAGE_HEAD_PROPS: PageHeadProps = {
  includeFonts: true,
  includeAnalytics: false,
  includeVideoPlatforms: false,
};

/** For pages that embed video content */
export const VIDEO_PAGE_HEAD_PROPS: PageHeadProps = {
  includeFonts: true,
  includeAnalytics: true,
  includeVideoPlatforms: true,
};

/** For the main marketing pages */
export const MARKETING_PAGE_HEAD_PROPS: PageHeadProps = {
  includeFonts: true,
  includeAnalytics: true,
  includeVideoPlatforms: false,
};

/** For admin pages (minimal external resources) */
export const ADMIN_PAGE_HEAD_PROPS: PageHeadProps = {
  includeFonts: true,
  includeAnalytics: false,
  includeVideoPlatforms: false,
};
