import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { videoGalleriesApi } from '../../services/adminApi';

interface FormData {
  title_en: string;
  title_ar: string;
  title_es: string;
  title_pt: string;
  video_url: string;
  description_en: string;
  description_ar: string;
  description_es: string;
  description_pt: string;
  thumbnail_url: string;
  logo_url: string;
  duration: string;
  display_order: number;
  is_active: number;
}

export const VideoGalleriesForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode, showToast } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title_en: '',
    title_ar: '',
    title_es: '',
    title_pt: '',
    video_url: '',
    description_en: '',
    description_ar: '',
    description_es: '',
    description_pt: '',
    thumbnail_url: '',
    logo_url: '',
    duration: '',
    display_order: 0,
    is_active: 1,
  });

  const loadVideo = useCallback(async () => {
    if (!id) return;

    try {
      const data = await videoGalleriesApi.getById(id);
      setFormData({
        title_en: data.title_en || '',
        title_ar: data.title_ar || '',
        title_es: data.title_es || '',
        title_pt: data.title_pt || '',
        video_url: data.video_url || '',
        description_en: data.description_en || '',
        description_ar: data.description_ar || '',
        description_es: data.description_es || '',
        description_pt: data.description_pt || '',
        thumbnail_url: data.thumbnail_url || '',
        logo_url: data.logo_url || '',
        duration: data.duration || '',
        display_order: data.display_order || 0,
        is_active: data.is_active !== undefined ? data.is_active : 1,
      });
    } catch {
      showToast('Failed to load video', 'error');
      navigate('/admin/video-galleries');
    }
  }, [id, showToast, navigate]);

  useEffect(() => {
    if (id) {
      loadVideo();
    }
  }, [id, loadVideo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title_en || !formData.video_url) {
      showToast('Please fill in all required fields (Title EN and Video URL)', 'error');
      return;
    }

    setLoading(true);

    try {
      if (id) {
        await videoGalleriesApi.update(id, formData as unknown as Record<string, unknown>);
        showToast('Video updated successfully', 'success');
      } else {
        await videoGalleriesApi.create(formData as unknown as Record<string, unknown>);
        showToast('Video created successfully', 'success');
      }
      navigate('/admin/video-galleries');
    } catch {
      showToast(`Failed to ${id ? 'update' : 'create'} video`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/admin/video-galleries')}
          className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
        >
          <ArrowLeft className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} />
        </button>
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {id ? 'Edit Video' : 'New Video'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Video Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Video URL * (YouTube, Vimeo, or direct video link)
              </label>
              <input
                type="url"
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-primary`}
                placeholder="https://www.youtube.com/watch?v=..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Thumbnail URL (optional)
                </label>
                <input
                  type="url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg ${
                    isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="https://example.com/thumbnail.jpg"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Logo URL (optional)
                </label>
                <input
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg ${
                    isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Duration (e.g., 5:23)
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg ${
                    isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="5:23"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  className={`w-full px-4 py-2 rounded-lg ${
                    isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-primary`}
                  min="0"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Status
                </label>
                <select
                  value={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: parseInt(e.target.value) })}
                  className={`w-full px-4 py-2 rounded-lg ${
                    isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-primary`}
                >
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* English Content */}
        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            English Content *
          </h2>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Title (English) *
              </label>
              <input
                type="text"
                value={formData.title_en}
                onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-primary`}
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Description (English)
              </label>
              <textarea
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                rows={3}
                className={`w-full px-4 py-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-primary`}
              />
            </div>
          </div>
        </div>

        {/* Arabic Content */}
        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Arabic Content (اللغة العربية)
          </h2>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Title (Arabic)
              </label>
              <input
                type="text"
                value={formData.title_ar}
                onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-primary`}
                dir="rtl"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Description (Arabic)
              </label>
              <textarea
                value={formData.description_ar}
                onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                rows={3}
                className={`w-full px-4 py-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-primary`}
                dir="rtl"
              />
            </div>
          </div>
        </div>

        {/* Spanish Content */}
        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Spanish Content (Español)
          </h2>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Title (Spanish)
              </label>
              <input
                type="text"
                value={formData.title_es}
                onChange={(e) => setFormData({ ...formData, title_es: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-primary`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Description (Spanish)
              </label>
              <textarea
                value={formData.description_es}
                onChange={(e) => setFormData({ ...formData, description_es: e.target.value })}
                rows={3}
                className={`w-full px-4 py-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-primary`}
              />
            </div>
          </div>
        </div>

        {/* Portuguese Content */}
        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Portuguese Content (Português)
          </h2>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Title (Portuguese)
              </label>
              <input
                type="text"
                value={formData.title_pt}
                onChange={(e) => setFormData({ ...formData, title_pt: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-primary`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Description (Portuguese)
              </label>
              <textarea
                value={formData.description_pt}
                onChange={(e) => setFormData({ ...formData, description_pt: e.target.value })}
                rows={3}
                className={`w-full px-4 py-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-primary`}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/video-galleries')}
            className={`px-6 py-3 rounded-lg ${
              isDarkMode
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            } transition-colors`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Saving...' : id ? 'Update Video' : 'Create Video'}
          </button>
        </div>
      </form>
    </div>
  );
};
