import React, { useState, useEffect } from 'react';
import { Monitor, Clock } from 'lucide-react';

export const GKDSDashboard: React.FC = () => {
  const [activeOrder, setActiveOrder] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveOrder(prev => (prev + 1) % 3);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const orders = [
    { id: '#4521', items: '3 items', time: '02:45', status: 'pending', priority: 'normal' },
    { id: '#4522', items: '5 items', time: '05:12', status: 'preparing', priority: 'high' },
    { id: '#4523', items: '2 items', time: '01:20', status: 'ready', priority: 'normal' },
  ];

  const getStatusStyle = (status: string, isActive: boolean) => {
    if (!isActive) return { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200' };
    switch (status) {
      case 'pending': return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' };
      case 'preparing': return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' };
      case 'ready': return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200' };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'New';
      case 'preparing': return 'In Progress';
      case 'ready': return 'Ready';
      default: return status;
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 border border-gray-100 shadow-xl shadow-gray-900/5 relative overflow-visible">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 md:mb-6">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-primary/10 flex items-center justify-center">
            <Monitor className="w-3.5 h-3.5 md:w-5 md:h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-xs md:text-base">Kitchen Display</h4>
            <p className="text-[10px] md:text-xs text-gray-500">Live order queue</p>
          </div>
        </div>
        <span className="relative flex h-1.5 w-1.5 md:h-2 md:w-2">
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-emerald-500"></span>
        </span>
      </div>

      {/* Active Orders Count */}
      <div className="bg-gray-50/80 rounded-lg md:rounded-xl p-2.5 md:p-4 mb-3 md:mb-5 border border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-xs md:text-sm text-gray-500">Active Orders</span>
          <span className="text-lg md:text-2xl font-semibold text-gray-900 font-mono tracking-tight">3</span>
        </div>
      </div>

      {/* Order Queue */}
      <div className="space-y-1.5 md:space-y-2">
        {orders.map((order, index) => {
          const isActive = activeOrder === index;
          const statusStyle = getStatusStyle(order.status, isActive);
          return (
            <div
              key={order.id}
              className={`p-2 md:p-3 rounded-lg md:rounded-xl border transition-all duration-200 ${
                isActive
                  ? 'bg-primary/5 border-primary/20'
                  : 'bg-gray-50/80 border-gray-100'
              }`}
            >
              <div className="flex items-center justify-between mb-1 md:mb-2">
                <div className="flex items-center gap-1.5 md:gap-2">
                  <span className="text-xs md:text-sm font-semibold text-gray-900">{order.id}</span>
                  {order.priority === 'high' && (
                    <span className="text-[8px] md:text-[10px] px-1.5 md:px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-600 font-medium">
                      Priority
                    </span>
                  )}
                </div>
                <span className={`text-[8px] md:text-[10px] px-1.5 md:px-2 py-0.5 md:py-1 rounded-full font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] md:text-xs text-gray-500">{order.items}</span>
                <div className="flex items-center gap-1 md:gap-1.5">
                  {isActive && (
                    <Clock className="w-2.5 h-2.5 md:w-3 md:h-3 text-primary" />
                  )}
                  <span className="text-[10px] md:text-xs font-mono text-gray-500">{order.time}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Status */}
      <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-100 flex items-center justify-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-gray-400">
        <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-emerald-500" />
        <span>Kitchen updates live</span>
      </div>
    </div>
  );
};
