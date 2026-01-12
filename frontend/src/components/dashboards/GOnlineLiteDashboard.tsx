import React, { useState, useEffect } from 'react';
import { Zap, CheckCircle2, Clock } from 'lucide-react';

export const GOnlineLiteDashboard: React.FC = () => {
  const [progress, setProgress] = useState(75);
  const [activeStep, setActiveStep] = useState(2);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev >= 100 ? 75 : prev + 5));
      setActiveStep(prev => (prev + 1) % 3);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { name: 'Quick Setup', completed: true },
    { name: 'Order Management', completed: true },
    { name: 'Basic Reporting', completed: false },
  ];

  const steps = [
    { label: 'Setup', time: '5 min' },
    { label: 'Configure', time: '10 min' },
    { label: 'Launch', time: '2 min' },
  ];

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 border border-gray-100 shadow-xl shadow-gray-900/5 relative overflow-visible">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 md:mb-6">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-primary/10 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 md:w-5 md:h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-xs md:text-base">Quick Start</h4>
            <p className="text-[10px] md:text-xs text-gray-500">Ready in minutes</p>
          </div>
        </div>
        <span className="relative flex h-1.5 w-1.5 md:h-2 md:w-2">
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-emerald-500"></span>
        </span>
      </div>

      {/* Setup Progress */}
      <div className="bg-gray-50/80 rounded-lg md:rounded-xl p-2.5 md:p-4 mb-3 md:mb-5 border border-gray-100">
        <div className="flex items-center justify-between mb-2 md:mb-3">
          <span className="text-xs md:text-sm text-gray-500">Setup Progress</span>
          <span className="text-xs md:text-sm font-semibold text-gray-900 font-mono">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1 md:h-1.5 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Setup Steps */}
      <div className="space-y-1.5 md:space-y-2">
        {steps.map((step, index) => {
          const isActive = activeStep === index;
          return (
            <div
              key={step.label}
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
                  {features[index]?.completed ? (
                    <CheckCircle2 className={`w-3 h-3 md:w-4 md:h-4 ${isActive ? 'text-primary' : 'text-emerald-500'}`} />
                  ) : (
                    <Clock className={`w-3 h-3 md:w-4 md:h-4 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
                  )}
                </div>
                <span className="text-xs md:text-sm font-medium text-gray-900">{step.label}</span>
              </div>
              <span className="text-[10px] md:text-xs font-mono text-gray-500">{step.time}</span>
            </div>
          );
        })}
        {/* Go Live row */}
        <div className="flex items-center justify-between p-2 md:p-3 rounded-lg md:rounded-xl bg-gray-50/80 border border-gray-100">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-md md:rounded-lg flex items-center justify-center bg-gray-100">
              <Zap className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
            </div>
            <span className="text-xs md:text-sm font-medium text-gray-900">Go Live</span>
          </div>
          <span className="text-[10px] md:text-xs font-mono text-gray-500">Ready</span>
        </div>
      </div>

      {/* Status */}
      <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-100 flex items-center justify-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-gray-400">
        <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-emerald-500" />
        <span>Setup in progress</span>
      </div>
    </div>
  );
};
