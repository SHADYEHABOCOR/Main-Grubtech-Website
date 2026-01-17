import React, { useState, useEffect, useCallback } from 'react';
import { Search, Download, Mail, Phone, Building2, Calendar, Filter, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDebounce } from '../../hooks/useDebounce';
import { useMultipleDateFormatters } from '../../hooks/useDateFormatter';
import { DataState } from '../../components/ui/DataState';
import { API_BASE_URL } from '../../config/api';

interface Lead {
  id: number;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  restaurant_type: string | null;
  message: string | null;
  form_type: string;
  source_page: string | null;
  created_at: string;
}

interface LeadStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  byType: Array<{ form_type: string; count: number }>;
  bySource: Array<{ source_page: string; count: number }>;
}

export const LeadsList: React.FC = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [filterType, setFilterType] = useState<string>('all');
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const API_URL = `${API_BASE_URL}/api`;

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/leads`, { withCredentials: true });
      setLeads(response.data.leads || []);
      setIsError(false);
      setError(null);
    } catch (err) {
      setIsError(true);
      setError(err instanceof Error ? err : new Error('Failed to load leads'));
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/leads/stats`, { withCredentials: true });
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchLeads();
    fetchStats();
  }, [fetchLeads, fetchStats]);

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Company', 'Phone', 'Restaurant Type', 'Message', 'Form Type', 'Source', 'Date'];
    const rows = filteredLeads.map(lead => [
      lead.id,
      lead.name,
      lead.email,
      lead.company || '',
      lead.phone || '',
      lead.restaurant_type || '',
      lead.message || '',
      lead.form_type,
      lead.source_page || '',
      dateTimes.get(lead) || ''
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch =
      lead.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      lead.company?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

    const matchesFilter = filterType === 'all' || lead.form_type === filterType;

    return matchesSearch && matchesFilter;
  });

  // Memoize date and time formatting for all filtered leads
  const { dates, times, dateTimes } = useMultipleDateFormatters(
    filteredLeads,
    lead => lead.created_at,
    {
      dates: { formatType: 'date' },
      times: { formatType: 'time' },
      dateTimes: { formatType: 'datetime' }
    }
  );

  const getFormTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      demo: 'bg-blue-100 text-blue-800',
      contact: 'bg-green-100 text-green-800',
      trial: 'bg-purple-100 text-purple-800',
      newsletter: 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4 md:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-semibold text-gray-900">Leads</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">Manage your website leads</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all text-xs md:text-sm font-medium whitespace-nowrap shadow-sm hover:shadow-md"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export CSV</span>
          <span className="sm:hidden">Export</span>
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3">
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-gray-200/50 hover:shadow-sm transition-shadow">
            <div className="text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-wide">Total</div>
            <div className="text-xl md:text-2xl font-semibold text-gray-900 mt-1">{stats.total}</div>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-blue-200/50 hover:shadow-sm transition-shadow">
            <div className="text-[10px] md:text-xs text-blue-600 font-medium uppercase tracking-wide">Today</div>
            <div className="text-xl md:text-2xl font-semibold text-blue-600 mt-1">{stats.today}</div>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-green-200/50 hover:shadow-sm transition-shadow">
            <div className="text-[10px] md:text-xs text-green-600 font-medium uppercase tracking-wide">Week</div>
            <div className="text-xl md:text-2xl font-semibold text-green-600 mt-1">{stats.thisWeek}</div>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-purple-200/50 hover:shadow-sm transition-shadow">
            <div className="text-[10px] md:text-xs text-purple-600 font-medium uppercase tracking-wide">Month</div>
            <div className="text-xl md:text-2xl font-semibold text-purple-600 mt-1">{stats.thisMonth}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50">
        <div className="flex flex-col md:flex-row gap-2.5">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs md:text-sm bg-white/80"
            />
          </div>

          {/* Filter by type */}
          <div className="relative">
            <Filter className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full md:w-auto pl-8 pr-7 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none bg-white/80 text-xs md:text-sm"
            >
              <option value="all">All Types</option>
              <option value="demo">Demo</option>
              <option value="contact">Contact</option>
              <option value="trial">Trial</option>
              <option value="newsletter">Newsletter</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <DataState
        isLoading={loading}
        isError={isError}
        error={error}
        isEmpty={filteredLeads.length === 0}
        onRetry={fetchLeads}
        variant="default"
        messages={{
          loading: 'Loading leads...',
          error: 'Failed to load leads. Please try again.',
          empty: 'No leads found. Try adjusting your filters.',
        }}
      >
        <div className="bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200/50 overflow-hidden shadow-sm">
          <div className="overflow-x-auto -mx-3 md:mx-0">
            <table className="w-full min-w-[480px]">
              <thead className="bg-gray-50/50 backdrop-blur-sm border-b border-gray-200/50">
                <tr>
                  <th className="px-2 md:px-6 py-2 md:py-3 text-left text-[9px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lead
                  </th>
                  <th className="px-2 md:px-6 py-2 md:py-3 text-left text-[9px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-2 md:px-6 py-2 md:py-3 text-left text-[9px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-2 md:px-6 py-2 md:py-3 text-left text-[9px] md:text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Source
                  </th>
                  <th className="px-2 md:px-6 py-2 md:py-3 text-left text-[9px] md:text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Date
                  </th>
                  <th className="px-2 md:px-6 py-2 md:py-3 text-left text-[9px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-2 md:px-6 py-2 md:py-4">
                      <div className="flex items-center gap-1.5 md:gap-3">
                        <div className="w-7 h-7 md:w-10 md:h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-primary font-semibold text-[10px] md:text-sm">
                            {lead.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 text-[11px] md:text-sm truncate">{lead.name}</div>
                          {lead.company && (
                            <div className="text-[9px] md:text-xs text-gray-500 flex items-center gap-0.5 truncate">
                              <Building2 className="w-2.5 h-2.5 md:w-3 md:h-3 flex-shrink-0" />
                              <span className="truncate">{lead.company}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-2 md:px-6 py-2 md:py-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-0.5 md:gap-2 text-[11px] md:text-sm text-gray-900">
                          <Mail className="w-2.5 h-2.5 md:w-4 md:h-4 text-gray-400 flex-shrink-0" />
                          <a href={`mailto:${lead.email}`} className="hover:text-primary truncate block">
                            {lead.email}
                          </a>
                        </div>
                        {lead.phone && (
                          <div className="flex items-center gap-0.5 md:gap-2 text-[11px] md:text-sm text-gray-600">
                            <Phone className="w-2.5 h-2.5 md:w-4 md:h-4 text-gray-400 flex-shrink-0" />
                            <a href={`tel:${lead.phone}`} className="hover:text-primary truncate block">
                              {lead.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-2 md:px-6 py-2 md:py-4">
                      <span className={`inline-flex items-center px-1.5 md:px-2 py-0.5 rounded-full text-[9px] md:text-xs font-medium ${getFormTypeBadge(lead.form_type)}`}>
                        {lead.form_type}
                      </span>
                      {lead.restaurant_type && (
                        <div className="text-[9px] md:text-xs text-gray-500 mt-0.5 truncate">{lead.restaurant_type}</div>
                      )}
                    </td>
                    <td className="px-2 md:px-6 py-2 md:py-4 hidden sm:table-cell">
                      <div className="text-[11px] md:text-sm text-gray-900 truncate">{lead.source_page || 'Direct'}</div>
                    </td>
                    <td className="px-2 md:px-6 py-2 md:py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-1 md:gap-2 text-[11px] md:text-sm text-gray-600">
                        <Calendar className="w-2.5 h-2.5 md:w-4 md:h-4 text-gray-400" />
                        {dates.get(lead)}
                      </div>
                      <div className="text-[9px] md:text-xs text-gray-500 mt-0.5">
                        {times.get(lead)}
                      </div>
                    </td>
                    <td className="px-2 md:px-6 py-2 md:py-4">
                      <button
                        onClick={() => navigate(`/admin/leads/${lead.id}`)}
                        className="flex items-center justify-center gap-0.5 md:gap-1 text-[11px] md:text-sm text-primary hover:text-primary-dark font-medium transition-colors whitespace-nowrap"
                      >
                        <Eye className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="hidden lg:inline">Details</span>
                        <span className="lg:hidden">View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DataState>
    </div>
  );
};
