import React, { useRef } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Download, Filter, ChevronDown, ArrowUp } from 'lucide-react';
import { useChartReady } from '../../../../hooks/useChartReady';
import { lineChartData, tableData } from '../data';

interface SalesReportsContentProps {
  /** Whether to reduce motion for accessibility */
  prefersReducedMotion?: boolean;
}

/**
 * SalesReportsContent component displays the sales reports view.
 * Includes tabs for different report views, line chart comparing current vs
 * previous period sales, and a detailed sales summary table.
 *
 * @example
 * <SalesReportsContent />
 * <SalesReportsContent prefersReducedMotion={true} />
 */
export const SalesReportsContent: React.FC<SalesReportsContentProps> = ({
  prefersReducedMotion = false,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const isChartReady = useChartReady(chartContainerRef);

  return (
    <div className="p-6 bg-[#f8fafc] min-h-full">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Sales</h2>
            <button
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
              aria-label="Filter by date: Last 7 Days"
              tabIndex={-1}
            >
              Last 7 Days <ChevronDown size={14} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
              aria-label="Download report"
              tabIndex={-1}
            >
              <Download size={16} />
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-blue-600 font-medium hover:bg-gray-50 text-sm transition-colors"
              aria-label="Filter data"
              tabIndex={-1}
            >
              <Filter size={16} />
              Filter
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div
          data-tutorial-target="sales-tabs"
          className="flex items-center gap-6 border-b border-gray-200"
          role="tablist"
        >
          {['Overview', 'Brands', 'Locations', 'Channels', 'Orders'].map((tab, i) => (
            <button
              key={tab}
              className={`pb-2.5 text-sm font-medium ${
                !prefersReducedMotion ? 'transition-colors' : ''
              } ${
                i === 0
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              role="tab"
              aria-selected={i === 0}
              tabIndex={-1}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">Gross Sales</h3>
            <div className="flex gap-10">
              <div>
                <div className="text-lg font-bold text-gray-900">AED 59,194.95</div>
                <div className="flex items-center gap-1 text-xs text-green-500 mt-0.5">
                  <ArrowUp size={10} />
                  <span className="font-medium">18.94%</span>
                  <span className="text-gray-400 font-normal">Current Period</span>
                </div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">AED 49,768.65</div>
                <div className="text-xs text-gray-400 mt-0.5">Previous Period</div>
              </div>
            </div>
          </div>
          <button
            data-tutorial-target="sales-metric-dropdown"
            className="flex items-center justify-between w-36 px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs text-gray-700"
            aria-label="Select metric: Gross Sales"
            tabIndex={-1}
          >
            Gross Sales
            <ChevronDown size={12} />
          </button>
        </div>

        {/* Legend */}
        <div className="flex justify-end gap-5 mb-3 text-[10px]">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-blue-600 rounded-sm"></div>
            <span className="text-gray-600">Current Period (04 Dec - 11 Dec)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-gray-400 rounded-sm"></div>
            <span className="text-gray-600">Previous Period (26 Nov - 03 Dec)</span>
          </div>
        </div>

        <div
          ref={chartContainerRef}
          data-tutorial-target="sales-chart"
          className="h-[160px] w-full"
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
              <LineChart
                data={lineChartData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  tickFormatter={(value) => (value >= 1000 ? `${value / 1000}k` : value)}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '11px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="current"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="previous"
                  stroke="#9ca3af"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div
        data-tutorial-target="sales-table"
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="p-3 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-medium text-gray-900 text-sm">Sales Summary</h3>
          <button
            data-tutorial-target="sales-download-btn"
            className="flex items-center gap-1.5 px-2.5 py-1 border border-blue-600 text-blue-600 rounded text-xs font-medium hover:bg-blue-50 transition-colors"
            aria-label="Download sales report"
            tabIndex={-1}
          >
            <Download size={12} />
            Download
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[10px] text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
              <tr>
                {['Date', 'Orders', 'Gross Sales', 'Discounts', 'Net Sales', 'Avg'].map(
                  (head) => (
                    <th key={head} className="px-3 py-2.5 font-semibold">
                      {head}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr
                  key={index}
                  className={`border-b border-gray-50 ${
                    row.isTotal
                      ? 'bg-gray-50/50 font-bold text-gray-900'
                      : 'text-gray-600'
                  }`}
                >
                  <td className="px-3 py-2">{row.date}</td>
                  <td className="px-3 py-2">{row.orders}</td>
                  <td className="px-3 py-2">{row.gross}</td>
                  <td className="px-3 py-2">{row.disc}</td>
                  <td className="px-3 py-2">{row.net}</td>
                  <td className="px-3 py-2">{row.avg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
