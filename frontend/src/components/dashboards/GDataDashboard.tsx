import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Activity, ArrowUpRight } from 'lucide-react';

export const GDataDashboard: React.FC = () => {
  const [revenue, setRevenue] = useState(45230);
  const [growth, setGrowth] = useState(23);
  const [activeMetric, setActiveMetric] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRevenue((prev) => prev + Math.floor(Math.random() * 500) - 200);
      setGrowth(() => Math.floor(Math.random() * 10) + 18);
      setActiveMetric((prev) => (prev + 1) % 3);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const metrics = [
    { label: 'Revenue', value: `$${(revenue / 1000).toFixed(1)}k`, change: '+12%', icon: TrendingUp },
    { label: 'Orders', value: '1,247', change: '+8%', icon: Activity },
    { label: 'Avg Order', value: '$36.24', change: '+5%', icon: BarChart3 },
  ];

  const chartBars = [
    { day: 'Mon', height: 65 },
    { day: 'Tue', height: 45 },
    { day: 'Wed', height: 80 },
    { day: 'Thu', height: 60 },
    { day: 'Fri', height: 90 },
    { day: 'Sat', height: 75 },
    { day: 'Sun', height: 55 },
  ];

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-100 shadow-xl shadow-gray-900/5 relative overflow-visible">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Analytics</h4>
            <p className="text-xs text-gray-500">Real-time insights</p>
          </div>
        </div>
        <span className="relative flex h-2 w-2">
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const isActive = activeMetric === index;
          return (
            <div
              key={metric.label}
              className={`rounded-xl p-3 border transition-all duration-200 ${
                isActive
                  ? 'bg-primary/5 border-primary/20'
                  : 'bg-gray-50/80 border-gray-100'
              }`}
            >
              <Icon className={`w-4 h-4 mb-2 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
              <div className="text-lg font-semibold text-gray-900 font-mono tracking-tight">
                {metric.value}
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-gray-500">{metric.label}</span>
                <span className="text-[10px] font-medium text-emerald-600">{metric.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100 mb-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-medium text-gray-600">Weekly Performance</span>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50">
            <ArrowUpRight className="w-3 h-3 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-600">+{growth}%</span>
          </div>
        </div>
        <div className="flex items-end gap-2 h-20">
          {chartBars.map((bar) => (
            <div key={bar.day} className="flex-1 flex flex-col items-center gap-1.5">
              <div
                className="w-full bg-primary/80 rounded-sm transition-all duration-300"
                style={{ height: `${bar.height}%` }}
              />
              <span className="text-[10px] text-gray-400">{bar.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-500 mb-2">Quick Insights</p>
        {[
          { label: 'Top selling item: Margherita Pizza' },
          { label: 'Peak hours: 12-2pm, 6-8pm' },
        ].map((insight, i) => (
          <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-gray-50/80 border border-gray-100">
            <div className="w-1 h-4 bg-primary/60 rounded-full" />
            <span className="text-xs text-gray-600">{insight.label}</span>
          </div>
        ))}
      </div>

      {/* Status */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-400">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span>Live data tracking</span>
      </div>
    </div>
  );
};
