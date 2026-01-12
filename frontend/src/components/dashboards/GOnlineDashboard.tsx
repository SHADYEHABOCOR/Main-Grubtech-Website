import React, { useState, useEffect } from 'react';
import { Layers, CheckCircle2, Activity } from 'lucide-react';

interface GOnlineDashboardProps {
  className?: string;
}

export const GOnlineDashboard: React.FC<GOnlineDashboardProps> = ({ className }) => {
  const [orderCount, setOrderCount] = useState(24);
  const [activePlatform, setActivePlatform] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setOrderCount(prev => prev + Math.floor(Math.random() * 3));
      setActivePlatform(prev => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const platforms = [
    { name: 'Talabat', orders: 8 },
    { name: 'Careem', orders: 6 },
    { name: 'Foodics', orders: 5 },
    { name: 'Marn', orders: 5 },
  ];

  return (
    <div className={`bg-white/90 backdrop-blur-xl rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 border border-gray-100 shadow-xl shadow-gray-900/5 relative overflow-visible ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 md:mb-6">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-primary/10 flex items-center justify-center">
            <Layers className="w-3.5 h-3.5 md:w-5 md:h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-xs md:text-base">Aggregation</h4>
            <p className="text-[10px] md:text-xs text-gray-500">All platforms unified</p>
          </div>
        </div>
        <span className="relative flex h-1.5 w-1.5 md:h-2 md:w-2">
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-emerald-500"></span>
        </span>
      </div>

      {/* Total Orders */}
      <div className="bg-gray-50/80 rounded-lg md:rounded-xl p-2.5 md:p-4 mb-3 md:mb-5 border border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-xs md:text-sm text-gray-500">Total Orders Today</span>
          <span className="text-lg md:text-2xl font-semibold text-gray-900 font-mono tracking-tight">
            {orderCount}
          </span>
        </div>
      </div>

      {/* Platform List */}
      <div className="space-y-1.5 md:space-y-2">
        {platforms.map((platform, index) => {
          const isActive = activePlatform === index;
          return (
            <div
              key={platform.name}
              className={`flex items-center justify-between p-2 md:p-3 rounded-lg md:rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-primary/5 border border-primary/20'
                  : 'bg-gray-50/80 border border-gray-100'
              }`}
            >
              <div className="flex items-center gap-2 md:gap-3">
                <div className={`w-6 h-6 md:w-8 md:h-8 rounded-md md:rounded-lg flex items-center justify-center ${
                  isActive ? 'bg-primary/10' : 'bg-gray-100'
                }`}>
                  {isActive ? (
                    <Activity className="w-3 h-3 md:w-4 md:h-4 text-primary" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 text-primary" />
                  )}
                </div>
                <span className="text-xs md:text-sm font-medium text-gray-900">{platform.name}</span>
              </div>
              <span className="text-xs md:text-sm font-mono font-medium text-gray-600">{platform.orders}</span>
            </div>
          );
        })}
      </div>

      {/* Status */}
      <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-100 flex items-center justify-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-gray-400">
        <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-emerald-500" />
        <span>Syncing in real-time</span>
      </div>
    </div>
  );
};
