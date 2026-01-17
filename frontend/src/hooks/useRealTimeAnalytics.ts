import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

interface Lead {
  id: number;
  name: string;
  email: string;
  company: string | null;
  form_type: string;
  created_at: string;
}

interface AnalyticsData {
  totalLeads: number;
  leadsToday: number;
  leadsThisWeek: number;
  leadsThisMonth: number;
  previousTotalLeads?: number;
  previousLeadsToday?: number;
  previousLeadsThisWeek?: number;
  previousLeadsThisMonth?: number;
  trendData: Array<{ date: string; count: number }>;
  recentLeads: Lead[];
  topSources: Array<{ source: string; count: number }>;
}

interface UseRealTimeAnalyticsOptions {
  refreshInterval?: number; // in milliseconds
  enabled?: boolean;
}

export const useRealTimeAnalytics = (options: UseRealTimeAnalyticsOptions = {}) => {
  const {
    refreshInterval = 30000, // 30 seconds default
    enabled = true,
  } = options;

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const API_URL = `${API_BASE_URL}/api`;

  const fetchAnalytics = useCallback(async () => {
    if (!enabled) return;

    try {
      // Fetch leads and stats (uses httpOnly cookie for auth)
      const [leadsResponse, leadsStatsResponse] = await Promise.all([
        axios.get(`${API_URL}/leads`, { withCredentials: true }),
        axios.get(`${API_URL}/leads/stats`, { withCredentials: true }),
      ]);

      const leads = leadsResponse.data.leads || [];
      const stats = leadsStatsResponse.data.stats;

      // Calculate trend data (last 7 days)
      const trendData = calculateTrend(leads);

      // Get recent leads (last 5)
      const recentLeads = leads.slice(0, 5);

      // Calculate previous period values for trend comparison
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const lastWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const lastWeekEnd = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const lastMonthStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      const lastMonthEnd = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const previousLeadsToday = leads.filter((lead: Lead) => {
        const leadDate = new Date(lead.created_at);
        return leadDate >= new Date(yesterday.setHours(0, 0, 0, 0)) &&
               leadDate < new Date(yesterday.setHours(23, 59, 59, 999));
      }).length;

      const previousLeadsThisWeek = leads.filter((lead: Lead) => {
        const leadDate = new Date(lead.created_at);
        return leadDate >= lastWeekStart && leadDate < lastWeekEnd;
      }).length;

      const previousLeadsThisMonth = leads.filter((lead: Lead) => {
        const leadDate = new Date(lead.created_at);
        return leadDate >= lastMonthStart && leadDate < lastMonthEnd;
      }).length;

      if (isMountedRef.current) {
        setData({
          totalLeads: stats.total,
          leadsToday: stats.today,
          leadsThisWeek: stats.thisWeek,
          leadsThisMonth: stats.thisMonth,
          previousTotalLeads: stats.total - stats.today, // Simple approximation
          previousLeadsToday,
          previousLeadsThisWeek,
          previousLeadsThisMonth,
          trendData,
          recentLeads,
          topSources: stats.bySource || [],
        });
        setLastUpdate(new Date());
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      if (isMountedRef.current) {
        setError('Failed to fetch analytics data');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [API_URL, enabled]);

  const calculateTrend = (leads: Lead[]) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const count = leads.filter(lead => {
        const leadDate = new Date(lead.created_at).toISOString().split('T')[0];
        return leadDate === date;
      }).length;

      return { date, count };
    });
  };

  const refresh = useCallback(() => {
    setLoading(true);
    fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    isMountedRef.current = true;

    // Initial fetch
    fetchAnalytics();

    // Set up polling
    if (enabled && refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchAnalytics();
      }, refreshInterval);
    }

    // Cleanup
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchAnalytics, enabled, refreshInterval]);

  return {
    data,
    loading,
    error,
    lastUpdate,
    refresh,
  };
};
