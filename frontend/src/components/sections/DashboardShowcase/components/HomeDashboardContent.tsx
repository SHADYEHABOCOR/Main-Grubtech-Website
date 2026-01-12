import React, { useRef } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Download, Filter, ChevronDown } from 'lucide-react';
import { useChartReady } from '../../../../hooks/useChartReady';
import { StatCard } from './StatCard';
import { barChartData, recentOrders } from '../data';

interface HomeDashboardContentProps {
  /** Whether to reduce motion for accessibility */
  prefersReducedMotion?: boolean;
}

/**
 * HomeDashboardContent component displays the home dashboard view.
 * Includes stats grid (orders, sales, VAT, discounts), bar chart showing
 * order distribution across channels, and recent orders table.
 *
 * @example
 * <HomeDashboardContent />
 * <HomeDashboardContent prefersReducedMotion={true} />
 */
export const HomeDashboardContent: React.FC<HomeDashboardContentProps> = ({
  prefersReducedMotion = false,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const isChartReady = useChartReady(chartContainerRef);

  return (
    <div className="p-8 bg-[#f8fafc] min-h-full">
      {/* Header */}
      <div className="mb-8">
        <h2
          data-tutorial-target="home-welcome"
          className="text-lg font-medium text-gray-800 mb-4"
        >
          Welcome, <span className="text-blue-600">Shady Ehab</span>
        </h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-900">Sales Summary</h3>
            <button
              data-tutorial-target="home-date-filter"
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
              aria-label="Filter by date: Today"
              tabIndex={-1}
            >
              Today <ChevronDown size={14} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all"
              aria-label="Download report"
              tabIndex={-1}
            >
              <Download size={16} />
            </button>
            <button
              data-tutorial-target="home-filter-btn"
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-blue-600 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all text-sm"
              aria-label="Filter data"
              tabIndex={-1}
            >
              <Filter size={16} />
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        <div data-tutorial-target="home-orders-stat">
          <StatCard
            title="Number of Orders"
            value="70"
            prefersReducedMotion={prefersReducedMotion}
          />
        </div>
        <div data-tutorial-target="home-net-sales-stat">
          <StatCard
            title="Net Sales"
            prefix="AED"
            value="3,114"
            subValue="14"
            prefersReducedMotion={prefersReducedMotion}
          />
        </div>
        <StatCard
          title="VAT"
          prefix="AED"
          value="163"
          subValue="20"
          prefersReducedMotion={prefersReducedMotion}
        />
        <StatCard
          title="Discounts"
          prefix="AED"
          value="367"
          subValue="79"
          prefersReducedMotion={prefersReducedMotion}
        />
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="mb-6">
          <h3
            data-tutorial-target="home-chart-title"
            className="text-base font-semibold text-gray-900"
          >
            Order Distribution
          </h3>
          <p className="text-sm text-gray-500 mt-1">Orders by channel for today</p>
        </div>
        <div
          ref={chartContainerRef}
          data-tutorial-target="home-chart-bar"
          className="h-[280px] w-full"
          style={{ minWidth: 0 }}
        >
          {isChartReady && (
            <ResponsiveContainer
              width="100%"
              height="100%"
              debounce={100}
              minWidth={0}
              minHeight={0}
            >
              <BarChart
                data={barChartData}
                margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                />
                <Tooltip
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 40px -10px rgb(0 0 0 / 0.15)',
                    fontSize: '13px',
                  }}
                />
                <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Recent Orders</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {recentOrders.map((order) => (
            <div
              key={order.id}
              className={`px-4 py-3 flex items-center justify-between hover:bg-gray-50 ${
                !prefersReducedMotion ? 'transition-colors' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-900">{order.id}</div>
                  <div className="text-xs text-gray-500">{order.customer}</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">{order.channel}</div>
              <div className="text-sm font-medium text-gray-900">AED {order.amount}</div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  order.status === 'Completed'
                    ? 'bg-green-50 text-green-600'
                    : order.status === 'Preparing'
                    ? 'bg-yellow-50 text-yellow-600'
                    : 'bg-blue-50 text-blue-600'
                }`}
              >
                {order.status}
              </span>
              <div className="text-xs text-gray-400">{order.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
