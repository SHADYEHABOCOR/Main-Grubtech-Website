import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

interface LiveAnalyticsCardProps {
  title: string;
  value: number;
  previousValue?: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  subtitle?: string;
  isLive?: boolean;
}

export const LiveAnalyticsCard: React.FC<LiveAnalyticsCardProps> = React.memo(({
  title,
  value,
  previousValue,
  icon: Icon,
  color,
  subtitle,
  isLive = false,
}) => {
  const { isDarkMode } = useAdmin();
  const trend = previousValue !== undefined ? ((value - previousValue) / (previousValue || 1)) * 100 : 0;
  const isPositive = trend > 0;
  const isNeutral = trend === 0;

  const colorName = color.replace('bg-', '').replace('-500', '');

  return (
    <div
      className={`animate-fade-in-up-fast relative p-5 rounded-2xl transition-all duration-200 ${
        isDarkMode
          ? 'bg-gray-900 border border-gray-800'
          : 'bg-white border border-gray-100'
      }`}
    >
      {/* Subtle top accent line */}
      <div
        className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl ${
          colorName === 'blue' ? 'bg-blue-500' :
          colorName === 'green' ? 'bg-emerald-500' :
          colorName === 'purple' ? 'bg-violet-500' :
          colorName === 'orange' ? 'bg-amber-500' :
          'bg-gray-400'
        }`}
      />

      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${
          isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
        }`}>
          <Icon className={`w-5 h-5 ${
            colorName === 'blue' ? 'text-blue-500' :
            colorName === 'green' ? 'text-emerald-500' :
            colorName === 'purple' ? 'text-violet-500' :
            colorName === 'orange' ? 'text-amber-500' :
            'text-gray-500'
          }`} />
        </div>

        {isLive && (
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${
            isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50'
          }`}>
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-semibold tracking-wide text-emerald-600 uppercase">Live</span>
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-1">
        <span className={`text-3xl font-semibold tracking-tight ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {value.toLocaleString()}
        </span>
      </div>

      {/* Title and trend */}
      <div className="flex items-center justify-between gap-2">
        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {title}
        </span>

        {previousValue !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
            isNeutral
              ? isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'
              : isPositive
                ? isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                : isDarkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'
          }`}>
            {isNeutral ? (
              <Minus className="w-3 h-3" />
            ) : isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{Math.abs(trend).toFixed(0)}%</span>
          </div>
        )}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
});
