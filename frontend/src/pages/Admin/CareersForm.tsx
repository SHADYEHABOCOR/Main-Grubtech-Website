import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { careersApi } from '../../services/adminApi';

interface FormData {
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string;
  application_link: string;
  status: 'active' | 'inactive';
}

export const CareersForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode, showToast } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    department: '',
    location: '',
    type: 'Full-time',
    description: '',
    requirements: '',
    application_link: '',
    status: 'active',
  });

  const loadVacancy = useCallback(async () => {
    if (!id) return;

    try {
      const data = await careersApi.getOne(id);
      setFormData({
        title: data.title || '',
        department: data.department || '',
        location: data.location || '',
        type: data.type || 'Full-time',
        description: data.description || '',
        requirements: data.requirements || '',
        application_link: data.application_link || '',
        status: data.status || 'active',
      });
    } catch {
      showToast('Failed to load job vacancy', 'error');
      navigate('/admin/careers');
    }
  }, [id, showToast, navigate]);

  useEffect(() => {
    if (id) {
      loadVacancy();
    }
  }, [id, loadVacancy]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.department || !formData.location) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);

    try {
      if (id) {
        await careersApi.update(id, formData as unknown as Record<string, unknown>);
        showToast('Job vacancy updated successfully', 'success');
      } else {
        await careersApi.create(formData as unknown as Record<string, unknown>);
        showToast('Job vacancy created successfully', 'success');
      }
      navigate('/admin/careers');
    } catch {
      showToast(`Failed to ${id ? 'update' : 'create'} job vacancy`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/admin/careers')}
          className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
        >
          <ArrowLeft className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} />
        </button>
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {id ? 'Edit Job Vacancy' : 'New Job Vacancy'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Basic Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Job Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-primary`}
                placeholder="e.g., Senior Full Stack Engineer"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Department *
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg ${
                    isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="e.g., Engineering"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg ${
                    isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="e.g., Dubai, UAE or Remote"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Employment Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg ${
                    isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-primary`}
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className={`w-full px-4 py-2 rounded-lg ${
                    isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-primary`}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Job Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Job Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                className={`w-full px-4 py-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-primary`}
                placeholder="Describe the role, responsibilities, and what the candidate will be doing..."
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Requirements
              </label>
              <textarea
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                rows={6}
                className={`w-full px-4 py-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-primary`}
                placeholder="List the required qualifications, skills, experience, etc..."
              />
              <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Tip: You can use line breaks to create bullet points
              </p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Application Link
              </label>
              <input
                type="url"
                value={formData.application_link}
                onChange={(e) => setFormData({ ...formData, application_link: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-primary`}
                placeholder="https://careers.example.com/apply/job-id"
              />
              <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Optional: Provide a direct link where candidates can apply for this position
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/careers')}
            className={`px-6 py-2 rounded-lg ${
              isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            } transition-colors`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Saving...' : id ? 'Update Job Vacancy' : 'Create Job Vacancy'}
          </button>
        </div>
      </form>
    </div>
  );
};
