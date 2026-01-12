import { useEffect, useRef, useState } from 'react';

/**
 * Options for the scroll animation hook
 */
export interface UseScrollAnimationOptions {
  /**
   * Whether to trigger animation only once (default: true)
   * When true, element animates once and stays animated
   * When false, element animates every time it enters viewport
   */
  once?: boolean;

  /**
   * Threshold for intersection (0 to 1)
   * 0 = any pixel visible, 1 = entire element visible
   * Can also be an array of thresholds
   * @default 0.1
   */
  threshold?: number | number[];

  /**
   * Margin around the root element (viewport)
   * Can expand or shrink the viewport area used for intersection
   * Format: "10px", "10px 20px", "-50px 0px"
   * @default "0px"
   */
  rootMargin?: string;

  /**
   * Root element for intersection (default: viewport)
   * If null, uses the browser viewport
   * @default null
   */
  root?: Element | null;
}

/**
 * Return type for useScrollAnimation hook
 */
export interface UseScrollAnimationReturn<T extends Element = Element> {
  /**
   * Whether the element is currently in view
   */
  isInView: boolean;

  /**
   * Ref to attach to the element you want to observe
   */
  ref: React.RefObject<T>;
}

/**
 * Custom hook using Intersection Observer API to replace framer-motion's whileInView
 *
 * This hook detects when an element enters the viewport and returns a boolean state.
 * It's designed to replace framer-motion's whileInView functionality with a lightweight
 * alternative that works with CSS animations.
 *
 * @param options - Configuration options for the Intersection Observer
 * @returns Object containing isInView boolean and ref to attach to element
 *
 * @example
 * // Basic usage with default options (once: true, threshold: 0.1)
 * function MyComponent() {
 *   const { isInView, ref } = useScrollAnimation();
 *
 *   return (
 *     <div
 *       ref={ref}
 *       className={isInView ? 'animate-fade-in-up' : 'opacity-0'}
 *     >
 *       Content
 *     </div>
 *   );
 * }
 *
 * @example
 * // With custom options
 * function MyComponent() {
 *   const { isInView, ref } = useScrollAnimation({
 *     once: false, // Animate every time element enters viewport
 *     threshold: 0.5, // Trigger when 50% of element is visible
 *     rootMargin: '-50px 0px' // Trigger 50px before element enters viewport
 *   });
 *
 *   return (
 *     <div
 *       ref={ref}
 *       className={isInView ? 'animate-fade-in-up' : 'opacity-0'}
 *     >
 *       Content
 *     </div>
 *   );
 * }
 *
 * @example
 * // Replacing framer-motion whileInView
 * // Before:
 * // <motion.div
 * //   initial={{ opacity: 0, y: 20 }}
 * //   whileInView={{ opacity: 1, y: 0 }}
 * //   viewport={{ once: true }}
 * // >
 * //
 * // After:
 * const { isInView, ref } = useScrollAnimation({ once: true });
 * <div
 *   ref={ref}
 *   className={isInView ? 'animate-fade-in-up' : 'opacity-0 translate-y-5'}
 * >
 */
export function useScrollAnimation<T extends Element = Element>(
  options: UseScrollAnimationOptions = {}
): UseScrollAnimationReturn<T> {
  const {
    once = true,
    threshold = 0.1,
    rootMargin = '0px',
    root = null,
  } = options;

  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    // SSR safety check
    if (typeof window === 'undefined' || !ref.current) {
      return;
    }

    // If once is true and already animated, don't create observer
    if (once && hasAnimatedRef.current) {
      return;
    }

    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      // Fallback: assume element is in view if IO not supported
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isIntersecting = entry.isIntersecting;

          if (isIntersecting) {
            setIsInView(true);
            hasAnimatedRef.current = true;

            // If once is true, disconnect observer after first trigger
            if (once) {
              observer.disconnect();
            }
          } else if (!once) {
            // If once is false, update state when leaving viewport
            setIsInView(false);
          }
        });
      },
      {
        root,
        rootMargin,
        threshold,
      }
    );

    const currentElement = ref.current;
    observer.observe(currentElement);

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
      observer.disconnect();
    };
  }, [once, threshold, rootMargin, root]);

  return { isInView, ref };
}

/**
 * Simplified version with only once parameter for common use case
 *
 * @param once - Whether to trigger animation only once (default: true)
 * @returns Object containing isInView boolean and ref to attach to element
 *
 * @example
 * const { isInView, ref } = useScrollAnimationOnce();
 */
export function useScrollAnimationOnce<T extends Element = Element>(
  once: boolean = true
): UseScrollAnimationReturn<T> {
  return useScrollAnimation<T>({ once });
}

export default useScrollAnimation;
