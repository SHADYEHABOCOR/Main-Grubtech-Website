import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Globe, Code, Eye } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { policiesApi } from '../../services/adminApi';
import { sanitizeHtml } from '../../utils/sanitizeHtml';

interface FormData {
  slug: string;
  title_en: string;
  title_ar: string;
  title_es: string;
  title_pt: string;
  content_en: string;
  content_ar: string;
  content_es: string;
  content_pt: string;
  meta_description: string;
  status: 'published' | 'draft';
}

type Language = 'en' | 'ar' | 'es' | 'pt';

const languageLabels: Record<Language, string> = {
  en: 'English',
  ar: 'Arabic',
  es: 'Spanish',
  pt: 'Portuguese',
};

export const PoliciesForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode, showToast } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Language>('en');
  const [previewMode, setPreviewMode] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    slug: '',
    title_en: '',
    title_ar: '',
    title_es: '',
    title_pt: '',
    content_en: '',
    content_ar: '',
    content_es: '',
    content_pt: '',
    meta_description: '',
    status: 'published',
  });

  const loadPolicy = useCallback(async () => {
    if (!id) return;

    try {
      const data = await policiesApi.getById(id);
      setFormData({
        slug: data.slug || '',
        title_en: data.title_en || '',
        title_ar: data.title_ar || '',
        title_es: data.title_es || '',
        title_pt: data.title_pt || '',
        content_en: data.content_en || '',
        content_ar: data.content_ar || '',
        content_es: data.content_es || '',
        content_pt: data.content_pt || '',
        meta_description: data.meta_description || '',
        status: data.status || 'published',
      });
    } catch {
      showToast('Failed to load policy page', 'error');
      navigate('/admin/policies');
    }
  }, [id, showToast, navigate]);

  useEffect(() => {
    if (id) {
      loadPolicy();
    }
  }, [id, loadPolicy]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.slug || !formData.title_en || !formData.content_en) {
      showToast('Please fill in slug, English title, and English content', 'error');
      return;
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      showToast('Slug must contain only lowercase letters, numbers, and hyphens', 'error');
      return;
    }

    setLoading(true);

    try {
      if (id) {
        await policiesApi.update(id, formData as unknown as Record<string, unknown>);
        showToast('Policy page updated successfully', 'success');
      } else {
        await policiesApi.create(formData as unknown as Record<string, unknown>);
        showToast('Policy page created successfully', 'success');
      }
      navigate('/admin/policies');
    } catch {
      showToast(`Failed to ${id ? 'update' : 'create'} policy page`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getTitleField = (lang: Language) => `title_${lang}` as keyof FormData;
  const getContentField = (lang: Language) => `content_${lang}` as keyof FormData;

  const currentContent = formData[getContentField(activeTab)] as string;

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/admin/policies')}
          className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
        >
          <ArrowLeft className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} />
        </button>
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {id ? 'Edit Policy Page' : 'New Policy Page'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Basic Information
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  URL Slug *
                </label>
                <div className="flex items-center">
                  <span className={`px-3 py-2 rounded-l-lg border border-r-0 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-500'
                  }`}>
                    /
                  </span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    className={`flex-1 px-4 py-2 rounded-r-lg ${
                      isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-200'
                    } border focus:outline-none focus:ring-2 focus:ring-primary`}
                    placeholder="privacy-policy"
                    required
                  />
                </div>
                <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Only lowercase letters, numbers, and hyphens
                </p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'published' | 'draft' })}
                  className={`w-full px-4 py-2 rounded-lg ${
                    isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-200'
                  } border focus:outline-none focus:ring-2 focus:ring-primary`}
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Meta Description (SEO)
              </label>
              <textarea
                value={formData.meta_description}
                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                rows={2}
                className={`w-full px-4 py-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-200'
                } border focus:outline-none focus:ring-2 focus:ring-primary`}
                placeholder="Brief description for search engines..."
              />
            </div>
          </div>
        </div>

        {/* Content - Language Tabs */}
        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Content
            </h2>
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                previewMode
                  ? 'bg-primary text-white'
                  : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
              } transition-colors`}
            >
              {previewMode ? <Code className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {previewMode ? 'Edit HTML' : 'Preview'}
            </button>
          </div>

          {/* Language Tabs */}
          <div className="flex gap-2 mb-4 border-b border-gray-200 dark:border-gray-700">
            {(['en', 'ar', 'es', 'pt'] as Language[]).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setActiveTab(lang)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === lang
                    ? 'border-primary text-primary'
                    : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
                }`}
              >
                <Globe className="w-4 h-4" />
                {languageLabels[lang]}
                {lang === 'en' && <span className="text-red-500">*</span>}
              </button>
            ))}
          </div>

          {/* Title for current language */}
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Title ({languageLabels[activeTab]}) {activeTab === 'en' && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={formData[getTitleField(activeTab)] as string}
              onChange={(e) => setFormData({ ...formData, [getTitleField(activeTab)]: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg ${
                isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-200'
              } border focus:outline-none focus:ring-2 focus:ring-primary`}
              placeholder={`e.g., ${activeTab === 'en' ? 'Privacy Policy' : 'Title in ' + languageLabels[activeTab]}`}
              required={activeTab === 'en'}
              dir={activeTab === 'ar' ? 'rtl' : 'ltr'}
            />
          </div>

          {/* Content Editor/Preview */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Content ({languageLabels[activeTab]}) {activeTab === 'en' && <span className="text-red-500">*</span>}
            </label>

            {previewMode ? (
              <div
                className={`w-full min-h-[400px] p-4 rounded-lg border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'
                } overflow-auto prose prose-sm max-w-none ${activeTab === 'ar' ? 'prose-rtl' : ''}`}
                dir={activeTab === 'ar' ? 'rtl' : 'ltr'}
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(currentContent || '<p class="text-gray-400">No content to preview</p>') }}
              />
            ) : (
              <textarea
                value={currentContent}
                onChange={(e) => setFormData({ ...formData, [getContentField(activeTab)]: e.target.value })}
                rows={20}
                className={`w-full px-4 py-3 rounded-lg font-mono text-sm ${
                  isDarkMode ? 'bg-gray-900 text-green-400 border-gray-600' : 'bg-gray-900 text-green-400 border-gray-700'
                } border focus:outline-none focus:ring-2 focus:ring-primary`}
                placeholder={`<h2>Section Title</h2>
<p>Your policy content here...</p>
<ul>
  <li>List item 1</li>
  <li>List item 2</li>
</ul>`}
                required={activeTab === 'en'}
                dir={activeTab === 'ar' ? 'rtl' : 'ltr'}
              />
            )}
            <p className={`mt-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Write content using HTML tags. Supported: h1-h6, p, ul, ol, li, strong, em, a, br, hr, blockquote, table, etc.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/policies')}
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
            {loading ? 'Saving...' : id ? 'Update Policy Page' : 'Create Policy Page'}
          </button>
        </div>
      </form>
    </div>
  );
};
