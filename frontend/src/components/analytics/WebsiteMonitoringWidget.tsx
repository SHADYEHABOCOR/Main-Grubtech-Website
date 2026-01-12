import React, { useState } from 'react';
import { Globe, Users, MousePointer, Monitor, Smartphone, Activity, ChevronDown } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useWebsiteAnalytics } from '../../hooks/useWebsiteAnalytics';

export const WebsiteMonitoringWidget: React.FC = () => {
  const { isDarkMode } = useAdmin();
  const [timeRange, setTimeRange] = useState('7d');
  const { data, loading } = useWebsiteAnalytics({ timeRange });

  if (loading) {
    return (
      <div className={`p-6 rounded-2xl ${
        isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-100'
      }`}>
        <div className="animate-pulse space-y-6">
          <div className="flex justify-between">
            <div className="space-y-2">
              <div className={`h-5 w-40 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
              <div className={`h-4 w-56 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
            </div>
            <div className={`h-9 w-32 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`h-24 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    {
      label: 'Page Views',
      value: data.summary.totalPageViews.toLocaleString(),
      icon: Globe,
      color: 'blue'
    },
    {
      label: 'Visitors',
      value: data.summary.uniqueVisitors.toLocaleString(),
      icon: Users,
      color: 'emerald'
    },
    {
      label: 'Events',
      value: data.summary.totalEvents.toLocaleString(),
      icon: MousePointer,
      color: 'violet'
    },
    {
      label: 'Avg. Session',
      value: `${data.summary.avgSessionDuration.toFixed(1)}m`,
      icon: Activity,
      color: 'amber'
    }
  ];

  const totalDevices = data.deviceBreakdown.reduce((sum, d) => sum + d.count, 0);
  const mobileCount = data.deviceBreakdown.find(d => d.device_type === 'Mobile')?.count || 0;
  const desktopCount = data.deviceBreakdown.find(d => d.device_type === 'Desktop')?.count || 0;
  const mobilePercent = totalDevices > 0 ? Math.round((mobileCount / totalDevices) * 100) : 0;
  const desktopPercent = totalDevices > 0 ? Math.round((desktopCount / totalDevices) * 100) : 0;

  return (
    <div
      className={`animate-fade-in-up-fast p-6 rounded-2xl ${
        isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-100'
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Website Monitoring
          </h3>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Visitor behavior and performance metrics
          </p>
        </div>

        <div className="relative">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className={`appearance-none pl-3 pr-8 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              isDarkMode
                ? 'bg-gray-800 text-white border-gray-700 hover:bg-gray-750'
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
            } border`}
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <ChevronDown className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`} />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}
            >
              <div className={`p-2 rounded-lg inline-flex mb-3 ${
                stat.color === 'blue' ? (isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50') :
                stat.color === 'emerald' ? (isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50') :
                stat.color === 'violet' ? (isDarkMode ? 'bg-violet-500/10' : 'bg-violet-50') :
                (isDarkMode ? 'bg-amber-500/10' : 'bg-amber-50')
              }`}>
                <Icon className={`w-4 h-4 ${
                  stat.color === 'blue' ? 'text-blue-500' :
                  stat.color === 'emerald' ? 'text-emerald-500' :
                  stat.color === 'violet' ? 'text-violet-500' :
                  'text-amber-500'
                }`} />
              </div>
              <p className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stat.value}
              </p>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Insights Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {/* Top Page */}
        <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <p className={`text-xs font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Top Page
          </p>
          <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {data.topPages[0]?.page_url || 'N/A'}
          </p>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {data.topPages[0]?.views || 0} views
          </p>
        </div>

        {/* Device Split */}
        <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <p className={`text-xs font-medium mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Device Split
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
                <Monitor className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {desktopPercent}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
                <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {mobilePercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Bounce Rate */}
        <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <p className={`text-xs font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Bounce Rate
          </p>
          <p className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {data.summary.bounceRate.toFixed(1)}%
          </p>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Single-page sessions
          </p>
        </div>
      </div>

      {/* Traffic Sources */}
      {data.trafficSources.length > 0 && (
        <div>
          <p className={`text-sm font-medium mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Traffic Sources
          </p>
          <div className="space-y-3">
            {data.trafficSources.slice(0, 5).map((source, index) => {
              const totalTraffic = data.trafficSources.reduce((sum, s) => sum + s.count, 0);
              const percentage = Math.round((source.count / totalTraffic) * 100);

              return (
                <div key={source.source} className="flex items-center gap-3">
                  <span className={`text-sm w-24 truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {source.source}
                  </span>
                  <div className="flex-1">
                    <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                      <div
                        className={`h-full rounded-full transition-all duration-500 ease-out ${
                          index === 0 ? 'bg-indigo-500' :
                          index === 1 ? 'bg-blue-500' :
                          index === 2 ? 'bg-emerald-500' :
                          index === 3 ? 'bg-amber-500' :
                          'bg-gray-400'
                        }`}
                        style={{
                          width: `${percentage}%`,
                          transitionDelay: `${index * 100}ms`
                        }}
                      />
                    </div>
                  </div>
                  <span className={`text-sm font-medium w-12 text-right ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {percentage}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
