import React from 'react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * Animation variant types matching the CSS keyframes defined in index.css and tailwind.config.js
 */
export type AnimationVariant = 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale-in';

/**
 * Animation speed/duration variants
 */
export type AnimationSpeed = 'fast' | 'default' | 'slow';

/**
 * Animation timing function variants matching framer-motion easing
 */
export type AnimationTiming = 'ease-out' | 'ease-in-out' | 'ease-spring';

/**
 * Allowed HTML element types for the animated element
 */
export type AnimatedElementTag =
  | 'div'
  | 'section'
  | 'article'
  | 'header'
  | 'footer'
  | 'main'
  | 'aside'
  | 'nav'
  | 'span'
  | 'p'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'li'
  | 'ul'
  | 'ol';

export interface AnimatedElementProps {
  children: React.ReactNode;
  /** Animation variant to use */
  animation?: AnimationVariant;
  /** Animation speed/duration */
  speed?: AnimationSpeed;
  /** Animation timing function */
  timing?: AnimationTiming;
  /** Animation delay in milliseconds */
  delay?: number;
  /** Enable scroll-triggered animation (requires IntersectionObserver) */
  scrollTrigger?: boolean;
  /** Trigger animation only once when scrolling into view (only applies if scrollTrigger is true) */
  once?: boolean;
  /** Intersection threshold for scroll trigger (0 to 1) */
  threshold?: number;
  /** Additional CSS classes */
  className?: string;
  /** HTML element to render */
  as?: AnimatedElementTag;
  /** Click handler */
  onClick?: () => void;
  /** Element ID for anchoring */
  id?: string;
  /** ARIA label for accessibility */
  'aria-label'?: string;
  /** ARIA role for accessibility */
  role?: string;
}

/**
 * Reusable animated element component that applies CSS animations with configurable options.
 * This serves as a drop-in replacement for simple framer-motion usage.
 *
 * Features:
 * - 5 animation variants: fade-up, fade-down, fade-left, fade-right, scale-in
 * - 3 speed variants: fast (0.3s), default (0.5s), slow (0.6s)
 * - Configurable delay in milliseconds
 * - Optional scroll-trigger using Intersection Observer
 * - Respects prefers-reduced-motion accessibility setting
 * - GPU-accelerated transforms for smooth performance
 *
 * @example
 * // Basic fade-up animation
 * <AnimatedElement animation="fade-up">
 *   <p>This fades in from bottom</p>
 * </AnimatedElement>
 *
 * @example
 * // With delay and scroll trigger
 * <AnimatedElement
 *   animation="fade-right"
 *   delay={200}
 *   scrollTrigger
 *   once
 * >
 *   <div>Animates when scrolled into view</div>
 * </AnimatedElement>
 *
 * @example
 * // As different HTML element with custom speed
 * <AnimatedElement
 *   as="section"
 *   animation="scale-in"
 *   speed="slow"
 *   timing="ease-spring"
 * >
 *   <h2>Section content</h2>
 * </AnimatedElement>
 *
 * @example
 * // Replacing framer-motion
 * // Before:
 * // <motion.div
 * //   initial={{ opacity: 0, y: 20 }}
 * //   animate={{ opacity: 1, y: 0 }}
 * //   transition={{ delay: 0.2 }}
 * // >
 * //
 * // After:
 * <AnimatedElement animation="fade-up" delay={200}>
 *   <div>Content</div>
 * </AnimatedElement>
 */
