import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Resource hints configuration for different routes
 * Maps route patterns to their critical resources
 */
const ROUTE_RESOURCES: Record<string, {
  images?: string[];
  scripts?: string[];
  styles?: string[];
}> = {
  '/': {
    // Home page hero images - preload the logo/brand images
  },
  '/about': {
    // About page has team member images above fold
  },
};

/**
 * Preload a single image
 */
export const preloadImage = (src: string): void => {
  if (!src || typeof window === 'undefined') return;

  // Check if already preloaded
  const existing = document.querySelector(`link[rel="preload"][href="${src}"]`);
  if (existing) return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  document.head.appendChild(link);
};

/**
 * Preload multiple images
 */
export const preloadImages = (srcs: string[]): void => {
  srcs.forEach(preloadImage);
};

/**
 * Prefetch a resource (lower priority than preload)
 */
export const prefetchResource = (href: string, as?: string): void => {
  if (!href || typeof window === 'undefined') return;

  const existing = document.querySelector(`link[rel="prefetch"][href="${href}"]`);
  if (existing) return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  if (as) link.setAttribute('as', as);
  document.head.appendChild(link);
};

/**
 * Hook to preload images for a specific route
 */
export const useRoutePreload = (): void => {
  const location = useLocation();

  useEffect(() => {
    // Find matching route resources
    const pathname = location.pathname.replace(/^\/[a-z]{2}\//, '/'); // Strip language prefix
    const resources = ROUTE_RESOURCES[pathname];

    if (resources?.images) {
      preloadImages(resources.images);
    }
  }, [location.pathname]);
};

/**
 * Hook to preload a single image
 */
export const usePreloadImage = (src: string | undefined): void => {
  useEffect(() => {
    if (src) {
      preloadImage(src);
    }
  }, [src]);
};

/**
 * Hook to prefetch likely next routes
 * Call this after the main page has loaded
 */
export const usePrefetchRoutes = (routes: string[]): void => {
  useEffect(() => {
    // Wait for page to be fully loaded before prefetching
    if (document.readyState === 'complete') {
      routes.forEach(route => prefetchResource(route, 'document'));
    } else {
      window.addEventListener('load', () => {
        // Use requestIdleCallback if available for better performance
        if (window.requestIdleCallback) {
          window.requestIdleCallback(() => {
            routes.forEach(route => prefetchResource(route, 'document'));
          });
        } else {
          setTimeout(() => {
            routes.forEach(route => prefetchResource(route, 'document'));
          }, 1000);
        }
      }, { once: true });
    }
  }, [routes]);
};

interface ResourcePreloaderProps {
  images?: string[];
  prefetchRoutes?: string[];
}

/**
 * Component to preload critical resources for a page
 *
 * Usage:
 * <ResourcePreloader
 *   images={[heroImage, logoImage]}
 *   prefetchRoutes={['/about', '/pricing']}
 * />
 */
export const ResourcePreloader: React.FC<ResourcePreloaderProps> = ({
  images = [],
  prefetchRoutes = [],
}) => {
  // Preload images immediately
  useEffect(() => {
    images.forEach(preloadImage);
  }, [images]);

  // Prefetch likely next routes after load
  usePrefetchRoutes(prefetchRoutes);

  return null;
};
