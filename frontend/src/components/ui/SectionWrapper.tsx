import React from 'react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

interface SectionWrapperProps {
  children: React.ReactNode;
  /** Background variant */
  background?: 'white' | 'brand-light' | 'gradient' | 'transparent';
  /** Vertical padding size */
  padding?: 'default' | 'small' | 'compact' | 'hero' | 'none';
  /** Additional CSS classes */
  className?: string;
  /** Enable overflow hidden */
  overflow?: boolean;
  /** Enable fade-in animation */
  animate?: boolean;
  /** HTML id attribute for anchor links */
  id?: string;
}

/**
 * SectionWrapper component for consistent section styling.
 * Handles background colors, padding, and optional animations.
 *
 * @example
 * <SectionWrapper background="brand-light" padding="default">
 *   <Container>Section content</Container>
 * </SectionWrapper>
 */
export const SectionWrapper: React.FC<SectionWrapperProps> = ({
  children,
  background = 'white',
  padding = 'default',
  className = '',
  overflow = true,
  animate = false,
  id,
}) => {
  const backgroundStyles = {
    white: 'bg-white',
    'brand-light': 'bg-surface-brand-light',
    gradient: 'bg-hero-gradient',
    transparent: 'bg-transparent',
  };

  const paddingStyles = {
    default: 'py-12 sm:py-16 md:py-28',
    small: 'py-10 sm:py-12 md:py-24',
    compact: 'py-8 sm:py-10 md:py-16',
    hero: 'pt-24 pb-20 sm:pt-28 sm:pb-32 md:pt-40 md:pb-80 lg:pt-48 lg:pb-96',
    none: '',
  };

  // Use scroll animation hook when animate is enabled
  const { isInView, ref } = useScrollAnimation<HTMLElement>({
    once: true,
    rootMargin: '-100px',
  });

  const baseClassName = `
    ${backgroundStyles[background]}
    ${paddingStyles[padding]}
    ${overflow ? 'overflow-hidden' : ''}
    relative
    ${className}
  `.trim().replace(/\s+/g, ' ');

  // Add opacity transition when animate is enabled
  const animationClassName = animate
    ? `transition-opacity duration-500 ${isInView ? 'opacity-100' : 'opacity-0'}`
    : '';

  const finalClassName = `${baseClassName} ${animationClassName}`.trim().replace(/\s+/g, ' ');

  return (
    <section
      ref={animate ? ref : undefined}
      id={id}
      className={finalClassName}
    >
      {children}
    </section>
  );
};