export const AnimatedElement: React.FC<AnimatedElementProps> = ({
  children,
  animation = 'fade-up',
  speed = 'default',
  timing = 'ease-out',
  delay = 0,
  scrollTrigger = false,
  once = true,
  threshold = 0.1,
  className = '',
  as: Component = 'div',
  onClick,
  id,
  'aria-label': ariaLabel,
  role,
}) => {
  // Check if animations should be reduced (mobile or OS preference)
  const prefersReducedMotion = useReducedMotion();

  // Use scroll animation hook if scrollTrigger is enabled
  const { isInView, ref } = useScrollAnimation({
    once,
    threshold,
  });

  // Map animation variants to Tailwind classes
  const animationClassMap: Record<AnimationVariant, Record<AnimationSpeed, string>> = {
    'fade-up': {
      fast: 'animate-fade-in-up-fast',
      default: 'animate-fade-in-up',
      slow: 'animate-fade-in-up-slow',
    },
    'fade-down': {
      fast: 'animate-fade-in-down-fast',
      default: 'animate-fade-in-down',
      slow: 'animate-fade-in-down-slow',
    },
    'fade-left': {
      fast: 'animate-fade-in-left-fast',
      default: 'animate-fade-in-left',
      slow: 'animate-fade-in-left-slow',
    },
    'fade-right': {
      fast: 'animate-fade-in-right-fast',
      default: 'animate-fade-in-right',
      slow: 'animate-fade-in-right-slow',
    },
    'scale-in': {
      fast: 'animate-scale-fade-in-fast',
      default: 'animate-scale-fade-in',
      slow: 'animate-scale-fade-in-slow',
    },
  };

  // Get the animation class based on variant and speed
  const animationClass = animationClassMap[animation][speed];

  // Map delay to Tailwind animation-delay classes
  const getDelayClass = (delayMs: number): string => {
    if (delayMs === 0) return '';
    if (delayMs <= 100) return 'animation-delay-100';
    if (delayMs <= 200) return 'animation-delay-200';
    if (delayMs <= 300) return 'animation-delay-300';
    if (delayMs <= 400) return 'animation-delay-400';
    if (delayMs <= 500) return 'animation-delay-500';
    if (delayMs <= 600) return 'animation-delay-600';
    if (delayMs <= 700) return 'animation-delay-700';
    if (delayMs <= 800) return 'animation-delay-800';
    if (delayMs <= 1000) return 'animation-delay-1000';
    if (delayMs <= 2000) return 'animation-delay-2000';
    return 'animation-delay-4000';
  };

  const delayClass = getDelayClass(delay);

  // Map timing to animation timing function classes
  const timingClassMap: Record<AnimationTiming, string> = {
    'ease-out': 'animation-ease-out',
    'ease-in-out': 'animation-ease-in-out',
    'ease-spring': 'animation-ease-spring',
  };

  const timingClass = timingClassMap[timing];

  // Build the final className
  // If scroll trigger is enabled, only apply animation when in view
  // Otherwise, apply animation immediately
  // Skip animations on mobile or if user prefers reduced motion
  const shouldAnimate = prefersReducedMotion ? false : (scrollTrigger ? isInView : true);

  // LCP OPTIMIZATION: For non-scroll-triggered animations without delay,
  // start visible to improve LCP metrics. The animation will still play
  // but content is immediately visible to the browser's LCP calculation.
  const isImmediateAnimation = !scrollTrigger && delay === 0;

  const baseClassName = shouldAnimate
    ? `${animationClass} ${delayClass} ${timingClass} animation-fill-forwards`
    : prefersReducedMotion
      ? '' // On mobile/reduced motion, show content immediately without opacity-0
      : isImmediateAnimation
        ? '' // For immediate animations, start visible for better LCP
        : 'opacity-0';

  const finalClassName = `${baseClassName} ${className}`.trim().replace(/\s+/g, ' ');

  // If scroll trigger is enabled, we need to pass the ref
  if (scrollTrigger) {
    return (
      <Component
        ref={ref as React.RefObject<any>}
        id={id}
        className={finalClassName}
        onClick={onClick}
        aria-label={ariaLabel}
        role={role}
      >
        {children}
      </Component>
    );
  }

  // Otherwise, render without ref
  return (
    <Component
      id={id}
      className={finalClassName}
      onClick={onClick}
      aria-label={ariaLabel}
      role={role}
    >
      {children}
    </Component>
  );
};

export default AnimatedElement;
