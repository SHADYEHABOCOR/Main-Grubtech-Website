import React, { useState, useEffect } from 'react';
import { X, Calendar, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { analytics } from '../../utils/analytics/analytics';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface StickyCTABarProps {
  showAfterScroll?: number; // Show after scrolling X pixels
  hideOnPages?: string[]; // Hide on specific pages
}

export const StickyCTABar: React.FC<StickyCTABarProps> = ({
  showAfterScroll = 300,
  hideOnPages = ['/connect-with-us'],
}) => {
  const { i18n } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Check if animations should be reduced (mobile or OS preference)
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // Check if should hide on current page
    const currentPath = window.location.pathname;
    if (hideOnPages.some(page => currentPath.includes(page))) {
      return;
    }

    // Check if user previously dismissed
    const dismissed = sessionStorage.getItem('sticky_cta_dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    const handleScroll = () => {
      if (window.scrollY > showAfterScroll) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAfterScroll, hideOnPages]);

  // Handle mount/unmount with exit animations
  useEffect(() => {
    if (isVisible && !isDismissed) {
      // Mount component
      setShouldRender(true);
      setIsExiting(false);
    } else if (shouldRender) {
      // Trigger exit animation
      setIsExiting(true);
      // Unmount after animation completes (300ms for normal, instant for reduced motion)
      const exitDuration = prefersReducedMotion ? 0 : 300;
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, exitDuration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, isDismissed, shouldRender, prefersReducedMotion]);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('sticky_cta_dismissed', 'true');
    analytics.track('cta_click', {
      cta_name: 'sticky_bar_dismiss',
      cta_location: 'sticky_bar',
    });
  };

  const handleCTAClick = (ctaName: string) => {
    analytics.trackCTA(ctaName, 'sticky_bar');
  };

  if (isDismissed || !shouldRender) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 ${
        !prefersReducedMotion ? 'transition-all duration-300' : ''
      } ${
        isExiting
          ? `opacity-0 ${!prefersReducedMotion ? 'translate-y-24' : ''}`
          : `opacity-100 ${!prefersReducedMotion ? 'translate-y-0' : ''}`
      }`}
      style={{
        animation: !isExiting && !prefersReducedMotion ? 'slide-up-from-bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards' : 'none'
      }}
    >
          <div className="bg-gradient-to-r from-primary to-primary-dark shadow-2xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between py-3 md:py-4 gap-4">
                {/* Message */}
                <div className="flex-1 hidden md:block">
                  <p className="text-white font-semibold text-sm md:text-base">
                    Ready to transform your restaurant operations?
                  </p>
                </div>

                {/* CTAs */}
                <div className="flex items-center gap-2 md:gap-3 flex-1 md:flex-none justify-center">
                  <Link
                    to={`/${i18n.language}/connect-with-us`}
                    onClick={() => handleCTAClick('sticky_bar_schedule_demo')}
                    className={`inline-flex items-center gap-2 bg-white text-primary px-4 md:px-6 py-2 md:py-2.5 rounded-lg font-semibold text-sm md:text-base hover:bg-gray-100 shadow-lg ${
                      !prefersReducedMotion ? 'transition-all duration-300 hover:scale-105' : 'transition-colors duration-300'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="hidden sm:inline">Schedule Demo</span>
                    <span className="sm:hidden">Demo</span>
                  </Link>

                  <Link
                    to={`/${i18n.language}/connect-with-us`}
                    onClick={() => handleCTAClick('sticky_bar_contact')}
                    className={`inline-flex items-center gap-2 bg-white/10 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-lg font-semibold text-sm md:text-base hover:bg-white/20 border border-white/30 ${
                      !prefersReducedMotion ? 'transition-all duration-300' : 'transition-colors duration-300'
                    }`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Contact Us</span>
                    <span className="sm:hidden">Contact</span>
                  </Link>
                </div>

                {/* Close button */}
                <button
                  onClick={handleDismiss}
                  className="text-white/80 hover:text-white transition-colors p-1"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
    </div>
  );
};
