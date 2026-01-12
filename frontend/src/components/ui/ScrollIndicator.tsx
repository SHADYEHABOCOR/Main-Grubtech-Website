import React, { useState, useEffect } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export const ScrollIndicator: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  // Check if animations should be reduced (mobile or OS preference)
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 100;

      if (scrolled && !isScrolled) {
        // Start exit animation
        setIsExiting(true);
        setIsScrolled(true);

        // Unmount after exit animation completes (300ms for normal, instant for reduced motion)
        const exitDuration = prefersReducedMotion ? 0 : 300;
        setTimeout(() => {
          setShouldRender(false);
        }, exitDuration);
      } else if (!scrolled && isScrolled) {
        // Show again when scrolling back up
        setShouldRender(true);
        setIsScrolled(false);
        setIsExiting(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolled, prefersReducedMotion]);

  if (!shouldRender) return null;

  return (
    <div
      className={`hidden lg:flex fixed bottom-8 z-50 flex-col items-center gap-3 pointer-events-none ${
        !prefersReducedMotion ? 'transition-all duration-300 ease-in-out' : ''
      } ${
        isExiting && !prefersReducedMotion
          ? 'opacity-0 -translate-y-2.5'
          : 'opacity-100 translate-y-0'
      }`}
      style={{ left: '50%', transform: 'translateX(-50%)' }}
    >
      {/* Mouse Icon */}
      <div className="relative w-7 h-11 border-2 border-white/60 rounded-full flex items-start justify-center pt-2">
        <div
          className="w-1.5 h-2 bg-white/80 rounded-full"
          style={
            !prefersReducedMotion
              ? { animation: 'scroll-bounce 1.5s ease-in-out infinite' }
              : undefined
          }
        />
      </div>
      <span className="text-xs text-white/70 font-medium">Scroll</span>
    </div>
  );
};
