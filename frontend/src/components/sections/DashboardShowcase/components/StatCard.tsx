import React from 'react';

interface StatCardProps {
  /** Title of the stat */
  title: string;
  /** Main value to display */
  value: string;
  /** Optional decimal part of the value */
  subValue?: string;
  /** Optional currency or unit prefix (e.g., "AED", "$") */
  prefix?: string;
  /** Whether to reduce motion for accessibility */
  prefersReducedMotion?: boolean;
}

/**
 * StatCard component displays a single statistic with optional prefix and decimal values.
 * Used in the dashboard to show key metrics like orders, sales, VAT, and discounts.
 *
 * @example
 * <StatCard title="Number of Orders" value="70" />
 * <StatCard title="Net Sales" prefix="AED" value="3,114" subValue="14" />
 */
export const StatCard: React.FC<StatCardProps> = React.memo(({
  title,
  value,
  subValue,
  prefix,
  prefersReducedMotion = false,
}) => (
  <div
    className={`bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-20 hover:shadow-lg ${
      !prefersReducedMotion ? 'transition-shadow duration-300' : ''
    }`}
  >
    <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">
      {title}
    </span>
    <div className="mt-1">
      {prefix && (
        <span className="text-gray-400 font-medium text-xs mr-0.5">{prefix}</span>
      )}
      <span className="text-lg font-semibold text-gray-800">{value}</span>
      {subValue && (
        <span className="text-lg font-semibold text-gray-800">.{subValue}</span>
      )}
    </div>
  </div>
));
