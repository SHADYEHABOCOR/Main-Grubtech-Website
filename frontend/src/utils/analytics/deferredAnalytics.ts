/**
 * Deferred Analytics Loader
 *
 * Implements a performance-optimized analytics loading strategy:
 * 1. Delays loading of analytics scripts until after critical content
 * 2. Excludes analytics from certain routes (legal pages, etc.)
 * 3. Uses requestIdleCallback when available for non-blocking loading
 * 4. Respects user consent preferences
 *
 * This reduces initial page load time and HTTP requests on pages
 * where analytics aren't needed.
 */

import { cookieManager } from '../cookies/cookieManager';

// Configuration for deferred analytics loading
export const ANALYTICS_CONFIG = {
  // Routes where analytics should NOT be loaded
  excludedRoutes: [
    '/privacy-policy',
    '/terms-and-conditions',
    '/dpa',
    '/service-level-agreement',
    '/gdpr-eu',
    '/cookie-settings',
    // Include language-prefixed versions
    '/en/privacy-policy',
    '/en/terms-and-conditions',
    '/en/dpa',
    '/en/service-level-agreement',
    '/en/gdpr-eu',
    '/en/cookie-settings',
    '/ar/privacy-policy',
    '/ar/terms-and-conditions',
    '/ar/dpa',
    '/ar/service-level-agreement',
    '/ar/gdpr-eu',
    '/ar/cookie-settings',
    '/es/privacy-policy',
    '/es/terms-and-conditions',
    '/es/dpa',
    '/es/service-level-agreement',
    '/es/gdpr-eu',
    '/es/cookie-settings',
    '/pt/privacy-policy',
    '/pt/terms-and-conditions',
    '/pt/dpa',
    '/pt/service-level-agreement',
    '/pt/gdpr-eu',
    '/pt/cookie-settings',
  ],

  // Delay in ms before loading analytics (allows LCP to complete)
  delayMs: 3000,

  // Use requestIdleCallback if available
  useIdleCallback: true,

  // Timeout for idle callback (fallback to setTimeout)
  idleCallbackTimeout: 5000,
};

interface AnalyticsState {
  ga4Loaded: boolean;
  hotjarLoaded: boolean;
  clarityLoaded: boolean;
  initialized: boolean;
}

const state: AnalyticsState = {
  ga4Loaded: false,
  hotjarLoaded: false,
  clarityLoaded: false,
  initialized: false,
};

/**
 * Check if current route should have analytics
 */
export function shouldLoadAnalytics(pathname: string = window.location.pathname): boolean {
  // Check if route is excluded
  const isExcluded = ANALYTICS_CONFIG.excludedRoutes.some(
    (route) => pathname === route || pathname.endsWith(route)
  );

  if (isExcluded) {
    return false;
  }

  // Check user consent
  return cookieManager.isAllowed('analytics');
}

/**
 * Load Google Analytics 4
 */
