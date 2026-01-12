/**
 * Cookie Management Utility
 * Handles cookie consent, preferences, and GDPR compliance
 */

export type CookieCategory = 'necessary' | 'analytics' | 'marketing' | 'preferences';

export interface CookieConsent {
  necessary: boolean; // Always true, can't be disabled
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  timestamp: number;
  version: string; // Track consent version for updates
}

const CONSENT_COOKIE_NAME = 'grubtech_cookie_consent';
const CONSENT_VERSION = '1.0';
const COOKIE_EXPIRY_DAYS = 365;

class CookieManager {
  private consent: CookieConsent | null = null;

  constructor() {
    this.loadConsent();
  }

  /**
   * Load saved consent from cookies
   */
  private loadConsent(): void {
    const savedConsent = this.getCookie(CONSENT_COOKIE_NAME);
    if (savedConsent) {
      try {
        this.consent = JSON.parse(savedConsent);
      } catch (e) {
        console.error('Failed to parse cookie consent:', e);
        this.consent = null;
      }
    }
  }

  /**
   * Check if user has given consent
   */
  hasConsent(): boolean {
    return this.consent !== null;
  }

  /**
   * Get current consent settings
   */
  getConsent(): CookieConsent | null {
    return this.consent;
  }

  /**
   * Check if specific category is allowed
   */
  isAllowed(category: CookieCategory): boolean {
    if (!this.consent) return false;
    if (category === 'necessary') return true; // Always allowed
    return this.consent[category] || false;
  }

  /**
   * Save consent preferences
   */
  saveConsent(preferences: Omit<CookieConsent, 'timestamp' | 'version'>): void {
    const consent: CookieConsent = {
      ...preferences,
      necessary: true, // Always true
      timestamp: Date.now(),
      version: CONSENT_VERSION,
    };

    this.consent = consent;
    this.setCookie(CONSENT_COOKIE_NAME, JSON.stringify(consent), COOKIE_EXPIRY_DAYS);

    // Trigger consent change event
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', {
      detail: consent,
    }));

    // Apply consent immediately
    this.applyConsent();
  }

  /**
   * Accept all cookies
   */
  acceptAll(): void {
    this.saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    });
  }

  /**
   * Reject all optional cookies (only necessary)
   */
  rejectAll(): void {
    this.saveConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    });
  }

  /**
   * Clear all consent
   */
  clearConsent(): void {
    this.deleteCookie(CONSENT_COOKIE_NAME);
    this.consent = null;

    // Clear all non-necessary cookies
    this.clearNonNecessaryCookies();
  }

  /**
   * Apply consent settings (enable/disable tracking)
   */
  private applyConsent(): void {
    if (!this.consent) return;

    // Analytics cookies
    if (!this.consent.analytics) {
      // Disable GA4
      if (typeof window.gtag === 'function') {
        window.gtag('consent', 'update', {
          analytics_storage: 'denied',
        });
      }

      // Disable Mixpanel
      if (window.mixpanel) {
        window.mixpanel.opt_out_tracking();
      }

      // Clear analytics cookies
      this.clearCookiesByPrefix('_ga');
      this.clearCookiesByPrefix('_gid');
    } else {
      // Enable GA4
      if (typeof window.gtag === 'function') {
        window.gtag('consent', 'update', {
          analytics_storage: 'granted',
        });
      }

      // Enable Mixpanel
      if (window.mixpanel) {
        window.mixpanel.opt_in_tracking();
      }
    }

    // Marketing cookies
    if (!this.consent.marketing) {
      if (typeof window.gtag === 'function') {
        window.gtag('consent', 'update', {
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
        });
      }
    } else {
      if (typeof window.gtag === 'function') {
        window.gtag('consent', 'update', {
          ad_storage: 'granted',
          ad_user_data: 'granted',
          ad_personalization: 'granted',
        });
      }
    }
  }

  /**
   * Set a cookie
   */
  private setCookie(name: string, value: string, days: number): void {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }

  /**
   * Get a cookie value
   */
  private getCookie(name: string): string | null {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  /**
   * Delete a cookie
   */
  private deleteCookie(name: string): void {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }

  /**
   * Clear cookies by prefix
   */
  private clearCookiesByPrefix(prefix: string): void {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name] = cookie.trim().split('=');
      if (name.startsWith(prefix)) {
        this.deleteCookie(name);
      }
    }
  }

  /**
   * Clear all non-necessary cookies
   */
  private clearNonNecessaryCookies(): void {
    // Clear analytics cookies
    this.clearCookiesByPrefix('_ga');
    this.clearCookiesByPrefix('_gid');
    this.clearCookiesByPrefix('_gat');

    // Clear Mixpanel
    this.clearCookiesByPrefix('mp_');

    // Clear Hotjar
    this.clearCookiesByPrefix('_hj');

    // Clear Clarity
    this.clearCookiesByPrefix('_clck');
    this.clearCookiesByPrefix('_clsk');
  }

  /**
   * Get cookie categories with descriptions
   */
  getCookieCategories() {
    return [
      {
        id: 'necessary' as const,
        name: 'Necessary Cookies',
        description: 'Essential for the website to function properly. These cannot be disabled.',
        required: true,
        examples: ['Session cookies', 'Security cookies', 'Load balancing'],
      },
      {
        id: 'analytics' as const,
        name: 'Analytics Cookies',
        description: 'Help us understand how visitors interact with our website by collecting and reporting information anonymously.',
        required: false,
        examples: ['Google Analytics', 'Microsoft Clarity', 'Hotjar'],
      },
      {
        id: 'marketing' as const,
        name: 'Marketing Cookies',
        description: 'Used to track visitors across websites to display relevant advertisements.',
        required: false,
        examples: ['Google Ads', 'Facebook Pixel', 'LinkedIn Insight'],
      },
      {
        id: 'preferences' as const,
        name: 'Preference Cookies',
        description: 'Enable the website to remember choices you make and provide enhanced features.',
        required: false,
        examples: ['Language preference', 'Region selection', 'UI customization'],
      },
    ];
  }
}

// Export singleton instance
export const cookieManager = new CookieManager();

// Initialize consent mode for Google Analytics
if (typeof window !== 'undefined') {
  // Set default consent mode
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  }

  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500,
  });

  // If consent already given, apply it
  if (cookieManager.hasConsent()) {
    const consent = cookieManager.getConsent();
    if (consent?.analytics) {
      gtag('consent', 'update', {
        analytics_storage: 'granted',
      });
    }
    if (consent?.marketing) {
      gtag('consent', 'update', {
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
      });
    }
  }
}
