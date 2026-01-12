import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface ScrollPosition {
  x: number;
  y: number;
}

// In-memory storage for scroll positions (persists during session)
const scrollPositions = new Map<string, ScrollPosition>();

/**
 * Helper function to scroll - uses Lenis if available, falls back to window.scrollTo
 */
function scrollTo(top: number, immediate = true) {
  // Try to use Lenis if available (for smooth scroll compatibility)
  if (window.lenis) {
    window.lenis.scrollTo(top, { immediate });
  } else {
    window.scrollTo({ top, behavior: immediate ? 'instant' : 'smooth' });
  }
}

/**
 * Hook to restore scroll position when navigating with browser back/forward buttons
 *
 * Features:
 * - Saves scroll position before navigation
 * - Restores position on back/forward navigation
 * - Scrolls to top on new page navigation
 * - Works with Lenis smooth scroll
 *
 * @param options Configuration options
 * @param options.scrollToTop Whether to scroll to top on new navigation (default: true)
 * @param options.delay Delay before restoring scroll position in ms (default: 100)
 */
export function useScrollRestoration(options: {
  scrollToTop?: boolean;
  delay?: number;
} = {}) {
  const { scrollToTop = true, delay = 100 } = options;
  const location = useLocation();
  const prevPathRef = useRef<string | null>(null);
  const isPopStateRef = useRef(false);

  // Track popstate events (back/forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      isPopStateRef.current = true;
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Save scroll position before navigation
  useEffect(() => {
    const handleBeforeUnload = () => {
      const key = location.pathname + location.search;
      scrollPositions.set(key, {
        x: window.scrollX,
        y: window.scrollY,
      });
    };

    // Save on scroll (debounced)
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const key = location.pathname + location.search;
        scrollPositions.set(key, {
          x: window.scrollX,
          y: window.scrollY,
        });
      }, 100);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [location]);

  // Restore scroll position on location change
  useEffect(() => {
    const currentPath = location.pathname + location.search;
    const prevPath = prevPathRef.current;

    // If this is a popstate navigation (back/forward), try to restore position
    if (isPopStateRef.current) {
      isPopStateRef.current = false;

      const savedPosition = scrollPositions.get(currentPath);
      if (savedPosition) {
        // Delay to allow page content to render
        setTimeout(() => {
          scrollTo(savedPosition.y, true);
        }, delay);
        return;
      }
    }

    // For new navigation, scroll to top if enabled
    // Only scroll to top if the pathname changed, not just query params
    const prevPathname = prevPath?.split('?')[0] || null;
    const currentPathname = location.pathname;

    if (scrollToTop && prevPathname !== null && prevPathname !== currentPathname) {
      // Check if there's a hash in the URL
      if (location.hash) {
        // Let the browser handle hash navigation
        const element = document.querySelector(location.hash);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth' });
          }, delay);
        }
      } else {
        // Scroll to top immediately on new page navigation
        scrollTo(0, true);
      }
    }

    prevPathRef.current = currentPath;
  }, [location, scrollToTop, delay]);
}

/**
 * Component version of scroll restoration
 * Add this inside your Router component
 *
 * @example
 * <Router>
 *   <ScrollRestoration />
 *   <Routes>...</Routes>
 * </Router>
 */
export function ScrollRestoration({ scrollToTop = true, delay = 100 }: {
  scrollToTop?: boolean;
  delay?: number;
} = {}) {
  useScrollRestoration({ scrollToTop, delay });
  return null;
}

export default useScrollRestoration;
