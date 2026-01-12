import React, { useState, useEffect } from 'react';
import { Cookie, Shield, Check, X } from 'lucide-react';
import { cookieManager, CookieConsent } from '../../utils/cookies/cookieManager';
import { analytics } from '../../utils/analytics/analytics';
import { AnimatedElement } from '../ui/AnimatedElement';

export const CookieSettings: React.FC = () => {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const currentConsent = cookieManager.getConsent();
    if (currentConsent) {
      setConsent(currentConsent);
      setPreferences({
        necessary: currentConsent.necessary,
        analytics: currentConsent.analytics,
        marketing: currentConsent.marketing,
        preferences: currentConsent.preferences,
      });
    }
  }, []);

  const handleToggle = (key: keyof typeof preferences) => {
    if (key === 'necessary') return;
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSave = () => {
    cookieManager.saveConsent(preferences);
    setConsent(cookieManager.getConsent());
    setSaved(true);

    analytics.track('cta_click', {
      cta_name: 'cookie_settings_saved',
      cta_location: 'cookie_settings_page',
    });

    setTimeout(() => setSaved(false), 3000);
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    setPreferences(allAccepted);
    cookieManager.saveConsent(allAccepted);
    setConsent(cookieManager.getConsent());
    setSaved(true);

    setTimeout(() => setSaved(false), 3000);
  };

  const handleRejectAll = () => {
    const allRejected = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    setPreferences(allRejected);
    cookieManager.saveConsent(allRejected);
    setConsent(cookieManager.getConsent());
    setSaved(true);

    setTimeout(() => setSaved(false), 3000);
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all cookies and consent? You will need to accept cookies again.')) {
      cookieManager.clearConsent();
      setConsent(null);
      setPreferences({
        necessary: true,
        analytics: false,
        marketing: false,
        preferences: false,
      });
    }
  };

  const categories = cookieManager.getCookieCategories();

  return (
    <div className="min-h-screen bg-background-alt py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedElement animation="fade-up" className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Cookie className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Cookie Settings
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Manage your cookie preferences and privacy settings
          </p>
        </AnimatedElement>

        {/* Current status */}
        {consent && (
          <AnimatedElement
            animation="fade-up"
            delay={100}
            className="bg-white rounded-lg p-6 mb-8 border border-border-light"
          >
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-text-primary mb-1">
                  Your Cookie Preferences
                </h3>
                <p className="text-sm text-text-secondary mb-3">
                  Last updated: {new Date(consent.timestamp).toLocaleDateString()} at{' '}
                  {new Date(consent.timestamp).toLocaleTimeString()}
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(consent).map(([key, value]) => {
                    if (key === 'timestamp' || key === 'version') return null;
                    return (
                      <span
                        key={key}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          value
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {value ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </AnimatedElement>
        )}

        {/* Cookie categories */}
        <div className="space-y-4 mb-8">
          {categories.map((category, index) => (
            <AnimatedElement
              key={category.id}
              animation="fade-up"
              delay={100 + index * 50}
              className="bg-white rounded-lg p-6 border border-border-light hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-bold text-text-primary">
                      {category.name}
                    </h3>
                    {category.required && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        Always Active
                      </span>
                    )}
                  </div>
                  <p className="text-text-secondary mb-4">
                    {category.description}
                  </p>
                  <div className="bg-background-alt rounded-lg p-3">
                    <p className="text-sm font-medium text-text-primary mb-2">
                      Examples:
                    </p>
                    <ul className="text-sm text-text-secondary space-y-1">
                      {category.examples.map((example, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-primary rounded-full"></span>
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Toggle switch */}
                <button
                  onClick={() => handleToggle(category.id)}
                  disabled={category.required}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    preferences[category.id]
                      ? 'bg-primary'
                      : 'bg-gray-200'
                  } ${category.required ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-90'}`}
                  aria-label={`Toggle ${category.name}`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-sm ${
                      preferences[category.id] ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </AnimatedElement>
          ))}
        </div>

        {/* Action buttons */}
        <AnimatedElement
          animation="fade-up"
          delay={300}
          className="bg-white rounded-lg p-6 border border-border-light"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleAcceptAll}
                className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-all shadow-lg hover:shadow-xl"
              >
                Accept All
              </button>
              <button
                onClick={handleRejectAll}
                className="px-6 py-3 bg-white text-text-primary border border-border-light rounded-lg font-semibold hover:border-gray-400 transition-all"
              >
                Reject All
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-white text-primary border border-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition-all"
              >
                Save Preferences
              </button>
            </div>

            <button
              onClick={handleClearAll}
              className="text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
            >
              Clear All Cookies
            </button>
          </div>

          {saved && (
            <div className="mt-4 flex items-center gap-2 text-green-600 animate-fade-in-down-fast">
              <Check className="w-5 h-5" />
              <span className="font-medium">Preferences saved successfully!</span>
            </div>
          )}
        </AnimatedElement>

        {/* Additional info */}
        <AnimatedElement
          animation="fade-up"
          delay={400}
          className="mt-8 text-center text-sm text-text-secondary"
        >
          <p>
            For more information about how we use cookies, please read our{' '}
            <a href="/privacy-policy" className="text-primary hover:underline">
              Privacy Policy
            </a>
            {' '}and{' '}
            <a href="/cookie-policy" className="text-primary hover:underline">
              Cookie Policy
            </a>
            .
          </p>
        </AnimatedElement>
      </div>
    </div>
  );
};
