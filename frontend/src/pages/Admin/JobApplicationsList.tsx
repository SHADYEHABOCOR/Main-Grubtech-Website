import React, { useState, useEffect, useCallback } from 'react';
import { Search, Download, Mail, Phone, Calendar, Filter, FileText, Linkedin, MapPin, Briefcase, Trash2, ChevronDown } from 'lucide-react';
import { apiClient, API_ENDPOINTS, getFileUrl } from '../../config/api';
import { useDebounce } from '../../hooks/useDebounce';
import { useMultipleDateFormatters } from '../../hooks/useDateFormatter';
import { DataState } from '../../components/ui/DataState';

interface JobApplication {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  linkedin: string | null;
  expertise: string | null;
  cv_path: string | null;
  message: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export const JobApplicationsList: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(API_ENDPOINTS.CAREERS.APPLICATIONS);
      setApplications(response.data?.data || []);
      setIsError(false);
      setError(null);
    } catch (err) {
      setIsError(true);
      setError(err instanceof Error ? err : new Error('Failed to load job applications'));
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const updateStatus = async (id: number, status: string) => {
    try {
      await apiClient.put(`${API_ENDPOINTS.CAREERS.APPLICATIONS}/${id}`, { status });
      setApplications(apps => apps.map(app =>
        app.id === id ? { ...app, status } : app
      ));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const deleteApplication = async (id: number) => {
    if (!confirm('Are you sure you want to delete this application?')) return;

    try {
      await apiClient.delete(`${API_ENDPOINTS.CAREERS.APPLICATIONS}/${id}`);
      setApplications(apps => apps.filter(app => app.id !== id));
    } catch (error) {
      console.error('Error deleting application:', error);
    }
  };

  const filteredApplications = applications.filter(app => {
    const fullName = `${app.first_name} ${app.last_name}`.toLowerCase();
    const matchesSearch =
      fullName.includes(debouncedSearchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      app.expertise?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'all' || app.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  // Memoize date and time formatting for better performance
  const { dates, times, dateTimes } = useMultipleDateFormatters(
    filteredApplications,
    app => app.created_at,
    {
      dates: { formatType: 'date' },
      times: { formatType: 'time' },
      dateTimes: { formatType: 'datetime' }
    }
  );

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'City', 'Country', 'LinkedIn', 'Expertise', 'Message', 'Status', 'Date'];
    const rows = filteredApplications.map(app => [
      app.id,
      `${app.first_name} ${app.last_name}`,
      app.email,
      app.phone || '',
      app.city || '',
      app.country || '',
      app.linkedin || '',
      app.expertise || '',
      app.message || '',
      app.status,
      dateTimes.get(app) || ''
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `job-applications-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800',
      reviewed: 'bg-yellow-100 text-yellow-800',
      contacted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      hired: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const stats = {
    total: applications.length,
    new: applications.filter(a => a.status === 'new').length,
    reviewed: applications.filter(a => a.status === 'reviewed').length,
    contacted: applications.filter(a => a.status === 'contacted').length
  };

  return (
    <div className="space-y-4 md:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-semibold text-gray-900">Job Applications</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">Manage career applications</p>
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3">
        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-gray-200/50 hover:shadow-sm transition-shadow">
          <div className="text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-wide">Total</div>
          <div className="text-xl md:text-2xl font-semibold text-gray-900 mt-1">{stats.total}</div>
        </div>
        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-blue-200/50 hover:shadow-sm transition-shadow">
          <div className="text-[10px] md:text-xs text-blue-600 font-medium uppercase tracking-wide">New</div>
          <div className="text-xl md:text-2xl font-semibold text-blue-600 mt-1">{stats.new}</div>
        </div>
        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-yellow-200/50 hover:shadow-sm transition-shadow">
          <div className="text-[10px] md:text-xs text-yellow-600 font-medium uppercase tracking-wide">Reviewed</div>
          <div className="text-xl md:text-2xl font-semibold text-yellow-600 mt-1">{stats.reviewed}</div>
        </div>
        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-green-200/50 hover:shadow-sm transition-shadow">
          <div className="text-[10px] md:text-xs text-green-600 font-medium uppercase tracking-wide">Contacted</div>
          <div className="text-xl md:text-2xl font-semibold text-green-600 mt-1">{stats.contacted}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50">
        <div className="flex flex-col md:flex-row gap-2.5">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs md:text-sm bg-white/80"
            />
          </div>

          {/* Filter by status */}
          <div className="relative">
            <Filter className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full md:w-auto pl-8 pr-7 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none bg-white/80 text-xs md:text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="reviewed">Reviewed</option>
              <option value="contacted">Contacted</option>
              <option value="rejected">Rejected</option>
              <option value="hired">Hired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <DataState
        isLoading={loading}
        isError={isError}
        error={error}
        isEmpty={filteredApplications.length === 0}
        onRetry={fetchApplications}
        variant="default"
        messages={{
          loading: 'Loading job applications...',
          error: 'Failed to load job applications. Please try again.',
          empty: 'No job applications found. Try adjusting your filters.',
        }}
      >
        <div className="bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200/50 overflow-hidden shadow-sm">
          <div className="overflow-x-auto -mx-3 md:mx-0">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50/50 backdrop-blur-sm border-b border-gray-200/50">
                <tr>
                  <th className="px-2 md:px-6 py-2 md:py-3 text-left text-[9px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-2 md:px-6 py-2 md:py-3 text-left text-[9px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-2 md:px-6 py-2 md:py-3 text-left text-[9px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expertise
                  </th>
                  <th className="px-2 md:px-6 py-2 md:py-3 text-left text-[9px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-2 md:px-6 py-2 md:py-3 text-left text-[9px] md:text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Date
                  </th>
                  <th className="px-2 md:px-6 py-2 md:py-3 text-left text-[9px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-2 md:px-6 py-2 md:py-4">
                      <div className="flex items-center gap-1.5 md:gap-3">
                        <div className="w-7 h-7 md:w-10 md:h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-primary font-semibold text-[10px] md:text-sm">
                            {app.first_name.charAt(0).toUpperCase()}{app.last_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 text-[11px] md:text-sm truncate">
                            {app.first_name} {app.last_name}
                          </div>
                          {(app.city || app.country) && (
                            <div className="text-[9px] md:text-xs text-gray-500 flex items-center gap-0.5 truncate">
                              <MapPin className="w-2.5 h-2.5 md:w-3 md:h-3 flex-shrink-0" />
                              <span className="truncate">{[app.city, app.country].filter(Boolean).join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-2 md:px-6 py-2 md:py-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-0.5 md:gap-2 text-[11px] md:text-sm text-gray-900">
                          <Mail className="w-2.5 h-2.5 md:w-4 md:h-4 text-gray-400 flex-shrink-0" />
                          <a href={`mailto:${app.email}`} className="hover:text-primary truncate block">
                            {app.email}
                          </a>
                        </div>
                        {app.phone && (
                          <div className="flex items-center gap-0.5 md:gap-2 text-[11px] md:text-sm text-gray-600">
                            <Phone className="w-2.5 h-2.5 md:w-4 md:h-4 text-gray-400 flex-shrink-0" />
                            <a href={`tel:${app.phone}`} className="hover:text-primary truncate block">
                              {app.phone}
                            </a>
                          </div>
                        )}
                        {app.linkedin && (
                          <div className="flex items-center gap-0.5 md:gap-2 text-[11px] md:text-sm text-gray-600">
                            <Linkedin className="w-2.5 h-2.5 md:w-4 md:h-4 text-gray-400 flex-shrink-0" />
                            <a href={app.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-primary truncate block">
                              Profile
                            </a>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-2 md:px-6 py-2 md:py-4">
                      <div className="flex items-center gap-1 text-[11px] md:text-sm text-gray-900">
                        <Briefcase className="w-3 h-3 md:w-4 md:h-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{app.expertise || 'Not specified'}</span>
                      </div>
                      {app.cv_path && (
                        <a
                          href={getFileUrl(app.cv_path)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[10px] md:text-xs text-primary hover:text-primary-dark mt-1"
                        >
                          <FileText className="w-3 h-3" />
                          Download CV
                        </a>
                      )}
                    </td>
                    <td className="px-2 md:px-6 py-2 md:py-4">
                      <div className="relative inline-flex items-center">
                        <select
                          value={app.status}
                          onChange={(e) => updateStatus(app.id, e.target.value)}
                          className={`appearance-none pl-2.5 md:pl-3 pr-5 md:pr-6 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-medium border-0 cursor-pointer outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary/30 transition-all ${getStatusBadge(app.status)}`}
                        >
                          <option value="new">New</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="contacted">Contacted</option>
                          <option value="rejected">Rejected</option>
                          <option value="hired">Hired</option>
                        </select>
                        <ChevronDown className="absolute right-1.5 md:right-2 w-3 h-3 pointer-events-none opacity-60" />
                      </div>
                    </td>
                    <td className="px-2 md:px-6 py-2 md:py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-1 md:gap-2 text-[11px] md:text-sm text-gray-600">
                        <Calendar className="w-2.5 h-2.5 md:w-4 md:h-4 text-gray-400" />
                        {dates.get(app)}
                      </div>
                      <div className="text-[9px] md:text-xs text-gray-500 mt-0.5">
                        {times.get(app)}
                      </div>
                    </td>
                    <td className="px-2 md:px-6 py-2 md:py-4">
                      <button
                        onClick={() => deleteApplication(app.id)}
                        className="flex items-center justify-center gap-0.5 md:gap-1 text-[11px] md:text-sm text-red-600 hover:text-red-800 font-medium transition-colors whitespace-nowrap"
                      >
                        <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="hidden lg:inline">Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
          </table>
        </div>
      </div>
      </DataState>

      {/* Application Details Modal could be added here */}
    </div>
  );
};
