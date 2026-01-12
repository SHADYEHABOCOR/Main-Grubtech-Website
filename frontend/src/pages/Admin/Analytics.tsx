import React, { useState } from 'react';
import { Users, Calendar, TrendingUp, RefreshCw, ChevronDown, Download } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useRealTimeAnalytics } from '../../hooks/useRealTimeAnalytics';
import { LiveAnalyticsCard } from '../../components/analytics/LiveAnalyticsCard';
import { LeadsTrendChart } from '../../components/analytics/LeadsTrendChart.lazy';
import { RecentLeadsWidget } from '../../components/analytics/RecentLeadsWidget';
import { WebsiteMonitoringWidget } from '../../components/analytics/WebsiteMonitoringWidget';

export const Analytics: React.FC = () => {
  const { isDarkMode, showToast } = useAdmin();
  const [refreshInterval, setRefreshInterval] = useState(30000);
  const [isDownloading, setIsDownloading] = useState(false);

  const {
    data: analyticsData,
    loading: analyticsLoading,
    error: analyticsError,
    lastUpdate,
    refresh: refreshAnalytics
  } = useRealTimeAnalytics({
    refreshInterval,
    enabled: true
  });

  const handleRefreshIntervalChange = (interval: number) => {
    setRefreshInterval(interval);
  };

  const intervalOptions = [
    { value: 10000, label: '10s' },
    { value: 30000, label: '30s' },
    { value: 60000, label: '1m' },
    { value: 300000, label: '5m' },
  ];

  const handleDownloadAnalytics = async () => {
    if (!analyticsData) return;

    setIsDownloading(true);

    try {
      // Dynamically import xlsx library only when needed
      const XLSX = await import('xlsx');

      const workbook = XLSX.utils.book_new();
      const reportDate = new Date().toLocaleString();

      // Helper function for change calculation
      function calculateChange(current: number, previous: number): string {
        if (previous === 0) return current > 0 ? '+100%' : '0%';
        const change = ((current - previous) / previous) * 100;
        return (change >= 0 ? '+' : '') + change.toFixed(1) + '%';
      }

      // ===== SHEET 1: Executive Summary =====
      const summaryData = [
        ['GRUBTECH ANALYTICS REPORT'],
        [''],
        ['Report Generated:', reportDate],
        ['Report Period:', 'Last 30 Days'],
        [''],
        [''],
        ['EXECUTIVE SUMMARY'],
        [''],
        ['Metric', 'Current Value', 'Previous Period', 'Change'],
        [
          'Total Leads (All Time)',
          analyticsData.totalLeads,
          analyticsData.previousTotalLeads || 'N/A',
          analyticsData.previousTotalLeads
            ? `+${analyticsData.totalLeads - analyticsData.previousTotalLeads}`
            : 'N/A'
        ],
        [
          'Leads Today',
          analyticsData.leadsToday,
          analyticsData.previousLeadsToday || 0,
          calculateChange(analyticsData.leadsToday, analyticsData.previousLeadsToday || 0)
        ],
        [
          'Leads This Week',
          analyticsData.leadsThisWeek,
          analyticsData.previousLeadsThisWeek || 0,
          calculateChange(analyticsData.leadsThisWeek, analyticsData.previousLeadsThisWeek || 0)
        ],
        [
          'Leads This Month',
          analyticsData.leadsThisMonth,
          analyticsData.previousLeadsThisMonth || 0,
          calculateChange(analyticsData.leadsThisMonth, analyticsData.previousLeadsThisMonth || 0)
        ],
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      summarySheet['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      // ===== SHEET 2: Daily Trends =====
      const trendsData: (string | number)[][] = [
        ['DAILY LEAD TREND (Last 7 Days)'],
        [''],
        ['Date', 'Day', 'Leads Count', 'Percentage of Weekly Total'],
      ];

      if (analyticsData.trendData && analyticsData.trendData.length > 0) {
        const weeklyTotal = analyticsData.trendData.reduce((sum, item) => sum + item.count, 0);
        analyticsData.trendData.forEach((item) => {
          const date = new Date(item.date);
          const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
          const percentage = weeklyTotal > 0 ? ((item.count / weeklyTotal) * 100).toFixed(1) + '%' : '0%';
          trendsData.push([item.date, dayName, item.count, percentage]);
        });
        trendsData.push(['']);
        trendsData.push(['Weekly Total', '', weeklyTotal, '100%']);
        trendsData.push(['Daily Average', '', Number((weeklyTotal / 7).toFixed(1)), '']);
      }
      const trendsSheet = XLSX.utils.aoa_to_sheet(trendsData);
      trendsSheet['!cols'] = [{ wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 22 }];
      XLSX.utils.book_append_sheet(workbook, trendsSheet, 'Daily Trends');

      // ===== SHEET 3: Lead Sources =====
      const sourcesData: (string | number)[][] = [
        ['LEAD SOURCES BREAKDOWN'],
        [''],
        ['Source / Form Type', 'Lead Count', 'Percentage'],
      ];

      if (analyticsData.topSources && analyticsData.topSources.length > 0) {
        const totalFromSources = analyticsData.topSources.reduce((sum, s) => sum + s.count, 0);
        analyticsData.topSources.forEach((source) => {
          const percentage = totalFromSources > 0 ? ((source.count / totalFromSources) * 100).toFixed(1) + '%' : '0%';
          sourcesData.push([source.source || 'Unknown', source.count, percentage]);
        });
        sourcesData.push(['']);
        sourcesData.push(['TOTAL', totalFromSources, '100%']);
      } else {
        sourcesData.push(['No source data available']);
      }
      const sourcesSheet = XLSX.utils.aoa_to_sheet(sourcesData);
      sourcesSheet['!cols'] = [{ wch: 25 }, { wch: 12 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(workbook, sourcesSheet, 'Lead Sources');

      // ===== SHEET 4: Recent Leads =====
      const leadsData: (string | number)[][] = [
        ['RECENT LEADS'],
        [''],
        ['#', 'Name', 'Email', 'Company', 'Form Type', 'Date & Time'],
      ];

      if (analyticsData.recentLeads && analyticsData.recentLeads.length > 0) {
        analyticsData.recentLeads.forEach((lead, index) => {
          leadsData.push([
            index + 1,
            lead.name || 'N/A',
            lead.email || 'N/A',
            lead.company || 'N/A',
            lead.form_type || 'N/A',
            new Date(lead.created_at).toLocaleString()
          ]);
        });
      } else {
        leadsData.push(['No recent leads available']);
      }
      const leadsSheet = XLSX.utils.aoa_to_sheet(leadsData);
      leadsSheet['!cols'] = [{ wch: 5 }, { wch: 20 }, { wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(workbook, leadsSheet, 'Recent Leads');

      // Generate and download the file
      const fileName = `Grubtech-Analytics-Report-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      showToast('Analytics report downloaded successfully', 'success');
    } catch (error) {
      console.error('Failed to download analytics report:', error);
      showToast('Failed to download analytics report. Please try again.', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-semibold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Analytics
          </h1>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Real-time lead tracking and performance metrics
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Refresh Interval */}
          <div className="relative">
            <select
              value={refreshInterval}
              onChange={(e) => handleRefreshIntervalChange(Number(e.target.value))}
              className={`appearance-none pl-3 pr-8 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                isDarkMode
                  ? 'bg-gray-800 text-white border-gray-700'
                  : 'bg-gray-50 text-gray-700 border-gray-200'
              } border`}
            >
              {intervalOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  Every {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownloadAnalytics}
            disabled={!analyticsData || isDownloading}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              !analyticsData || isDownloading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:opacity-90'
            } ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            <Download className={`w-4 h-4 ${isDownloading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isDownloading ? 'Downloading...' : 'Download'}</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={refreshAnalytics}
            disabled={analyticsLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              analyticsLoading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:opacity-90'
            } bg-primary text-white`}
          >
            <RefreshCw className={`w-4 h-4 ${analyticsLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Last Update Indicator */}
      {lastUpdate && (
        <div className={`flex items-center gap-2 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Last updated {new Date(lastUpdate).toLocaleTimeString()}
        </div>
      )}

      {/* Analytics Content */}
      {analyticsData ? (
        <>
          {/* Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <LiveAnalyticsCard
              title="Total Leads"
              value={analyticsData.totalLeads}
              previousValue={analyticsData.previousTotalLeads}
              icon={Users}
              color="bg-blue-500"
              subtitle="All time"
              isLive={true}
            />
            <LiveAnalyticsCard
              title="Today"
              value={analyticsData.leadsToday}
              previousValue={analyticsData.previousLeadsToday}
              icon={Calendar}
              color="bg-green-500"
              subtitle="Last 24 hours"
              isLive={true}
            />
            <LiveAnalyticsCard
              title="This Week"
              value={analyticsData.leadsThisWeek}
              previousValue={analyticsData.previousLeadsThisWeek}
              icon={TrendingUp}
              color="bg-purple-500"
              subtitle="Last 7 days"
            />
            <LiveAnalyticsCard
              title="This Month"
              value={analyticsData.leadsThisMonth}
              previousValue={analyticsData.previousLeadsThisMonth}
              icon={TrendingUp}
              color="bg-orange-500"
              subtitle="Last 30 days"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <LeadsTrendChart data={analyticsData.trendData} />
            <RecentLeadsWidget leads={analyticsData.recentLeads} />
          </div>
        </>
      ) : analyticsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`h-36 rounded-2xl animate-pulse ${
                isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
              }`}
            />
          ))}
        </div>
      ) : null}

      {/* Error State */}
      {analyticsError && (
        <div className={`p-4 rounded-xl ${
          isDarkMode ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-100'
        }`}>
          <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
            Failed to load analytics data. Please try again.
          </p>
        </div>
      )}

      {/* Website Monitoring */}
      <WebsiteMonitoringWidget />
    </div>
  );
};
