import React, { lazy, Suspense } from 'react';

interface HomeDashboardContentProps {
  prefersReducedMotion?: boolean;
}

// Lazy load the actual dashboard component with Recharts
const HomeDashboardContentComponent = lazy(() =>
  import('./HomeDashboardContent').then(module => ({
    default: module.HomeDashboardContent
  }))
);

/**
 * Lazy-loaded wrapper for HomeDashboardContent to improve initial bundle size.
 * The chart library (Recharts) is only loaded when this component is rendered.
 */
export const HomeDashboardContent: React.FC<HomeDashboardContentProps> = (props) => {
  return (
    <Suspense
      fallback={
        <div className="p-8 bg-[#f8fafc] min-h-full">
          <div className="mb-8">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="h-10 w-full bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-4 gap-5 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-white rounded-xl shadow-sm border border-gray-100 animate-pulse" />
            ))}
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="h-[280px] flex items-center justify-center">
              <div className="text-sm text-gray-400 animate-pulse">Loading dashboard...</div>
            </div>
          </div>
        </div>
      }
    >
      <HomeDashboardContentComponent {...props} />
    </Suspense>
  );
};
