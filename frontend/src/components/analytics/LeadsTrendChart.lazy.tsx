import React, { lazy, Suspense } from 'react';
import { useAdmin } from '../../context/AdminContext';

interface LeadsTrendChartProps {
  data: Array<{ date: string; count: number }>;
}

// Lazy load the actual chart component
const LeadsTrendChartComponent = lazy(() =>
  import('./LeadsTrendChart').then(module => ({
    default: module.LeadsTrendChart
  }))
);

/**
 * Lazy-loaded wrapper for LeadsTrendChart to improve initial bundle size.
 * The chart library (Recharts) is only loaded when this component is rendered.
 */
export const LeadsTrendChart: React.FC<LeadsTrendChartProps> = (props) => {
  const { isDarkMode } = useAdmin();

  return (
    <Suspense
      fallback={
        <div
          className={`animate-fade-in-up-fast rounded-2xl p-6 ${
            isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-100'
          }`}
        >
          <div className="mb-6">
            <h3 className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Leads Trend
            </h3>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Daily lead capture over the last 7 days
            </p>
          </div>
          <div className="flex items-center justify-center" style={{ height: 256 }}>
            <div className={`animate-pulse text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Loading chart...
            </div>
          </div>
        </div>
      }
    >
      <LeadsTrendChartComponent {...props} />
    </Suspense>
  );
};
