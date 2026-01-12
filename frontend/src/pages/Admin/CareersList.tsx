import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, Briefcase } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { careersApi } from '../../services/adminApi';
import { useDebounce } from '../../hooks/useDebounce';
import { DataState } from '../../components/ui/DataState';

interface JobVacancy {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string | null;
  requirements: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export const CareersList: React.FC = () => {
  const { isDarkMode, showToast } = useAdmin();
  const [vacancies, setVacancies] = useState<JobVacancy[]>([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadVacancies = useCallback(async () => {
    try {
      setLoading(true);
      const response = await careersApi.getAll();
      setVacancies(response.data || []);
      setIsError(false);
      setError(null);
    } catch (err) {
      setIsError(true);
      setError(err instanceof Error ? err : new Error('Failed to load job vacancies'));
      showToast('Failed to load job vacancies', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadVacancies();
  }, [loadVacancies]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job vacancy?')) return;

    try {
      await careersApi.delete(id);
      showToast('Job vacancy deleted successfully', 'success');
      loadVacancies();
    } catch {
      showToast('Failed to delete job vacancy', 'error');
    }
  };

  const filteredVacancies = vacancies.filter((vacancy) => {
    const matchesSearch = vacancy.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      vacancy.department.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesStatus = filterStatus === 'all' || vacancy.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4 md:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className={`text-lg md:text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Job Vacancies
          </h1>
          <p className={`text-xs md:text-sm text-gray-500 mt-0.5`}>
            Manage career opportunities
          </p>
        </div>
        <Link
          to="/admin/careers/new"
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all text-xs md:text-sm font-medium whitespace-nowrap shadow-sm hover:shadow-md"
        >
          <Plus className="w-3.5 h-3.5" />
          New Job Vacancy
        </Link>
      </div>

      {/* Filters */}
      <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white/50 backdrop-blur-sm'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200/50'} shadow-sm`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search vacancies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-8 pr-3 py-1.5 rounded-lg text-xs md:text-sm bg-white/80 ${
                isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'text-gray-900 border-gray-200'
              } border focus:outline-none focus:ring-2 focus:ring-primary/20`}
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`px-3 py-1.5 rounded-lg text-xs md:text-sm bg-white/80 ${
              isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'text-gray-900 border-gray-200'
            } border focus:outline-none focus:ring-2 focus:ring-primary/20`}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Vacancies List */}
      <DataState
        isLoading={loading}
        isError={isError}
        error={error}
        isEmpty={filteredVacancies.length === 0}
        onRetry={loadVacancies}
        variant="default"
        messages={{
          loading: 'Loading job vacancies...',
          error: 'Failed to load job vacancies. Please try again.',
          empty: 'No job vacancies found. Try adjusting your filters or create a new vacancy.',
        }}
      >
        <div className="space-y-3">
          {filteredVacancies.map((vacancy) => (
            <div
              key={vacancy.id}
              className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white/50 backdrop-blur-sm'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200/50'} shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-start gap-2.5 mb-2.5">
                    <Briefcase className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className={`text-base md:text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {vacancy.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 text-xs md:text-sm">
                        <span className={`px-3 py-1 rounded-full ${
                          isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {vacancy.department}
                        </span>
                        <span className={`px-3 py-1 rounded-full ${
                          isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                        }`}>
                          📍 {vacancy.location}
                        </span>
                        <span className={`px-3 py-1 rounded-full ${
                          isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                        }`}>
                          🕐 {vacancy.type}
                        </span>
                        <span className={`px-3 py-1 rounded-full ${
                          vacancy.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {vacancy.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Link
                    to={`/admin/careers/${vacancy.id}`}
                    className={`p-1.5 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                  >
                    <Edit className="w-3.5 h-3.5 text-blue-500" />
                  </Link>
                  <button
                    onClick={() => handleDelete(String(vacancy.id))}
                    className={`p-1.5 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DataState>
    </div>
  );
};
