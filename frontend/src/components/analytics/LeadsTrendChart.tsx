import React, { useState, useEffect } from 'react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useAdmin } from '../../context/AdminContext';

interface LeadsTrendChartProps {
  data: Array<{ date: string; count: number }>;
}

export const LeadsTrendChart: React.FC<LeadsTrendChartProps> = ({ data }) => {
  const { isDarkMode } = useAdmin();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Use requestAnimationFrame to wait for layout, then a small delay for stability
    let rafId: number;
    let timer: NodeJS.Timeout;
    rafId = requestAnimationFrame(() => {
      timer = setTimeout(() => setIsMounted(true), 50);
    });
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer);
    };
  }, []);

  const formattedData = data?.map(item => ({
    ...item,
    displayDate: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  })) || [];

  const maxCount = Math.max(...(formattedData.map(d => d.count) || [0]), 1);

  if (!data || data.length === 0) {
    return (
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
          <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>No trend data available</p>
        </div>
      </div>
    );
  }

  return (
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

      <div className="w-full" style={{ width: '100%', height: 256, minWidth: 0 }}>
        {isMounted && (
          <ResponsiveContainer width="100%" height="100%" debounce={50} minWidth={0} minHeight={0}>
            <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isDarkMode ? '#6366f1' : '#4f46e5'} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={isDarkMode ? '#6366f1' : '#4f46e5'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="displayDate"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 12,
                  fill: isDarkMode ? '#6b7280' : '#9ca3af',
                }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 12,
                  fill: isDarkMode ? '#6b7280' : '#9ca3af',
                }}
                domain={[0, Math.ceil(maxCount * 1.2)]}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                  border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  padding: '12px 16px',
                }}
                labelStyle={{
                  color: isDarkMode ? '#f3f4f6' : '#111827',
                  fontWeight: 600,
                  marginBottom: '4px',
                }}
                itemStyle={{
                  color: isDarkMode ? '#d1d5db' : '#4b5563',
                  fontSize: '13px',
                }}
                formatter={(value: number) => [`${value} leads`, '']}
                labelFormatter={(label) => label}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke={isDarkMode ? '#818cf8' : '#6366f1'}
                strokeWidth={2}
                fill="url(#leadGradient)"
                dot={false}
                activeDot={{
                  r: 5,
                  fill: isDarkMode ? '#818cf8' : '#6366f1',
                  stroke: isDarkMode ? '#1f2937' : '#ffffff',
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
