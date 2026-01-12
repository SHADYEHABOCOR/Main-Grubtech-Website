import React from 'react';

type BadgeVariant = 'primary' | 'secondary' | 'brand' | 'success' | 'warning' | 'error' | 'neutral';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  /** Badge style variant */
  variant?: BadgeVariant;
  /** Badge size */
  size?: BadgeSize;
  /** Additional CSS classes */
  className?: string;
  /** Optional icon (rendered before text) */
  icon?: React.ReactNode;
  /** Dot indicator instead of icon */
  dot?: boolean;
}

/**
 * Badge component for labels, tags, and status indicators.
 *
 * @example
 * <Badge variant="primary">New Feature</Badge>
 * <Badge variant="success" icon={<Check />}>Verified</Badge>
 * <Badge variant="brand" dot>Active</Badge>
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  icon,
  dot = false,
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    primary: 'bg-brand-100 text-brand border-brand-200',
    secondary: 'bg-white/20 text-white border-white/30 backdrop-blur-sm',
    brand: 'bg-blue-100 text-blue-700 border-blue-200',
    success: 'bg-green-100 text-green-700 border-green-200',
    warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    error: 'bg-red-100 text-red-700 border-red-200',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const sizeStyles: Record<BadgeSize, string> = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-sm gap-1.5',
    lg: 'px-4 py-1.5 text-base gap-2',
  };

  const dotSizeStyles: Record<BadgeSize, string> = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  return (
    <span
      className={`
        inline-flex items-center font-semibold rounded-badge border
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {dot && (
        <span
          className={`
            ${dotSizeStyles[size]}
            rounded-full bg-current opacity-70
          `}
        />
      )}
      {icon && !dot && (
        <span className="flex-shrink-0">{icon}</span>
      )}
      {children}
    </span>
  );
};
