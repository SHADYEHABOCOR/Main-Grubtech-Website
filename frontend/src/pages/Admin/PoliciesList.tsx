import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, FileText, Eye, EyeOff } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { policiesApi } from '../../services/adminApi';
import { useDebounce } from '../../hooks/useDebounce';
import { DataState } from '../../components/ui/DataState';

interface PolicyPage {
  id: number;
  slug: string;
  title_en: string;
  title_ar: string | null;
  title_es: string | null;
  title_pt: string | null;
  meta_description: string | null;
  status: 'published' | 'draft';
  created_at: string;
  updated_at: string;
}

export const PoliciesList: React.FC = () => {
  const { isDarkMode, showToast } = useAdmin();
  const [policies, setPolicies] = useState<PolicyPage[]>([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadPolicies = useCallback(async () => {
    try {
      setLoading(true);
      const data = await policiesApi.getAll();
      setPolicies(data);
      setIsError(false);
      setError(null);
    } catch (err) {
      setIsError(true);
      setError(err instanceof Error ? err : new Error('Failed to load policy pages'));
      showToast('Failed to load policy pages', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadPolicies();
  }, [loadPolicies]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this policy page?')) return;

    try {
      await policiesApi.delete(id);
      showToast('Policy page deleted successfully', 'success');
      loadPolicies();
    } catch {
      showToast('Failed to delete policy page', 'error');
    }
  };

  const filteredPolicies = policies.filter((policy) => {
    const matchesSearch = policy.title_en.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      policy.slug.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesStatus = filterStatus === 'all' || policy.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4 md:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className={`text-lg md:text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Policy Pages
          </h1>
          <p className={`text-xs md:text-sm text-gray-500 mt-0.5`}>
            Manage legal and policy content (Privacy Policy, Terms of Service, etc.)
          </p>
        </div>
        <Link
          to="/admin/policies/new"
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all text-xs md:text-sm font-medium whitespace-nowrap shadow-sm hover:shadow-md"
        >
          <Plus className="w-3.5 h-3.5" />
          New Policy Page
        </Link>
      </div>

      {/* Filters */}
      <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white/50 backdrop-blur-sm'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200/50'} shadow-sm`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search policy pages..."
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
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Policies List */}
      <DataState
        isLoading={loading}
        isError={isError}
        error={error}
        isEmpty={filteredPolicies.length === 0}
        onRetry={loadPolicies}
        variant="default"
        messages={{
          loading: 'Loading policy pages...',
          error: 'Failed to load policy pages. Please try again.',
          empty: 'No policy pages found'
        }}
      >
        <div className="space-y-3">
          {filteredPolicies.map((policy) => (
            <div
              key={policy.id}
              className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white/50 backdrop-blur-sm'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200/50'} shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-start gap-2.5 mb-2.5">
                    <FileText className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className={`text-base md:text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {policy.title_en}
                      </h3>
                      <div className="flex flex-wrap gap-2 text-xs md:text-sm">
                        <span className={`px-3 py-1 rounded-full font-mono ${
                          isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                        }`}>
                          /{policy.slug}
                        </span>
                        <span className={`px-3 py-1 rounded-full flex items-center gap-1 ${
                          policy.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {policy.status === 'published' ? (
                            <Eye className="w-3 h-3" />
                          ) : (
                            <EyeOff className="w-3 h-3" />
                          )}
                          {policy.status}
                        </span>
                        {policy.meta_description && (
                          <span className={`px-3 py-1 rounded-full ${
                            isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                          } max-w-xs truncate`}>
                            {policy.meta_description}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Link
                    to={`/admin/policies/${policy.id}`}
                    className={`p-1.5 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                  >
                    <Edit className="w-3.5 h-3.5 text-blue-500" />
                  </Link>
                  <button
                    onClick={() => handleDelete(String(policy.id))}
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
