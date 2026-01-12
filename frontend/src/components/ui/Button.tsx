import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface ButtonProps {
  children: React.ReactNode;
  /** Button style variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'outline-dark' | 'white' | 'ghost';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Click handler */
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  /** Additional CSS classes */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state - shows spinner and disables interaction */
  loading?: boolean;
  /** Text to display when loading (optional) */
  loadingText?: string;
  /** Button type for forms */
  type?: 'button' | 'submit' | 'reset';
  /** Full width button */
  fullWidth?: boolean;
  /** Icon-only button (square) */
  iconOnly?: boolean;
}

/**
 * Button component with consistent styling and animations.
 * Memoized to prevent unnecessary re-renders when parent components update.
 *
 * @example
 * <Button variant="primary" size="lg">Get Started</Button>
 * <Button variant="outline">Learn More</Button>
 * <Button variant="ghost" iconOnly><ChevronRight /></Button>
 * <Button loading={true}>Submit</Button>
 * <Button loading={isSubmitting} loadingText="Sending...">Send Message</Button>
 */
export const Button: React.FC<ButtonProps> = React.memo(({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  className = '',
  disabled = false,
  loading = false,
  loadingText,
  type = 'button',
  fullWidth = false,
  iconOnly = false,
}) => {
  // Check if animations should be reduced (mobile or OS preference)
  const prefersReducedMotion = useReducedMotion();

  const baseStyles = 'inline-flex items-center justify-center rounded-button font-semibold transition-elegant relative overflow-hidden focus:outline-none focus-visible:ring-2 transition-transform duration-200 ease-out';

  const variantStyles = {
    primary: 'bg-brand text-white shadow-brand-sm hover:bg-brand-dark hover:shadow-brand',
    secondary: 'bg-white text-brand hover:bg-brand hover:text-white shadow-card hover:shadow-card-hover',
    outline: 'bg-transparent border-2 border-white text-white hover:bg-white hover:text-brand backdrop-blur-sm',
    'outline-dark': 'bg-transparent border-2 border-gray-200 text-gray-900 hover:border-brand hover:text-brand hover:bg-brand/5',
    white: 'bg-white text-text-primary hover:bg-surface-muted shadow-soft',
    ghost: 'bg-transparent text-text-secondary hover:text-brand hover:bg-surface-muted',
  };

  const focusStyles = {
    primary: 'focus-visible:ring-primary-300',
    secondary: 'focus-visible:ring-brand',
    outline: 'focus-visible:ring-brand focus-visible:ring-offset-2',
    'outline-dark': 'focus-visible:ring-brand focus-visible:ring-offset-2',
    white: 'focus-visible:ring-brand',
    ghost: 'focus-visible:ring-brand/50',
  };

  const sizeStyles = {
    sm: iconOnly ? 'p-2' : 'px-6 py-2.5 text-xs tracking-wide',
    md: iconOnly ? 'p-2.5' : 'px-8 py-3 text-sm tracking-wide',
    lg: iconOnly ? 'p-3' : 'px-10 py-4 text-base tracking-wide',
  };

  // Map button size to spinner size
  const spinnerSize = size === 'lg' ? 'md' : 'sm';

  // Determine spinner color based on variant
  const spinnerColor = variant === 'primary' || variant === 'outline' ? 'text-white' :
                       variant === 'secondary' || variant === 'white' ? 'text-brand' :
                       'text-current';

  // Button is disabled when explicitly disabled or loading
  const isDisabled = disabled || loading;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Don't prevent default for submit buttons - let the form handle it
    if (onClick && type !== 'submit') {
      onClick(e);
    } else if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={isDisabled}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${focusStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : !prefersReducedMotion ? 'hover:scale-[1.01] active:scale-[0.99]' : ''}
        ${variant === 'primary' ? 'group' : ''}
        ${className}
      `}
    >
      {/* Animated gradient overlay for primary button */}
      {variant === 'primary' && !isDisabled && !prefersReducedMotion && (
        <span
          className="absolute inset-0 bg-gradient-to-r from-primary-light via-primary to-primary-dark opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out"
        />
      )}

      {/* Shimmer effect on hover */}
      {variant === 'primary' && !isDisabled && !prefersReducedMotion && (
        <span
          className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />
      )}

      <span className="relative z-10 inline-flex items-center justify-center gap-2">
        {loading ? (
          <>
            <LoadingSpinner size={spinnerSize} color={spinnerColor} />
            {loadingText || children}
          </>
        ) : (
          children
        )}
      </span>
    </button>
  );
});
