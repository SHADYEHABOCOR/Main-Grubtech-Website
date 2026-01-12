import React, { useState, useEffect } from 'react';
import { X, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { analytics } from '../../utils/analytics/analytics';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface ExitIntentPopupProps {
  enabled?: boolean;
  delay?: number; // Delay before popup can be triggered (ms)
}

export const ExitIntentPopup: React.FC<ExitIntentPopupProps> = ({
  enabled = true,
  delay = 5000,
}) => {
  const { i18n } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [canShow, setCanShow] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Check if animations should be reduced (mobile or OS preference)
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!enabled) return;

    // Check if user has already seen it this session
    const hasSeenPopup = sessionStorage.getItem('exit_intent_shown');
    if (hasSeenPopup) return;

    // Enable popup after delay
    const delayTimer = setTimeout(() => {
      setCanShow(true);
    }, delay);

    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger when mouse leaves from top of page
      if (e.clientY <= 0 && canShow && !hasSeenPopup) {
        setIsVisible(true);
        sessionStorage.setItem('exit_intent_shown', 'true');
        analytics.track('cta_click', {
          cta_name: 'exit_intent_shown',
          cta_location: 'exit_popup',
        });
      }
    };

    if (canShow) {
      document.addEventListener('mouseout', handleMouseLeave);
    }

    return () => {
      clearTimeout(delayTimer);
      document.removeEventListener('mouseout', handleMouseLeave);
    };
  }, [enabled, delay, canShow]);

  // Handle mount/unmount with exit animations
  useEffect(() => {
    if (isVisible) {
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
  }, [isVisible, shouldRender, prefersReducedMotion]);

  const handleClose = () => {
    setIsVisible(false);
    analytics.track('cta_click', {
      cta_name: 'exit_intent_dismissed',
      cta_location: 'exit_popup',
    });
  };

  const handleCTAClick = (action: string) => {
    analytics.track('cta_click', {
      cta_name: `exit_intent_${action}`,
      cta_location: 'exit_popup',
    });
    setIsVisible(false);
  };

  if (!enabled || !shouldRender) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] ${
          !prefersReducedMotion ? 'transition-opacity duration-300' : ''
        } ${
          isExiting ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Popup */}
      <div
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-lg mx-4 ${
          !prefersReducedMotion ? 'transition-all duration-300' : ''
        } ${
          isExiting
            ? `opacity-0 ${!prefersReducedMotion ? 'scale-90 translate-y-5' : ''}`
            : `opacity-100 ${!prefersReducedMotion ? 'scale-100 translate-y-0' : ''}`
        }`}
        style={{
          animation: !isExiting && !prefersReducedMotion ? 'popup-scale-fade-in 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards' : 'none'
        }}
      >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-primary to-primary-dark p-6 text-white relative">
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-2">
                  <Zap className="w-8 h-8" />
                  <h3 className="text-2xl font-bold">Wait! Before You Go...</h3>
                </div>
                <p className="text-white/90">
                  Get a personalized demo and see how Grubtech can transform your operations
                </p>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="space-y-4 mb-6">
                  {[
                    'See the platform in action with your data',
                    'Get answers to your specific questions',
                    'Receive a custom quote for your business',
                    'No commitment required',
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                      <p className="text-text-primary">{benefit}</p>
                    </div>
                  ))}
                </div>

                {/* CTAs */}
                <div className="space-y-3">
                  <Link
                    to={`/${i18n.language}/connect-with-us`}
                    onClick={() => handleCTAClick('schedule_demo')}
                    className={`w-full inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark ${
                      !prefersReducedMotion ? 'transition-all duration-300 hover:scale-105' : 'transition-colors duration-300'
                    }`}
                  >
                    <span>Schedule Free Demo</span>
                    <ArrowRight className="w-5 h-5 rtl-mirror" />
                  </Link>

                  <button
                    onClick={handleClose}
                    className="w-full text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
                  >
                    No thanks, I'll continue browsing
                  </button>
                </div>
              </div>
            </div>
      </div>
    </>
  );
};
