import React from 'react';
import { AnimatedElement } from './AnimatedElement';

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type HeadingVariant = 'display' | 'section' | 'card' | 'default';

interface HeadingProps {
  children: React.ReactNode;
  /** HTML heading level (h1-h6) */
  level?: HeadingLevel;
  /** Visual style variant */
  variant?: HeadingVariant;
  /** Text color */
  color?: 'primary' | 'white' | 'brand' | 'inherit';
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Additional CSS classes */
  className?: string;
  /** Enable fade-in animation */
  animate?: boolean;
  /** Apply text shadow (useful on gradients) */
  shadow?: boolean;
}

/**
 * Heading component with consistent typography across the site.
 *
 * @example
 * <Heading level={1} variant="display">Hero Title</Heading>
 * <Heading level={2} variant="section" align="center">Section Title</Heading>
 * <Heading level={3} variant="card">Card Title</Heading>
 */
export const Heading: React.FC<HeadingProps> = ({
  children,
  level = 2,
  variant = 'default',
  color = 'primary',
  align = 'left',
  className = '',
  animate = false,
  shadow = false,
}) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  // Typography styles based on variant
  const variantStyles: Record<HeadingVariant, string> = {
    display: 'text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tighter',
    section: 'text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold leading-snug mb-3 md:mb-6',
    card: 'text-xl md:text-2xl font-bold leading-snug',
    default: 'font-bold leading-snug',
  };

  // Default sizes if no variant specified
  const levelStyles: Record<HeadingLevel, string> = {
    1: 'text-4xl md:text-5xl lg:text-6xl',
    2: 'text-3xl md:text-4xl lg:text-5xl',
    3: 'text-2xl md:text-3xl',
    4: 'text-xl md:text-2xl',
    5: 'text-lg md:text-xl',
    6: 'text-base md:text-lg',
  };

  const colorStyles: Record<string, string> = {
    primary: 'text-text-primary',
    white: 'text-white',
    brand: 'text-brand',
    inherit: '',
  };

  const alignStyles: Record<string, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const finalClassName = `
    ${variant === 'default' ? levelStyles[level] : ''}
    ${variantStyles[variant]}
    ${colorStyles[color]}
    ${alignStyles[align]}
    ${shadow ? 'text-shadow-sm' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  if (animate) {
    return (
      <AnimatedElement
        animation="fade-up"
        scrollTrigger
        once
      >
        <Tag className={finalClassName}>{children}</Tag>
      </AnimatedElement>
    );
  }

  return <Tag className={finalClassName}>{children}</Tag>;
};
