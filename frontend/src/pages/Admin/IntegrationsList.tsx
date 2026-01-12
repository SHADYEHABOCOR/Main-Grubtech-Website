import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, ExternalLink } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { API_ENDPOINTS, getFileUrl, apiClient } from '../../config/api';
import { DataState } from '../../components/ui/DataState';

interface Integration {
  id: number;
  name: string;
  description: string;
  category: string;
  logo_url: string;
  website_url?: string;
  display_order: number;
  status: string;
}

export const IntegrationsList: React.FC = () => {
  const { isDarkMode } = useAdmin();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchIntegrations = useCallback(async () => {
    try {
      setLoading(true);
      // Backend has max limit of 500, request all integrations
      const response = await fetch(`${API_ENDPOINTS.INTEGRATIONS.BASE}?limit=500`);
      const data = await response.json();
      // Handle paginated response format
      setIntegrations(data.data || data);
      setIsError(false);
      setError(null);
    } catch (err) {
      setIsError(true);
      setError(err instanceof Error ? err : new Error('Failed to load integrations'));
      console.error('Error fetching integrations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this integration?')) return;

    try {
      await apiClient.delete(API_ENDPOINTS.INTEGRATIONS.BY_ID(id.toString()));
      setIntegrations(integrations.filter(int => int.id !== id));
    } catch (error) {
      console.error('Error deleting integration:', error);
      alert('Failed to delete integration');
    }
  };

  const filteredIntegrations = filter === 'all'
    ? integrations
    : integrations.filter(int => int.category === filter);

  const categories = ['all', 'POS', 'Delivery', 'Fulfillment', 'ERP'];

  return (
    <div className="space-y-4 md:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className={`text-lg md:text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Integrations
          </h1>
          <p className={`text-xs md:text-sm text-gray-500 mt-0.5`}>
            Manage integration partners
          </p>
        </div>
        <Link
          to="/admin/integrations/new"
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all text-xs md:text-sm font-medium whitespace-nowrap shadow-sm hover:shadow-md"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Integration
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all text-xs md:text-sm ${
              filter === category
                ? 'bg-primary text-white shadow-sm hover:shadow-md'
                : isDarkMode
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-white/80 text-gray-700 hover:shadow-sm'
            }`}
          >
            {category === 'all' ? 'All Categories' : category}
          </button>
        ))}
      </div>

      {/* Integrations Grid */}
      <DataState
        isLoading={loading}
        isError={isError}
        error={error}
        isEmpty={filteredIntegrations.length === 0}
        onRetry={fetchIntegrations}
        variant="default"
        messages={{
          loading: 'Loading integrations...',
          error: 'Failed to load integrations. Please try again.',
          empty: 'No integrations found. Try adjusting your filters or create a new integration.',
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 md:gap-3">
          {filteredIntegrations.map((integration) => (
            <div
              key={integration.id}
              className={`rounded-xl p-3 md:p-4 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white/50 backdrop-blur-sm'
              } border ${isDarkMode ? 'border-gray-700' : 'border-gray-200/50'} shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <div className="h-16 md:h-20 flex items-center justify-center mb-3">
                    <img
                      src={getFileUrl(integration.logo_url)}
                      alt={integration.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <h3 className={`text-sm md:text-base font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {integration.name}
                  </h3>
                  <p className={`text-xs mb-2.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {integration.description}
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs px-2 py-1 rounded ${
                      isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {integration.category}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      integration.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {integration.status}
                    </span>
                  </div>
                  {integration.website_url && (
                    <a
                      href={integration.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-dark"
                    >
                      Visit Website
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
                <div className="flex gap-1.5 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    to={`/admin/integrations/edit/${integration.id}`}
                    className={`flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg transition-all text-xs ${
                      isDarkMode
                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                        : 'bg-white/80 text-gray-900 hover:shadow-sm'
                    }`}
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(integration.id)}
                    className="px-2.5 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-sm hover:shadow-md"
                  >
                    <Trash2 className="w-3 h-3" />
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
