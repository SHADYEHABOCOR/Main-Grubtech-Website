import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { integrationsApi } from '../../services/adminApi';
import { getFileUrl } from '../../config/api';

interface IntegrationFormData {
  name: string;
  description: string;
  category: string;
  logo: File | null;
  website_url: string;
  display_order: number;
  status: string;
}

export const IntegrationsForm: React.FC = () => {
  const { isDarkMode } = useAdmin();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<IntegrationFormData>({
    name: '',
    description: '',
    category: 'POS',
    logo: null,
    website_url: '',
    display_order: 0,
    status: 'active',
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string>('');

  useEffect(() => {
    if (isEditing) {
      fetchIntegration();
    }
  }, [id]);

  const fetchIntegration = async () => {
    setLoading(true);
    try {
      const data = await integrationsApi.getById(id!);
      setFormData({
        name: data.name || '',
        description: data.description || '',
        category: data.category || 'POS',
        logo: null,
        website_url: data.website_url || '',
        display_order: data.display_order || 0,
        status: data.status || 'active',
      });
      setCurrentLogoUrl(data.logo_url || '');
    } catch (error) {
      console.error('Error fetching integration:', error);
      alert('Failed to load integration');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('website_url', formData.website_url);
      data.append('display_order', formData.display_order.toString());
      data.append('status', formData.status);

      if (formData.logo) {
        data.append('logo', formData.logo);
      }

      if (isEditing) {
        await integrationsApi.update(id!, data);
      } else {
        await integrationsApi.create(data);
      }

      navigate('/admin/integrations');
    } catch (error) {
      console.error('Error saving integration:', error);
      alert('Failed to save integration');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'display_order' ? parseInt(value) || 0 : value,
    }));
  };

  if (loading) {
    return (
      <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Loading...
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/admin/integrations')}
          className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
        >
          <ArrowLeft className={`w-6 h-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
        </button>
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {isEditing ? 'Edit Integration' : 'Add Integration'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className={`max-w-3xl rounded-xl p-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
        <div className="space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={`w-full px-4 py-2 rounded-lg border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="e.g., Square"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="Brief description of the integration"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className={`w-full px-4 py-2 rounded-lg border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="POS">POS Systems</option>
              <option value="Delivery">Delivery Platforms</option>
              <option value="Fulfillment">Fulfillment</option>
              <option value="ERP">ERP Systems</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Logo {!isEditing && '*'}
            </label>
            {currentLogoUrl && !formData.logo && (
              <div className="mb-3">
                <img
                  src={getFileUrl(currentLogoUrl)}
                  alt="Current logo"
                  className="h-20 object-contain bg-gray-100 p-2 rounded"
                />
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Current logo</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*,.svg"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFormData({ ...formData, logo: file });
                }
              }}
              required={!isEditing && !currentLogoUrl}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Upload a logo (PNG, JPG, or SVG). Recommended: transparent background, max height 80px
            </p>
            {formData.logo && (
              <p className={`text-sm mt-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                Selected: {formData.logo.name}
              </p>
            )}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Website URL
            </label>
            <input
              type="url"
              name="website_url"
              value={formData.website_url}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="https://example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Display Order
              </label>
              <input
                type="number"
                name="display_order"
                value={formData.display_order}
                onChange={handleChange}
                min="0"
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {submitting ? 'Saving...' : isEditing ? 'Update Integration' : 'Create Integration'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/integrations')}
            className={`px-6 py-3 rounded-lg transition-colors ${
              isDarkMode
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
