import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { blogApi } from '../../services/adminApi';
import { getFileUrl } from '../../config/api';

export const BlogForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode, showToast } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isServerImage, setIsServerImage] = useState(false); // Track if image is from server

  const [formData, setFormData] = useState({
    title_en: '',
    title_ar: '',
    title_es: '',
    title_pt: '',
    content_en: '',
    content_ar: '',
    content_es: '',
    content_pt: '',
    excerpt_en: '',
    excerpt_ar: '',
    excerpt_es: '',
    excerpt_pt: '',
    status: 'draft',
    featuredImage: null as File | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadPost = useCallback(async () => {
    try {
      const data = await blogApi.getById(id!);
      setFormData({
        title_en: data.title_en || '',
        title_ar: data.title_ar || '',
        title_es: data.title_es || '',
        title_pt: data.title_pt || '',
        content_en: data.content_en || '',
        content_ar: data.content_ar || '',
        content_es: data.content_es || '',
        content_pt: data.content_pt || '',
        excerpt_en: data.excerpt_en || '',
        excerpt_ar: data.excerpt_ar || '',
        excerpt_es: data.excerpt_es || '',
        excerpt_pt: data.excerpt_pt || '',
        status: data.status || 'draft',
        featuredImage: null,
      });
      if (data.featured_image) {
        setImagePreview(data.featured_image);
        setIsServerImage(true); // Mark as server image
      }
    } catch {
      showToast('Failed to load post', 'error');
    }
  }, [id, showToast]);

  useEffect(() => {
    if (id) {
      loadPost();
    }
  }, [id, loadPost]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, featuredImage: file }));
      setIsServerImage(false); // New file selected, not from server
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, featuredImage: null }));
    setImagePreview('');
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title_en.trim()) {
      newErrors.title_en = 'English title is required';
    }
    if (!formData.content_en.trim()) {
      newErrors.content_en = 'English content is required';
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
      const data = new FormData();
      data.append('title_en', formData.title_en);
      data.append('title_ar', formData.title_ar);
      data.append('title_es', formData.title_es);
      data.append('title_pt', formData.title_pt);
      data.append('content_en', formData.content_en);
      data.append('content_ar', formData.content_ar);
      data.append('content_es', formData.content_es);
      data.append('content_pt', formData.content_pt);
      data.append('excerpt_en', formData.excerpt_en);
      data.append('excerpt_ar', formData.excerpt_ar);
      data.append('excerpt_es', formData.excerpt_es);
      data.append('excerpt_pt', formData.excerpt_pt);
      data.append('status', formData.status);
      if (formData.featuredImage) {
        data.append('featured_image', formData.featuredImage);
      }

      if (id) {
        await blogApi.update(id, data);
        showToast('Post updated successfully', 'success');
      } else {
        await blogApi.create(data);
        showToast('Post created successfully', 'success');
      }

      navigate('/admin/blog');
    } catch {
      showToast('Failed to save post', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => navigate('/admin/blog')}
        className={`flex items-center gap-2 mb-6 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Blog
      </button>

      <h1 className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {id ? 'Edit Blog Post' : 'Create Blog Post'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Featured Image */}
        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Featured Image
          </label>

          {imagePreview ? (
            <div className="relative inline-block">
              {/* Use getFileUrl for server images, raw preview for newly selected files */}
              <img src={isServerImage ? getFileUrl(imagePreview) : imagePreview} alt="Preview" className="w-full max-w-md rounded-lg" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer ${
              isDarkMode ? 'border-gray-600 hover:border-gray-500 bg-gray-700' : 'border-gray-300 hover:border-gray-400 bg-gray-50'
            }`}>
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className={`w-10 h-10 mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <p className={`mb-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  PNG, JPG or WEBP (MAX. 2MB)
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          )}
        </div>

        {/* Status */}
        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className={`w-full px-4 py-2 rounded-lg ${
              isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-primary`}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        {/* English Fields */}
        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            English
          </h3>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Title *
              </label>
              <input
                type="text"
                value={formData.title_en}
                onChange={(e) => handleInputChange('title_en', e.target.value)}
                className={`w-full px-4 py-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                } focus:outline-none focus:ring-2 ${errors.title_en ? 'ring-red-500' : 'focus:ring-primary'}`}
                placeholder="Enter title in English"
              />
              {errors.title_en && <p className="mt-1 text-sm text-red-500">{errors.title_en}</p>}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Excerpt
              </label>
              <textarea
                value={formData.excerpt_en}
                onChange={(e) => handleInputChange('excerpt_en', e.target.value)}
                rows={3}
                className={`w-full px-4 py-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-primary`}
                placeholder="Short description"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Content * <span className="text-xs font-normal text-gray-500">(HTML supported)</span>
              </label>
              <textarea
                value={formData.content_en}
                onChange={(e) => handleInputChange('content_en', e.target.value)}
                rows={15}
                className={`w-full px-4 py-2 rounded-lg font-mono text-sm ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                } focus:outline-none focus:ring-2 ${errors.content_en ? 'ring-red-500' : 'focus:ring-primary'}`}
                placeholder="Write your content here. You can use HTML tags like <h2>, <p>, <strong>, <ul>, <li>, <a>, <img>, etc."
              />
              <p className={`mt-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                💡 Tip: Use HTML to format your content. Example: &lt;h2&gt;Heading&lt;/h2&gt; &lt;p&gt;Paragraph text&lt;/p&gt; &lt;strong&gt;Bold&lt;/strong&gt; &lt;a href="url"&gt;Link&lt;/a&gt;
              </p>
              {errors.content_en && <p className="mt-1 text-sm text-red-500">{errors.content_en}</p>}
            </div>
          </div>
        </div>

        {/* Arabic Fields */}
        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Arabic (العربية)
          </h3>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Title
              </label>
              <input
                type="text"
                value={formData.title_ar}
                onChange={(e) => handleInputChange('title_ar', e.target.value)}
                className={`w-full px-4 py-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-primary`}
                placeholder="أدخل العنوان بالعربية"
                dir="rtl"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Excerpt
              </label>
              <textarea
                value={formData.excerpt_ar}
                onChange={(e) => handleInputChange('excerpt_ar', e.target.value)}
                rows={3}
                className={`w-full px-4 py-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-primary`}
                placeholder="وصف مختصر"
                dir="rtl"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Content
              </label>
              <textarea
                value={formData.content_ar}
                onChange={(e) => handleInputChange('content_ar', e.target.value)}
                rows={10}
                className={`w-full px-4 py-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-primary`}
                placeholder="اكتب المحتوى هنا"
                dir="rtl"
              />
            </div>
          </div>
        </div>

        {/* Spanish Fields */}
        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Spanish (Español)
          </h3>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Title
              </label>
              <input
                type="text"
                value={formData.title_es}
                onChange={(e) => handleInputChange('title_es', e.target.value)}
                className={`w-full px-4 py-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-primary`}
                placeholder="Introduce el título en español"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Excerpt
              </label>
              <textarea
                value={formData.excerpt_es}
                onChange={(e) => handleInputChange('excerpt_es', e.target.value)}
                rows={3}
                className={`w-full px-4 py-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-primary`}
                placeholder="Descripción corta"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Content
              </label>
              <textarea
                value={formData.content_es}
                onChange={(e) => handleInputChange('content_es', e.target.value)}
                rows={10}
                className={`w-full px-4 py-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-primary`}
                placeholder="Escribe tu contenido aquí"
              />
            </div>
          </div>
        </div>

        {/* Portuguese Fields */}
        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Portuguese (Português)
          </h3>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Title
              </label>
              <input
                type="text"
                value={formData.title_pt}
                onChange={(e) => handleInputChange('title_pt', e.target.value)}
                className={`w-full px-4 py-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-primary`}
                placeholder="Digite o título em português"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Excerpt
              </label>
              <textarea
                value={formData.excerpt_pt}
                onChange={(e) => handleInputChange('excerpt_pt', e.target.value)}
                rows={3}
                className={`w-full px-4 py-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-primary`}
                placeholder="Descrição curta"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Content
              </label>
              <textarea
                value={formData.content_pt}
                onChange={(e) => handleInputChange('content_pt', e.target.value)}
                rows={10}
                className={`w-full px-4 py-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-primary`}
                placeholder="Escreva seu conteúdo aqui"
              />
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : id ? 'Update Post' : 'Create Post'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/blog')}
            className={`px-6 py-3 rounded-lg transition-colors ${
              isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            }`}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
