import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

interface WebsiteAnalyticsSummary {
  totalPageViews: number;
  uniqueVisitors: number;
  totalEvents: number;
  avgSessionDuration: number;
  bounceRate: number;
}

interface TopPage {
  page_url: string;
  page_title: string;
  views: number;
}

interface PageViewTrend {
  date: string;
  views: number;
  unique_visitors: number;
}

interface TopEvent {
  event_name: string;
  event_category: string;
  count: number;
}

interface TrafficSource {
  source: string;
  count: number;
}

interface DeviceBreakdown {
  device_type: string;
  count: number;
}

interface BrowserBreakdown {
  browser: string;
  count: number;
}

interface WebsiteAnalyticsData {
  summary: WebsiteAnalyticsSummary;
  topPages: TopPage[];
  pageViewsTrend: PageViewTrend[];
  topEvents: TopEvent[];
  trafficSources: TrafficSource[];
  deviceBreakdown: DeviceBreakdown[];
  browserBreakdown: BrowserBreakdown[];
}

interface UseWebsiteAnalyticsOptions {
  timeRange?: string;
  refreshInterval?: number;
  enabled?: boolean;
}

export function useWebsiteAnalytics(options: UseWebsiteAnalyticsOptions = {}) {
  const {
    timeRange = '7d',
    refreshInterval,
    enabled = true
  } = options;

  const [data, setData] = useState<WebsiteAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const API_URL = `${API_BASE_URL}/api`;

  const fetchAnalytics = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);

      const response = await axios.get<WebsiteAnalyticsData>(
        `${API_URL}/analytics/dashboard?timeRange=${timeRange}`,
        { withCredentials: true } // Uses httpOnly cookie for auth
      );

      setData(response.data);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching website analytics:', err);
      setError('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  }, [timeRange, enabled, API_URL]);

  // Initial fetch
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Auto-refresh if interval is set
  useEffect(() => {
    if (!refreshInterval || !enabled) return;

    const interval = setInterval(fetchAnalytics, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, enabled, fetchAnalytics]);

  return {
    data,
    loading,
    error,
    lastUpdate,
    refresh: fetchAnalytics
  };
}
