import React, { lazy, Suspense } from 'react';

interface SalesReportsContentProps {
  prefersReducedMotion?: boolean;
}

// Lazy load the actual sales reports component with Recharts
const SalesReportsContentComponent = lazy(() =>
  import('./SalesReportsContent').then(module => ({
    default: module.SalesReportsContent
  }))
);

/**
 * Lazy-loaded wrapper for SalesReportsContent to improve initial bundle size.
 * The chart library (Recharts) is only loaded when this component is rendered.
 */
export const SalesReportsContent: React.FC<SalesReportsContentProps> = (props) => {
  return (
    <Suspense
      fallback={
        <div className="p-6 bg-[#f8fafc] min-h-full">
          <div className="mb-5">
            <div className="h-10 w-full bg-gray-100 rounded animate-pulse mb-3" />
            <div className="h-12 w-full bg-gray-50 rounded animate-pulse" />
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-5">
            <div className="h-[160px] flex items-center justify-center">
              <div className="text-sm text-gray-400 animate-pulse">Loading sales reports...</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="h-64 flex items-center justify-center">
              <div className="text-sm text-gray-400 animate-pulse">Loading table...</div>
            </div>
          </div>
        </div>
      }
    >
      <SalesReportsContentComponent {...props} />
    </Suspense>
  );
};
