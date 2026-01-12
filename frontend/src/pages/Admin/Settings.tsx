import React, { useEffect, useState, useCallback } from 'react';
import { Save } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { settingsApi } from '../../services/adminApi';

interface SettingsData {
  heroTitle: string;
  heroSubtitle: string;
  ctaText: string;
  ctaLink: string;
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  aboutText: string;
}

export const Settings: React.FC = () => {
  const { isDarkMode, showToast } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<SettingsData>({
    heroTitle: '',
    heroSubtitle: '',
    ctaText: '',
    ctaLink: '',
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    companyAddress: '',
    aboutText: '',
  });

  const fetchSettings = useCallback(async () => {
    try {
      const data = await settingsApi.get();
      setFormData(data);
    } catch {
      showToast('Failed to load settings', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.heroTitle.trim()) {
      newErrors.heroTitle = 'Hero title is required';
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (formData.companyEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.companyEmail)) {
      newErrors.companyEmail = 'Invalid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    setLoading(true);

    try {
      await settingsApi.update(formData as unknown as Record<string, unknown>);
      showToast('Settings updated successfully', 'success');
    } catch {
      showToast('Failed to update settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Settings
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
        {/* Hero Section */}
        <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Hero Section
          </h2>
          <div className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Hero Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.heroTitle}
                onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.heroTitle
                    ? 'border-red-500 focus:ring-red-500'
                    : isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-primary'
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-primary'
                } focus:outline-none focus:ring-2`}
                placeholder="Enter hero title"
              />
              {errors.heroTitle && <p className="text-red-500 text-sm mt-1">{errors.heroTitle}</p>}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Hero Subtitle
              </label>
              <textarea
                value={formData.heroSubtitle}
                onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                rows={3}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-primary'
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-primary'
                } focus:outline-none focus:ring-2 resize-none`}
                placeholder="Enter hero subtitle"
              />
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Call to Action
          </h2>
          <div className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                CTA Button Text
              </label>
              <input
                type="text"
                value={formData.ctaText}
                onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-primary'
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-primary'
                } focus:outline-none focus:ring-2`}
                placeholder="e.g., Get Started"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                CTA Link
              </label>
              <input
                type="text"
                value={formData.ctaLink}
                onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-primary'
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-primary'
                } focus:outline-none focus:ring-2`}
                placeholder="e.g., /connect-with-us"
              />
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Company Information
          </h2>
          <div className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.companyName
                    ? 'border-red-500 focus:ring-red-500'
                    : isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-primary'
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-primary'
                } focus:outline-none focus:ring-2`}
                placeholder="Enter company name"
              />
              {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Email
                </label>
                <input
                  type="email"
                  value={formData.companyEmail}
                  onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.companyEmail
                      ? 'border-red-500 focus:ring-red-500'
                      : isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-primary'
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-primary'
                  } focus:outline-none focus:ring-2`}
                  placeholder="company@example.com"
                />
                {errors.companyEmail && <p className="text-red-500 text-sm mt-1">{errors.companyEmail}</p>}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.companyPhone}
                  onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-primary'
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-primary'
                  } focus:outline-none focus:ring-2`}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Address
              </label>
              <textarea
                value={formData.companyAddress}
                onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                rows={3}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-primary'
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-primary'
                } focus:outline-none focus:ring-2 resize-none`}
                placeholder="Enter company address"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                About Text
              </label>
              <textarea
                value={formData.aboutText}
                onChange={(e) => setFormData({ ...formData, aboutText: e.target.value })}
                rows={5}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-primary'
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-primary'
                } focus:outline-none focus:ring-2 resize-none`}
                placeholder="Enter about company text"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Save className="w-5 h-5" />
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};
