import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

const DEFAULT_TITLE = 'Grubtech: Unified Restaurant Operations and Management Platform';
const DEFAULT_DESCRIPTION = 'Effortlessly operate, delegate, and manage your entire restaurant! Grubtech brings all restaurant touchpoints to your fingertips through a single dashboard.';
const DEFAULT_KEYWORDS = 'restaurant management, restaurant operations, POS integration, online ordering, delivery management, kitchen display system, restaurant analytics, multi-location restaurant, food service technology';
const DEFAULT_IMAGE = 'https://grubtech.com/og-image.png';
const SITE_URL = 'https://grubtech.com';

/**
 * SEO Component - Manages meta tags, Open Graph, Twitter Cards, and canonical URLs
 */
export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  image = DEFAULT_IMAGE,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  canonical,
  noindex = false,
  nofollow = false
}: SEOProps) {
  const location = useLocation();

  const fullTitle = title ? `${title} | Grubtech` : DEFAULT_TITLE;
  const canonicalUrl = canonical || `${SITE_URL}${location.pathname}`;

  useEffect(() => {
    // Update title
    document.title = fullTitle;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);

      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }

      element.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);

    // Robots meta tag
    if (noindex || nofollow) {
      const robotsContent = [
        noindex ? 'noindex' : 'index',
        nofollow ? 'nofollow' : 'follow'
      ].join(', ');
      updateMetaTag('robots', robotsContent);
    }

    // Open Graph tags
    updateMetaTag('og:title', fullTitle, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:url', canonicalUrl, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:site_name', 'Grubtech', true);

    // Article-specific Open Graph tags
    if (type === 'article') {
      if (publishedTime) {
        updateMetaTag('article:published_time', publishedTime, true);
      }
      if (modifiedTime) {
        updateMetaTag('article:modified_time', modifiedTime, true);
      }
      if (author) {
        updateMetaTag('article:author', author, true);
      }
    }

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);

    // Update or create canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

  }, [fullTitle, description, keywords, image, type, publishedTime, modifiedTime, author, canonicalUrl, noindex, nofollow]);

  return null;
}

/**
 * Hook to get current page URL for canonical links
 */
export const useCanonicalUrl = (path?: string): string => {
  const location = useLocation();
  return `${SITE_URL}${path || location.pathname}`;
};
