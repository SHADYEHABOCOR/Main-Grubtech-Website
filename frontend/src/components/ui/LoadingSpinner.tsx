import React from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = React.memo(({
  size = 'md',
  color = 'text-primary',
  className = '',
}) => {
  // Check if animations should be reduced (mobile or OS preference)
  const prefersReducedMotion = useReducedMotion();

  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  // Use pulsing animation instead of spinning for reduced motion
  // Loading indicators convey important state information and should remain animated,
  // but with a less disorienting motion (opacity pulse instead of rotation)
  const animationClass = prefersReducedMotion ? 'animate-pulse' : 'animate-spin';

  return (
    <div className={`${animationClass} ${sizeStyles[size]} ${color} ${className}`}>
      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
});
