import { useState, useEffect } from 'react';

/**
 * Check if the current device is a mobile device
 */
function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;

  // Check for touch support and screen size (mobile/tablet)
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth <= 768; // Mobile/tablet breakpoint

  return isTouchDevice && isSmallScreen;
}

/**
 * Hook to detect user's prefers-reduced-motion setting OR mobile device
 *
 * Returns true if the user has requested reduced motion in their OS settings
 * OR if they're on a mobile device (for performance).
 * Use this to disable or simplify animations for users who may experience
 * motion sickness or other vestibular disorders, and to improve mobile performance.
 *
 * @returns boolean - true if reduced motion is preferred or on mobile
 *
 * @example
 * // Basic usage - conditional animation props
 * const prefersReducedMotion = useReducedMotion();
 *
 * const animationProps = prefersReducedMotion
 *   ? {} // No animation
 *   : { initial: { opacity: 0 }, animate: { opacity: 1 } };
 *
 * @example
 * // Pattern 1: Conditional CSS classes (scale animations, transforms)
 * function Button() {
 *   const prefersReducedMotion = useReducedMotion();
 *
 *   return (
 *     <button
 *       className={`
 *         px-4 py-2
 *         ${!prefersReducedMotion ? 'hover:scale-[1.01] active:scale-[0.99]' : ''}
 *         ${!prefersReducedMotion ? 'transition-transform duration-200' : 'transition-colors'}
 *       `}
 *     >
 *       Click me
 *     </button>
 *   );
 * }
 *
 * @example
 * // Pattern 2: Direct inline styles (animation property)
 * function InfiniteSlider() {
 *   const prefersReducedMotion = useReducedMotion();
 *
 *   return (
 *     <div
 *       className="slider"
 *       style={{
 *         animation: prefersReducedMotion ? 'none' : 'scroll 20s linear infinite',
 *       }}
 *     >
 *       {/* slider content *\/}
 *     </div>
 *   );
 * }
 *
 * @example
 * // Pattern 3: CSS variables for dynamic animation control
 * function Card() {
 *   const prefersReducedMotion = useReducedMotion();
 *
 *   return (
 *     <div
 *       className="card"
 *       style={{
 *         '--transition-duration': prefersReducedMotion ? '0ms' : '300ms',
 *         '--transform-scale': prefersReducedMotion ? '1' : '1.05',
 *       } as React.CSSProperties}
 *     >
 *       {/* card content *\/}
 *     </div>
 *   );
 * }
 *
 * // In CSS:
 * // .card {
 * //   transition: transform var(--transition-duration);
 * // }
 * // .card:hover {
 * //   transform: scale(var(--transform-scale));
 * // }
 *
 * @example
 * // Pattern 4: Exit duration for unmount animations
 * function Modal({ isOpen, onClose }) {
 *   const prefersReducedMotion = useReducedMotion();
 *   const [shouldRender, setShouldRender] = useState(isOpen);
 *   const [isExiting, setIsExiting] = useState(false);
 *
 *   useEffect(() => {
 *     if (isOpen) {
 *       setShouldRender(true);
 *       setIsExiting(false);
 *     } else if (shouldRender) {
 *       setIsExiting(true);
 *
 *       // Instant exit for reduced motion, animated for normal
 *       const exitDuration = prefersReducedMotion ? 0 : 300;
 *       setTimeout(() => {
 *         setShouldRender(false);
 *         setIsExiting(false);
 *       }, exitDuration);
 *     }
 *   }, [isOpen, shouldRender, prefersReducedMotion]);
 *
 *   if (!shouldRender) return null;
 *
 *   return (
 *     <div
 *       className={`
 *         modal
 *         ${!prefersReducedMotion ? 'animate-fade-in' : ''}
 *         ${isExiting && !prefersReducedMotion ? 'animate-fade-out' : ''}
 *       `}
 *     >
 *       {/* modal content *\/}
 *     </div>
 *   );
 * }
 *
 * @example
 * // Pattern 5: Conditional keyframe animations
 * function Spinner() {
 *   const prefersReducedMotion = useReducedMotion();
 *
 *   return (
 *     <div
 *       className={
 *         prefersReducedMotion
 *           ? 'animate-pulse' // Gentle opacity pulse
 *           : 'animate-spin'  // Rotation animation
 *       }
 *     >
 *       <LoadingIcon />
 *     </div>
 *   );
 * }
 *
 * @example
 * // Pattern 6: Combining multiple animation types
 * function Card() {
 *   const prefersReducedMotion = useReducedMotion();
 *
 *   return (
 *     <div
 *       className={`
 *         card
 *         ${!prefersReducedMotion ? 'transition-all duration-300' : 'transition-colors'}
 *       `}
 *     >
 *       <div
 *         className={!prefersReducedMotion ? 'animate-slide-in' : ''}
 *       >
 *         <h2>Title</h2>
 *       </div>
 *
 *       <button
 *         className={`
 *           ${!prefersReducedMotion ? 'hover:scale-105' : ''}
 *           transition-colors
 *         `}
 *       >
 *         Action
 *       </button>
 *     </div>
 *   );
 * }
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    // Check if window is available (SSR safety)
    if (typeof window === 'undefined') return false;

    // Check both OS setting and mobile device
    const osPreference = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = isMobileDevice();

    return osPreference || isMobile;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleMediaChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches || isMobileDevice());
    };

    const handleResize = () => {
      // Re-check mobile status on resize
      const osPreference = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isMobile = isMobileDevice();
      setPrefersReducedMotion(osPreference || isMobile);
    };

    // Listen for OS preference changes
    mediaQuery.addEventListener('change', handleMediaChange);

    // Listen for window resize (to detect rotation or responsive changes)
    window.addEventListener('resize', handleResize);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * Get animation props based on reduced motion preference
 *
 * @param normalAnimation - Animation props to use when motion is allowed
 * @param reducedAnimation - Animation props to use when reduced motion is preferred (optional)
 * @returns The appropriate animation props based on user preference
 *
 * @example
 * const fadeIn = getMotionProps(
 *   { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } },
 *   { initial: { opacity: 0 }, animate: { opacity: 1 } }
 * );
 */
export function getMotionProps<T extends Record<string, unknown>>(
  normalAnimation: T,
  reducedAnimation?: Partial<T>
): T | Partial<T> {
  if (typeof window === 'undefined') return normalAnimation;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = isMobileDevice();

  if (prefersReducedMotion || isMobile) {
    return reducedAnimation || {};
  }

  return normalAnimation;
}

export default useReducedMotion;
