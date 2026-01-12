/**
 * Analytics & Tracking Utility
 * Centralized event tracking for Google Analytics, Mixpanel, and other platforms
 * GDPR/Cookie Consent Compliant
 */

import { cookieManager } from '../cookies/cookieManager';

// Event types for type safety
export type AnalyticsEvent =
  // Page views
  | 'page_view'
  // Button clicks
  | 'cta_click'
  | 'demo_request_start'
  | 'demo_request_complete'
  | 'contact_form_start'
  | 'contact_form_complete'
  | 'download_resource'
  | 'video_play'
  | 'video_complete'
  // Navigation
  | 'navigation_click'
  | 'external_link_click'
  // Lead actions
  | 'lead_captured'
  | 'newsletter_signup'
  | 'trial_signup'
  // Product interest
  | 'solution_page_view'
  | 'persona_page_view'
  | 'pricing_calculator_use'
  | 'integration_interest'
  // Engagement
  | 'scroll_depth_25'
  | 'scroll_depth_50'
  | 'scroll_depth_75'
  | 'scroll_depth_100'
  | 'time_on_page_30s'
  | 'time_on_page_60s'
  | 'time_on_page_120s';

export interface AnalyticsProperties {
  [key: string]: string | number | boolean | undefined;
}

class Analytics {
  private initialized = false;
  private ga4Id: string | undefined;
  private mixpanelToken: string | undefined;
  private hotjarId: string | undefined;

  constructor() {
    this.ga4Id = import.meta.env.VITE_GA4_MEASUREMENT_ID;
    this.mixpanelToken = import.meta.env.VITE_MIXPANEL_TOKEN;
    this.hotjarId = import.meta.env.VITE_HOTJAR_ID;
  }

  /**
   * Initialize all analytics platforms
   */
  init() {
    if (this.initialized) return;

    // Check if user has given consent for analytics
    const hasAnalyticsConsent = cookieManager.isAllowed('analytics');

    // Initialize Google Analytics 4
    if (hasAnalyticsConsent && this.ga4Id && import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
      this.initGA4();
    }

    // Initialize Mixpanel
    if (hasAnalyticsConsent && this.mixpanelToken && import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
      this.initMixpanel();
    }

    // Initialize Hotjar
    if (hasAnalyticsConsent && this.hotjarId) {
      this.initHotjar();
    }

    // Initialize Microsoft Clarity
    const clarityId = import.meta.env.VITE_CLARITY_PROJECT_ID;
    if (hasAnalyticsConsent && clarityId) {
      this.initClarity(clarityId);
    }

    // Listen for consent changes and reinitialize if consent is granted
    window.addEventListener('cookieConsentChanged', ((e: CustomEvent) => {
      const consent = e.detail;
      if (consent.analytics && !this.initialized) {
        this.init();
      }
    }) as EventListener);

    this.initialized = true;

    if (hasAnalyticsConsent) {
      console.log('✅ Analytics initialized');
    } else {
      console.log('⚠️ Analytics disabled - no consent');
    }
  }

  /**
   * Initialize Google Analytics 4
   */
  private initGA4() {
    if (!this.ga4Id) return;

    // Load gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.ga4Id}`;
    document.head.appendChild(script);

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
      'analytics_storage': consent?.analytics ? 'granted' : 'denied',
      'ad_storage': consent?.marketing ? 'granted' : 'denied',
      'functionality_storage': consent?.preferences ? 'granted' : 'denied',
      'personalization_storage': consent?.preferences ? 'granted' : 'denied',
    });

    gtag('config', this.ga4Id);

    console.log('✅ Google Analytics 4 initialized');
  }

  /**
   * Initialize Mixpanel
   */
  private initMixpanel() {
    if (!this.mixpanelToken) return;

    // Mixpanel initialization code
    // Note: Install mixpanel-browser package: npm install mixpanel-browser
    console.log('✅ Mixpanel ready (install mixpanel-browser package)');
  }

  /**
   * Initialize Hotjar
   */
  private initHotjar() {
    if (!this.hotjarId) return;

    const hjid = parseInt(this.hotjarId);
    const hjsv = parseInt(import.meta.env.VITE_HOTJAR_SV || '6');

    // Initialize Hotjar
    window.hj = window.hj || function(...args: unknown[]) {
      (window.hj!.q = window.hj!.q || []).push(args);
    };
    window._hjSettings = { hjid, hjsv };

    const head = document.getElementsByTagName('head')[0];
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://static.hotjar.com/c/hotjar-${hjid}.js?sv=${hjsv}`;
    head.appendChild(script);

    console.log('✅ Hotjar initialized');
  }

  /**
   * Initialize Microsoft Clarity
   */
  private initClarity(clarityId: string) {
    // Initialize Clarity
    window.clarity = window.clarity || function(...args: unknown[]) {
      (window.clarity!.q = window.clarity!.q || []).push(args);
    };

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.clarity.ms/tag/${clarityId}`;
    const firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode?.insertBefore(script, firstScript);

    console.log('✅ Microsoft Clarity initialized');
  }

  /**
   * Track an event across all platforms
   */
  track(event: AnalyticsEvent, properties?: AnalyticsProperties) {
    if (!this.initialized) {
      console.warn('Analytics not initialized. Call analytics.init() first');
      return;
    }

    // Check consent before tracking
    if (!cookieManager.isAllowed('analytics')) {
      if (import.meta.env.DEV) {
        console.log('📊 Analytics Event blocked (no consent):', event, properties);
      }
      return;
    }

    // Google Analytics 4
    if (this.ga4Id && typeof window.gtag === 'function') {
      window.gtag('event', event, properties);
    }

    // Mixpanel
    if (this.mixpanelToken && window.mixpanel) {
      window.mixpanel.track(event, properties);
    }

    // Console log in development
    if (import.meta.env.DEV) {
      console.log('📊 Analytics Event:', event, properties);
    }
  }

  /**
   * Track page view
   */
  pageView(path: string, title?: string) {
    this.track('page_view', {
      page_path: path,
      page_title: title || document.title,
    });
  }

  /**
   * Identify user (for lead tracking)
   */
  identify(userId: string, traits?: Record<string, unknown>) {
    if (window.mixpanel) {
      window.mixpanel.identify(userId);
      if (traits) {
        window.mixpanel.people.set(traits);
      }
    }

    if (window.gtag && this.ga4Id) {
      window.gtag('config', this.ga4Id, {
        user_id: userId,
      });
    }

    console.log('👤 User identified:', userId);
  }

  /**
   * Track form submission
   */
  trackFormSubmit(formName: string, formData?: Record<string, unknown>) {
    this.track('contact_form_complete', {
      form_name: formName,
      ...formData,
    });
  }

  /**
   * Track CTA click
   */
  trackCTA(ctaName: string, ctaLocation: string) {
    this.track('cta_click', {
      cta_name: ctaName,
      cta_location: ctaLocation,
    });
  }

  /**
   * Track scroll depth
   */
  trackScrollDepth(depth: 25 | 50 | 75 | 100) {
    const eventMap = {
      25: 'scroll_depth_25' as const,
      50: 'scroll_depth_50' as const,
      75: 'scroll_depth_75' as const,
      100: 'scroll_depth_100' as const,
    };

    this.track(eventMap[depth], {
      scroll_depth: depth,
      page_path: window.location.pathname,
    });
  }
}

// Export singleton instance
export const analytics = new Analytics();

// NOTE: Auto-initialization is now disabled.
// Analytics are loaded via deferredAnalytics.ts for better performance.
// This delays loading by 3+ seconds and skips analytics on legal pages.
