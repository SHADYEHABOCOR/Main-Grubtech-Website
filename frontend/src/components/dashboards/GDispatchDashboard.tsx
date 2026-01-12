import React, { useState, useEffect } from 'react';
import { Navigation, Bike, MapPin, Timer } from 'lucide-react';

export const GDispatchDashboard: React.FC = () => {
  const [activeDeliveries, setActiveDeliveries] = useState(8);
  const [avgTime, setAvgTime] = useState(23);
  const [activeDriver, setActiveDriver] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDeliveries(() => Math.floor(Math.random() * 5) + 6);
      setAvgTime(() => Math.floor(Math.random() * 5) + 20);
      setActiveDriver((prev) => (prev + 1) % 3);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const drivers = [
    { id: 'D-001', status: 'delivering', distance: '2.3 km' },
    { id: 'D-002', status: 'assigned', distance: '1.1 km' },
    { id: 'D-003', status: 'returning', distance: '0.8 km' },
  ];

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'delivering': return 'En Route';
      case 'assigned': return 'Assigned';
      case 'returning': return 'Returning';
      default: return status;
    }
  };

  const getStatusStyle = (status: string, isActive: boolean) => {
    if (!isActive) return 'text-gray-500';
    switch (status) {
      case 'delivering': return 'text-blue-600';
      case 'assigned': return 'text-amber-600';
      case 'returning': return 'text-emerald-600';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 border border-gray-100 shadow-xl shadow-gray-900/5 relative overflow-visible">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 md:mb-6">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-primary/10 flex items-center justify-center">
            <Navigation className="w-3.5 h-3.5 md:w-5 md:h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-xs md:text-base">Dispatch</h4>
            <p className="text-[10px] md:text-xs text-gray-500">Smart delivery routing</p>
          </div>
        </div>
        <span className="relative flex h-1.5 w-1.5 md:h-2 md:w-2">
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-emerald-500"></span>
        </span>
      </div>

      {/* Delivery Metrics */}
      <div className="grid grid-cols-2 gap-2 md:gap-3 mb-3 md:mb-5">
        <div className="bg-gray-50/80 rounded-lg md:rounded-xl p-2.5 md:p-4 border border-gray-100">
          <div className="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-2">
            <Bike className="w-3 h-3 md:w-4 md:h-4 text-primary" />
            <span className="text-[10px] md:text-xs text-gray-500">Active</span>
          </div>
          <span className="text-lg md:text-2xl font-semibold text-gray-900 font-mono tracking-tight">
            {activeDeliveries}
          </span>
        </div>

        <div className="bg-gray-50/80 rounded-lg md:rounded-xl p-2.5 md:p-4 border border-gray-100">
          <div className="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-2">
            <Timer className="w-3 h-3 md:w-4 md:h-4 text-primary" />
            <span className="text-[10px] md:text-xs text-gray-500">Avg Time</span>
          </div>
          <span className="text-lg md:text-2xl font-semibold text-gray-900 font-mono tracking-tight">
            {avgTime}m
          </span>
        </div>
      </div>

      {/* Driver Status */}
      <div className="space-y-1.5 md:space-y-2">
        <p className="text-[10px] md:text-xs font-medium text-gray-500 mb-2 md:mb-3">Driver Activity</p>
        {drivers.map((driver, index) => {
          const isActive = activeDriver === index;
          return (
            <div
              key={driver.id}
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
                  <MapPin className={`w-3 h-3 md:w-4 md:h-4 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
                </div>
                <div>
                  <span className="text-xs md:text-sm font-medium text-gray-900 block">{driver.id}</span>
                  <span className={`text-[8px] md:text-[10px] font-medium ${getStatusStyle(driver.status, isActive)}`}>
                    {getStatusLabel(driver.status)}
                  </span>
                </div>
              </div>
              <span className="text-[10px] md:text-xs font-mono text-gray-500">{driver.distance}</span>
            </div>
          );
        })}
      </div>

      {/* Status */}
      <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-100 flex items-center justify-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-gray-400">
        <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-emerald-500" />
        <span>Optimizing routes</span>
      </div>
    </div>
  );
};
