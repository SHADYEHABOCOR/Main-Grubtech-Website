import React from 'react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

type CardVariant = 'default' | 'elevated' | 'brand' | 'outline';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps {
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Card style variant */
  variant?: CardVariant;
  /** Enable hover lift effect */
  hoverable?: boolean;
  /** Show left border accent */
  leftBorder?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Padding size */
  padding?: CardPadding;
  /** Enable entrance animation */
  animate?: boolean;
}

/**
 * Card component with consistent styling.
 *
 * @example
 * <Card variant="elevated">Elevated card with shadow</Card>
 * <Card variant="brand">Card with brand shadow</Card>
 * <Card hoverable={false}>Static card</Card>
 */
export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  hoverable = true,
  leftBorder = false,
  onClick,
  padding = 'md',
  animate = true,
}) => {
  // Use scroll animation hook when animate is enabled
  const { isInView, ref } = useScrollAnimation<HTMLDivElement>({
    once: true,
    rootMargin: '-50px',
  });

  const variantStyles: Record<CardVariant, string> = {
    default: 'bg-white border border-gray-100',
    elevated: 'bg-white border border-gray-100 shadow-card',
    brand: 'bg-white border border-gray-100 shadow-xl shadow-blue-500/10',
    outline: 'bg-transparent border-2 border-gray-200',
  };

  const paddingStyles: Record<CardPadding, string> = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8 md:p-10',
  };

  const hoverStyles = hoverable
    ? 'hover:border-gray-200 hover:shadow-card-hover hover:-translate-y-0.5'
    : '';

  const baseClassName = `
    rounded-card flex flex-col
    transition-[border-color,box-shadow] duration-200
    ${variantStyles[variant]}
    ${paddingStyles[padding]}
    ${hoverStyles}
    ${leftBorder ? 'border-l-2 border-l-brand' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  // Add opacity and transform transition when animate is enabled
  const animationClassName = animate
    ? `transition-[opacity,transform] duration-500 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`
    : '';

  const finalClassName = `${baseClassName} ${animationClassName}`.trim().replace(/\s+/g, ' ');

  return (
    <div
      ref={animate ? ref : undefined}
      onClick={onClick}
      className={finalClassName}
    >
      {children}
    </div>
  );
};
