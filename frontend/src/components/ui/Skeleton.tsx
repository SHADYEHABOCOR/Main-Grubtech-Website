import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

/**
 * Skeleton Component
 *
 * Displays an animated placeholder while content is loading.
 * Improves perceived performance and user experience.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%]',
    none: '',
  };

  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
};

/**
 * Blog Card Skeleton
 */
export const BlogCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      {/* Image skeleton */}
      <Skeleton className="w-full h-48" />

      <div className="p-6 space-y-4">
        {/* Badge skeleton */}
        <Skeleton className="w-20 h-6" />

        {/* Title skeleton */}
        <Skeleton className="w-full h-8" />
        <Skeleton className="w-3/4 h-8" />

        {/* Description skeleton */}
        <div className="space-y-2">
          <Skeleton variant="text" className="w-full" />
          <Skeleton variant="text" className="w-full" />
          <Skeleton variant="text" className="w-2/3" />
        </div>

        {/* Footer skeleton */}
        <div className="flex items-center justify-between pt-4">
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-20 h-4" />
        </div>
      </div>
    </div>
  );
};

/**
 * Table Row Skeleton
 */
export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 4 }) => {
  return (
    <tr className="border-b border-gray-200 dark:border-gray-700">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-6 py-4">
          <Skeleton variant="text" className="w-full" />
        </td>
      ))}
    </tr>
  );
};

/**
 * List Item Skeleton
 */
export const ListItemSkeleton: React.FC = () => {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" className="w-3/4" />
        <Skeleton variant="text" className="w-1/2" />
      </div>
    </div>
  );
};

/**
 * Card Grid Skeleton
 * Displays a grid of card skeletons
 */
export const CardGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, index) => (
        <BlogCardSkeleton key={index} />
      ))}
    </div>
  );
};

/**
 * Page Loading Skeleton
 */
export const PageLoadingSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header skeleton */}
      <div className="mb-8">
        <Skeleton className="w-64 h-10 mb-4" />
        <Skeleton variant="text" className="w-full max-w-2xl" />
      </div>

      {/* Content skeleton */}
      <CardGridSkeleton count={6} />
    </div>
  );
};

/**
 * Job Card Skeleton
 * Used for career/job listing pages
 */
export const JobCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          {/* Title */}
          <Skeleton className="w-3/4 h-6" />
          {/* Meta info */}
          <div className="flex gap-4">
            <Skeleton className="w-24 h-4" />
            <Skeleton className="w-20 h-4" />
          </div>
          {/* Description */}
          <div className="space-y-2 pt-2">
            <Skeleton variant="text" className="w-full" />
            <Skeleton variant="text" className="w-5/6" />
          </div>
        </div>
        {/* Button */}
        <Skeleton className="w-28 h-10 flex-shrink-0" />
      </div>
    </div>
  );
};

/**
 * Job Department Section Skeleton
 * Skeleton for a department with multiple job cards
 */
export const JobDepartmentSkeleton: React.FC<{ jobs?: number }> = ({ jobs = 2 }) => {
  return (
    <div className="bg-gray-50 rounded-2xl p-6 md:p-8 space-y-6">
      {/* Department header */}
      <div className="space-y-2">
        <Skeleton className="w-40 h-8" />
        <Skeleton className="w-32 h-4" />
      </div>
      {/* Job cards */}
      <div className="space-y-4">
        {Array.from({ length: jobs }).map((_, index) => (
          <JobCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};

/**
 * Integration Card Skeleton
 */
export const IntegrationCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-8 text-center">
      <div className="flex flex-col items-center">
        <Skeleton className="w-20 h-20 mb-4" />
        <Skeleton className="w-32 h-6 mb-2" />
        <Skeleton className="w-full h-4 mb-1" />
        <Skeleton className="w-3/4 h-4" />
      </div>
    </div>
  );
};
