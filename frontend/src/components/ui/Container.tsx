import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  /** Container width variant */
  size?: 'default' | 'narrow' | 'wide' | 'full';
  /** Additional CSS classes */
  className?: string;
  /** HTML element to render */
  as?: 'div' | 'section' | 'article' | 'main' | 'header' | 'footer';
}

/**
 * Container component for consistent max-width and padding across the site.
 *
 * @example
 * <Container>Content at 1280px max</Container>
 * <Container size="narrow">Content at 672px max</Container>
 * <Container size="wide">Content at 1440px max</Container>
 */
export const Container: React.FC<ContainerProps> = ({
  children,
  size = 'default',
  className = '',
  as: Component = 'div',
}) => {
  const sizeStyles = {
    default: 'max-w-7xl', // 1280px
    narrow: 'max-w-narrow', // 672px
    wide: 'max-w-wide', // 1440px
    full: 'w-full',
  };

  return (
    <Component
      className={`
        ${sizeStyles[size]}
        mx-auto
        px-4 sm:px-6 lg:px-8
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {children}
    </Component>
  );
};
