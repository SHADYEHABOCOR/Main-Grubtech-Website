import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fullScreen?: boolean;
  text?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  className = '',
  fullScreen = false,
  text,
}) => {
  const sizeStyles = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4',
  };

  const spinner = (
    <div
      className={`${sizeStyles[size]} border-primary/20 border-t-primary rounded-full animate-spin ${className}`}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        {spinner}
        {text && <p className="mt-4 text-sm text-gray-600">{text}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center">
      {spinner}
      {text && <p className="mt-2 text-sm text-gray-600">{text}</p>}
    </div>
  );
};
