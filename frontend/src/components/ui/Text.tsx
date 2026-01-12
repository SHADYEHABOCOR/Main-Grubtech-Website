import React from 'react';
import { AnimatedElement } from './AnimatedElement';

type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl';
type TextColor = 'primary' | 'secondary' | 'tertiary' | 'white' | 'brand' | 'inherit';

interface TextProps {
  children: React.ReactNode;
  /** Text size */
  size?: TextSize;
  /** Text color */
  color?: TextColor;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Font weight */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  /** Line height variant */
  leading?: 'tight' | 'normal' | 'relaxed';
  /** Max width constraint */
  maxWidth?: 'prose' | 'narrow' | 'none';
  /** Additional CSS classes */
  className?: string;
  /** HTML element to render */
  as?: 'p' | 'span' | 'div' | 'label';
  /** Enable fade-in animation */
  animate?: boolean;
  /** Apply text shadow */
  shadow?: boolean;
}

/**
 * Text component for consistent body text styling.
 *
 * @example
 * <Text>Default paragraph text</Text>
 * <Text size="lg" color="secondary" align="center">Large centered secondary text</Text>
 * <Text as="span" weight="semibold">Inline bold text</Text>
 */
export const Text: React.FC<TextProps> = ({
  children,
  size = 'base',
  color = 'secondary',
  align = 'left',
  weight = 'normal',
  leading = 'relaxed',
  maxWidth = 'none',
  className = '',
  as: Component = 'p',
  animate = false,
  shadow = false,
}) => {
  const sizeStyles: Record<TextSize, string> = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg md:text-xl',
    xl: 'text-xl md:text-2xl',
  };

  const colorStyles: Record<TextColor, string> = {
    primary: 'text-text-primary',
    secondary: 'text-text-secondary',
    tertiary: 'text-text-tertiary',
    white: 'text-white',
    brand: 'text-brand',
    inherit: '',
  };

  const alignStyles: Record<string, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const weightStyles: Record<string, string> = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  const leadingStyles: Record<string, string> = {
    tight: 'leading-tight',
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
  };

  const maxWidthStyles: Record<string, string> = {
    prose: 'max-w-prose mx-auto',
    narrow: 'max-w-3xl mx-auto',
    none: '',
  };

  const finalClassName = `
    ${sizeStyles[size]}
    ${colorStyles[color]}
    ${alignStyles[align]}
    ${weightStyles[weight]}
    ${leadingStyles[leading]}
    ${maxWidthStyles[maxWidth]}
    ${shadow ? 'text-shadow' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  if (animate) {
    return (
      <AnimatedElement
        animation="fade-up"
        speed="fast"
        delay={100}
        scrollTrigger
        once
      >
        <Component className={finalClassName}>{children}</Component>
      </AnimatedElement>
    );
  }

  return <Component className={finalClassName}>{children}</Component>;
};