function loadGA4(): Promise<void> {
  return new Promise((resolve) => {
    if (state.ga4Loaded) {
      resolve();
      return;
    }

    const ga4Id = import.meta.env.VITE_GA4_MEASUREMENT_ID;
    if (!ga4Id || import.meta.env.VITE_ENABLE_ANALYTICS !== 'true') {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`;
    script.onload = () => {
      // Initialize gtag
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: unknown[]) {
        window.dataLayer.push(args);
      }
      window.gtag = gtag as typeof window.gtag;

      gtag('js', new Date());

      // Configure with consent settings
      const consent = cookieManager.getConsent();
      gtag('consent', 'default', {
        analytics_storage: consent?.analytics ? 'granted' : 'denied',
        ad_storage: consent?.marketing ? 'granted' : 'denied',
        functionality_storage: consent?.preferences ? 'granted' : 'denied',
        personalization_storage: consent?.preferences ? 'granted' : 'denied',
      });

      gtag('config', ga4Id, {
        send_page_view: true,
        cookie_flags: 'SameSite=None;Secure',
      });

      state.ga4Loaded = true;
      console.log('[Perf] GA4 loaded (deferred)');
      resolve();
    };
    script.onerror = () => {
      console.warn('[Perf] GA4 failed to load');
      resolve();
    };

    document.head.appendChild(script);
  });
}

/**
 * Load Hotjar
 */
function loadHotjar(): Promise<void> {
  return new Promise((resolve) => {
    if (state.hotjarLoaded) {
      resolve();
      return;
    }

    const hotjarId = import.meta.env.VITE_HOTJAR_ID;
    if (!hotjarId) {
      resolve();
      return;
    }

    const hjid = parseInt(hotjarId);
    const hjsv = parseInt(import.meta.env.VITE_HOTJAR_SV || '6');

    // Initialize Hotjar
    window.hj =
      window.hj ||
      function (...args: unknown[]) {
        (window.hj!.q = window.hj!.q || []).push(args);
      };
    window._hjSettings = { hjid, hjsv };

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://static.hotjar.com/c/hotjar-${hjid}.js?sv=${hjsv}`;
    script.onload = () => {
      state.hotjarLoaded = true;
      console.log('[Perf] Hotjar loaded (deferred)');
      resolve();
    };
    script.onerror = () => {
      console.warn('[Perf] Hotjar failed to load');
      resolve();
    };

    document.head.appendChild(script);
  });
}

/**
 * Load Microsoft Clarity
 */
function loadClarity(): Promise<void> {
  return new Promise((resolve) => {
    if (state.clarityLoaded) {
      resolve();
      return;
    }

    const clarityId = import.meta.env.VITE_CLARITY_PROJECT_ID;
    if (!clarityId) {
      resolve();
      return;
    }

    // Initialize Clarity
    window.clarity =
      window.clarity ||
      function (...args: unknown[]) {
        (window.clarity!.q = window.clarity!.q || []).push(args);
      };

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.clarity.ms/tag/${clarityId}`;
    script.onload = () => {
      state.clarityLoaded = true;
      console.log('[Perf] Clarity loaded (deferred)');
      resolve();
    };
    script.onerror = () => {
      console.warn('[Perf] Clarity failed to load');
      resolve();
    };

    document.head.appendChild(script);
  });
}

/**
 * Schedule a callback using requestIdleCallback with fallback
 */
function scheduleWhenIdle(callback: () => void, timeout: number): void {
  if (ANALYTICS_CONFIG.useIdleCallback && 'requestIdleCallback' in window) {
    window.requestIdleCallback(callback, { timeout });
  } else {
    setTimeout(callback, timeout);
  }
}

/**
 * Initialize all analytics platforms with deferred loading
 *
 * This function should be called once on app mount.
 * It will delay loading analytics until after critical content loads.
 */
export function initDeferredAnalytics(): void {
  if (state.initialized) {
    return;
  }

  state.initialized = true;

  // Check if we should load analytics for current route
  if (!shouldLoadAnalytics()) {
    console.log('[Perf] Analytics skipped for current route');
    return;
  }

  // Schedule analytics loading after delay
  setTimeout(() => {
    scheduleWhenIdle(async () => {
      console.log('[Perf] Loading analytics (deferred)...');

      try {
        // Load analytics sequentially to avoid overwhelming requestIdleCallback
        // This prevents "handler took Xms" violations
        await loadGA4();

        // Stagger the next loads
        await new Promise(resolve => setTimeout(resolve, 500));
        await loadHotjar();

        await new Promise(resolve => setTimeout(resolve, 500));
        await loadClarity();

        console.log('[Perf] All analytics loaded');
      } catch (error) {
        console.error('[Perf] Error loading analytics:', error);
      }
    }, ANALYTICS_CONFIG.idleCallbackTimeout);
  }, ANALYTICS_CONFIG.delayMs);

  // Listen for consent changes
  window.addEventListener('cookieConsentChanged', ((e: CustomEvent) => {
    const consent = e.detail;
    if (consent.analytics && !state.ga4Loaded) {
      // User just granted consent, load analytics (staggered)
      scheduleWhenIdle(async () => {
        await loadGA4();
        await new Promise(resolve => setTimeout(resolve, 500));
        await loadHotjar();
        await new Promise(resolve => setTimeout(resolve, 500));
        await loadClarity();
      }, 1000);
    }
  }) as EventListener);
}

/**
 * Check analytics loading state
 */
export function getAnalyticsState(): AnalyticsState {
  return { ...state };
}

/**
 * Manually trigger analytics load (for SPA navigation to eligible pages)
 */
export function loadAnalyticsIfNeeded(pathname: string): void {
  if (shouldLoadAnalytics(pathname) && !state.ga4Loaded) {
    scheduleWhenIdle(async () => {
      await loadGA4();
      await new Promise(resolve => setTimeout(resolve, 500));
      await loadHotjar();
      await new Promise(resolve => setTimeout(resolve, 500));
      await loadClarity();
    }, 1000);
  }
}
