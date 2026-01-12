import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Clock, Users } from 'lucide-react';
import { analytics } from '../../utils/analytics/analytics';

export const ROICalculator: React.FC = () => {
  const [inputs, setInputs] = useState({
    monthlyRevenue: 50000,
    locations: 1,
    avgOrderValue: 35,
    dailyOrders: 100,
  });

  const [results, setResults] = useState({
    timeSaved: 0,
    revenueIncrease: 0,
    costSavings: 0,
    totalROI: 0,
  });

  useEffect(() => {
    // Calculate ROI based on industry benchmarks
    const timeSaved = inputs.locations * 15; // Hours per month per location
    const revenueIncrease = inputs.monthlyRevenue * 0.18; // 18% average increase
    const costSavings = inputs.locations * 800; // Monthly cost savings per location
    const totalROI = revenueIncrease + costSavings;

    setResults({
      timeSaved,
      revenueIncrease,
      costSavings,
      totalROI,
    });

    // Track calculator usage
    analytics.track('pricing_calculator_use', {
      monthly_revenue: inputs.monthlyRevenue,
      locations: inputs.locations,
      avg_order_value: inputs.avgOrderValue,
      daily_orders: inputs.dailyOrders,
    });
  }, [inputs]);

  const handleChange = (field: keyof typeof inputs, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-border-light">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-8 h-8 text-primary" />
          <h3 className="text-2xl md:text-3xl font-bold text-text-primary">
            ROI Calculator
          </h3>
        </div>
        <p className="text-text-secondary">
          See how much you could save with Grubtech
        </p>
      </div>

      <div className="space-y-6 mb-8">
        {/* Monthly Revenue */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-text-primary">
              Monthly Revenue
            </label>
            <span className="text-lg font-bold text-primary">
              {formatCurrency(inputs.monthlyRevenue)}
            </span>
          </div>
          <input
            type="range"
            min="10000"
            max="500000"
            step="5000"
            value={inputs.monthlyRevenue}
            onChange={(e) => handleChange('monthlyRevenue', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-text-secondary mt-1">
            <span>$10K</span>
            <span>$500K</span>
          </div>
        </div>

        {/* Number of Locations */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-text-primary">
              Number of Locations
            </label>
            <span className="text-lg font-bold text-primary">
              {inputs.locations}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="50"
            step="1"
            value={inputs.locations}
            onChange={(e) => handleChange('locations', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-text-secondary mt-1">
            <span>1</span>
            <span>50+</span>
          </div>
        </div>

        {/* Average Order Value */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-text-primary">
              Average Order Value
            </label>
            <span className="text-lg font-bold text-primary">
              {formatCurrency(inputs.avgOrderValue)}
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={inputs.avgOrderValue}
            onChange={(e) => handleChange('avgOrderValue', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-text-secondary mt-1">
            <span>$10</span>
            <span>$100</span>
          </div>
        </div>

        {/* Daily Orders */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-text-primary">
              Daily Orders
            </label>
            <span className="text-lg font-bold text-primary">
              {inputs.dailyOrders}
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="500"
            step="10"
            value={inputs.dailyOrders}
            onChange={(e) => handleChange('dailyOrders', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-text-secondary mt-1">
            <span>10</span>
            <span>500+</span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm hover:scale-[1.02] transition-transform duration-200 ease-out">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-sm text-text-secondary">Time Saved</span>
            </div>
            <div className="text-2xl font-bold text-primary">
              {results.timeSaved} hrs/mo
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm hover:scale-[1.02] transition-transform duration-200 ease-out">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-sm text-text-secondary">Revenue Increase</span>
            </div>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(results.revenueIncrease)}/mo
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm hover:scale-[1.02] transition-transform duration-200 ease-out">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <span className="text-sm text-text-secondary">Cost Savings</span>
            </div>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(results.costSavings)}/mo
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm hover:scale-[1.02] transition-transform duration-200 ease-out">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-sm text-text-secondary">Total ROI</span>
            </div>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(results.totalROI)}/mo
            </div>
          </div>
        </div>

        <div className="bg-primary text-white rounded-lg p-4 text-center">
          <p className="text-sm mb-1">Yearly ROI</p>
          <p className="text-3xl font-bold">
            {formatCurrency(results.totalROI * 12)}
          </p>
        </div>
      </div>

      <p className="text-xs text-text-secondary text-center">
        * Calculations based on industry averages. Actual results may vary.
      </p>
    </div>
  );
};
