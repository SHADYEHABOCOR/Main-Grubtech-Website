import React from 'react';
import { LucideIcon } from 'lucide-react';

interface IconWrapperProps {
  icon: LucideIcon;
  variant?: 'gradient' | 'solid' | 'outline' | 'glow';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animate?: boolean;
}

export const IconWrapper: React.FC<IconWrapperProps> = ({
  icon: Icon,
  variant = 'solid',
  size = 'md',
  className = '',
  animate = false,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  const variantClasses = {
    gradient: 'text-transparent bg-clip-text bg-gradient-to-br from-primary via-primary-light to-accent',
    solid: 'text-primary',
    outline: 'text-primary-light',
    glow: 'text-primary drop-shadow-[0_0_8px_rgba(13,71,192,0.5)]',
  };

  const animationClass = animate ? 'animate-float' : '';

  return (
    <div className={`inline-flex ${animationClass}`}>
      <Icon
        className={`${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
        strokeWidth={2.5}
      />
    </div>
  );
};
