import React, { useState, useEffect } from 'react';
import { Cookie, X, Settings, Check } from 'lucide-react';
import { cookieManager } from '../../utils/cookies/cookieManager';
import { analytics } from '../../utils/analytics/analytics';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export const CookieConsentBanner: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: true,
    marketing: false,
    preferences: true,
  });
  const [shouldRender, setShouldRender] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Show banner if user hasn't given consent
    if (!cookieManager.hasConsent()) {
      // Small delay for better UX
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  // Handle mount/unmount with exit animations
  useEffect(() => {
    if (isVisible) {
      // Mount component
      setShouldRender(true);
      setIsExiting(false);
    } else if (shouldRender) {
      // Trigger exit animation
      setIsExiting(true);
      // Unmount after animation completes (300ms duration, 0ms for reduced motion)
      const exitDuration = prefersReducedMotion ? 0 : 300;
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, exitDuration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, shouldRender, prefersReducedMotion]);

  const handleAcceptAll = () => {
    cookieManager.acceptAll();
    setIsVisible(false);

    analytics.track('cta_click', {
      cta_name: 'cookie_accept_all',
      cta_location: 'cookie_banner',
    });
  };

  const handleRejectAll = () => {
    cookieManager.rejectAll();
    setIsVisible(false);

    analytics.track('cta_click', {
      cta_name: 'cookie_reject_all',
      cta_location: 'cookie_banner',
    });
  };

  const handleSavePreferences = () => {
    cookieManager.saveConsent(preferences);
    setIsVisible(false);
    setShowPreferences(false);

    analytics.track('cta_click', {
      cta_name: 'cookie_save_preferences',
      cta_location: 'cookie_banner',
      analytics_enabled: preferences.analytics,
      marketing_enabled: preferences.marketing,
    });
  };

  const handleTogglePreference = (key: keyof typeof preferences) => {
    if (key === 'necessary') return; // Can't disable necessary cookies
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const categories = cookieManager.getCookieCategories();

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[200] bg-white shadow-2xl border-t-2 border-primary ${
        prefersReducedMotion ? '' : 'transition-all duration-300'
      } ${
        isExiting ? 'opacity-0' : 'opacity-100'
      } ${
        prefersReducedMotion || isExiting ? '' : 'translate-y-0'
      } ${
        !prefersReducedMotion && isExiting ? 'translate-y-24' : ''
      }`}
      style={{
        animation: !isExiting && !prefersReducedMotion ? 'slide-up-from-bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards' : 'none'
      }}
    >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {!showPreferences ? (
            // Simple consent view
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              {/* Icon and message */}
              <div className="flex items-start gap-4 flex-1">
                <Cookie className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-text-primary mb-1">
                    We use cookies
                  </h3>
                  <p className="text-sm text-text-secondary">
                    We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.
                    By clicking "Accept All", you consent to our use of cookies.{' '}
                    <a href="/privacy-policy" className="text-primary hover:underline">
                      Privacy Policy
                    </a>
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => setShowPreferences(true)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-text-primary hover:text-primary border border-border-light hover:border-primary rounded-lg ${
                    prefersReducedMotion ? 'transition-colors' : 'transition-all'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Customize</span>
                </button>

                <button
                  onClick={handleRejectAll}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-text-secondary hover:text-text-primary border border-border-light hover:border-gray-400 rounded-lg ${
                    prefersReducedMotion ? 'transition-colors' : 'transition-all'
                  }`}
                >
                  <X className="w-4 h-4" />
                  <span>Reject All</span>
                </button>

                <button
                  onClick={handleAcceptAll}
                  className={`inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-lg ${
                    prefersReducedMotion ? 'transition-colors' : 'transition-all hover:shadow-xl'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>Accept All</span>
                </button>
              </div>
            </div>
          ) : (
            // Detailed preferences view
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Cookie className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-bold text-text-primary">
                    Cookie Preferences
                  </h3>
                </div>
                <button
                  onClick={() => setShowPreferences(false)}
                  className="text-text-secondary hover:text-text-primary transition-colors"
                  aria-label="Back to simple view"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="border border-border-light rounded-lg p-4 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-text-primary">
                            {category.name}
                          </h4>
                          {category.required && (
                            <span className="text-xs bg-gray-100 text-text-secondary px-2 py-0.5 rounded">
                              Always Active
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-text-secondary mb-2">
                          {category.description}
                        </p>
                        <p className="text-xs text-text-secondary">
                          <span className="font-medium">Examples:</span> {category.examples.join(', ')}
                        </p>
                      </div>

                      {/* Toggle switch */}
                      <button
                        onClick={() => handleTogglePreference(category.id)}
                        disabled={category.required}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                          prefersReducedMotion ? '' : 'transition-colors'
                        } ${
                          preferences[category.id]
                            ? 'bg-primary'
                            : 'bg-gray-200'
                        } ${category.required ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white ${
                            prefersReducedMotion ? '' : 'transition-transform'
                          } ${
                            preferences[category.id] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border-light">
                <button
                  onClick={handleRejectAll}
                  className="text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors"
                >
                  Reject All
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowPreferences(false)}
                    className={`px-4 py-2.5 text-sm font-semibold text-text-primary hover:text-primary border border-border-light hover:border-primary rounded-lg ${
                      prefersReducedMotion ? 'transition-colors' : 'transition-all'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePreferences}
                    className={`inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-lg ${
                      prefersReducedMotion ? 'transition-colors' : 'transition-all'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Preferences</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
    </div>
  );
};
