import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Star } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { testimonialsApi } from '../../services/adminApi';
import { getFileUrl } from '../../config/api';

interface FormData {
  name: string;
  company: string;
  // English (default)
  headline: string;
  content: string;
  // Arabic
  headline_ar: string;
  content_ar: string;
  // Spanish
  headline_es: string;
  content_es: string;
  // Portuguese
  headline_pt: string;
  content_pt: string;
  // Files and rating
  image: File | null;
  company_logo: File | null;
  rating: number;
}

export const TestimonialsForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode, showToast } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<FormData>({
    name: '',
    company: '',
    headline: '',
    content: '',
    headline_ar: '',
    content_ar: '',
    headline_es: '',
    content_es: '',
    headline_pt: '',
    content_pt: '',
    image: null,
    company_logo: null,
    rating: 5,
  });
  const [currentImage, setCurrentImage] = useState<string>('');
  const [currentCompanyLogo, setCurrentCompanyLogo] = useState<string>('');

  const fetchTestimonial = useCallback(async () => {
    try {
      const testimonial = await testimonialsApi.getById(id!);
      setFormData({
        name: testimonial.name || '',
        company: testimonial.company || '',
        headline: testimonial.headline || '',
        content: testimonial.content || '',
        headline_ar: testimonial.headline_ar || '',
        content_ar: testimonial.content_ar || '',
        headline_es: testimonial.headline_es || '',
        content_es: testimonial.content_es || '',
        headline_pt: testimonial.headline_pt || '',
        content_pt: testimonial.content_pt || '',
        image: null,
        company_logo: null,
        rating: testimonial.rating || 5,
      });
      setCurrentImage(testimonial.image || '');
      setCurrentCompanyLogo(testimonial.company_logo || '');
    } catch {
      showToast('Failed to load testimonial', 'error');
    }
  }, [id, showToast]);

  useEffect(() => {
    if (id) {
      fetchTestimonial();
    }
  }, [id, fetchTestimonial]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    if (formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = 'Rating must be between 1 and 5';
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
      data.append('name', formData.name);
      data.append('company', formData.company);
      // English
      data.append('headline', formData.headline);
      data.append('content', formData.content);
      // Arabic
      data.append('headline_ar', formData.headline_ar);
      data.append('content_ar', formData.content_ar);
      // Spanish
      data.append('headline_es', formData.headline_es);
      data.append('content_es', formData.content_es);
      // Portuguese
      data.append('headline_pt', formData.headline_pt);
      data.append('content_pt', formData.content_pt);
      // Rating
      data.append('rating', formData.rating.toString());

      if (formData.image) {
        data.append('image', formData.image);
      }

      if (formData.company_logo) {
        data.append('company_logo', formData.company_logo);
      }

      if (id) {
        await testimonialsApi.update(id, data);
        showToast('Testimonial updated successfully', 'success');
      } else {
        await testimonialsApi.create(data);
        showToast('Testimonial created successfully', 'success');
      }

      navigate('/admin/testimonials');
    } catch {
      showToast('Failed to save testimonial', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderStarRating = () => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setFormData({ ...formData, rating: star })}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 ${
                star <= formData.rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : isDarkMode
                  ? 'text-gray-600 hover:text-gray-500'
                  : 'text-gray-300 hover:text-gray-400'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div>
      <button
        onClick={() => navigate('/admin/testimonials')}
        className={`inline-flex items-center gap-2 mb-6 ${
          isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
        } transition-colors`}
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Testimonials
      </button>

      <h1 className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {id ? 'Edit Testimonial' : 'Add New Testimonial'}
      </h1>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow space-y-6`}>
          {/* Name */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.name
                  ? 'border-red-500 focus:ring-red-500'
                  : isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-primary'
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-primary'
              } focus:outline-none focus:ring-2`}
              placeholder="Enter name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Company */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Company <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.company
                  ? 'border-red-500 focus:ring-red-500'
                  : isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-primary'
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-primary'
              } focus:outline-none focus:ring-2`}
              placeholder="Enter company name"
            />
            {errors.company && <p className="text-red-500 text-sm mt-1">{errors.company}</p>}
          </div>

          {/* English Content Section */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-blue-50'} space-y-4`}>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              English (Default)
            </h3>

            {/* Headline */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Headline
              </label>
              <input
                type="text"
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-primary'
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-primary'
                } focus:outline-none focus:ring-2`}
                placeholder="Enter headline (e.g., The Essential Ingredient for Restaurant Success)"
              />
            </div>

            {/* Content */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Testimonial Content <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.content
                    ? 'border-red-500 focus:ring-red-500'
                    : isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-primary'
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-primary'
                } focus:outline-none focus:ring-2 resize-none`}
                placeholder="Enter testimonial content"
              />
              {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
            </div>
          </div>

          {/* Arabic Content Section */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-green-50'} space-y-4`}>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Arabic (العربية)
            </h3>

            {/* Arabic Headline */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Headline (Arabic)
              </label>
              <input
                type="text"
                value={formData.headline_ar}
                onChange={(e) => setFormData({ ...formData, headline_ar: e.target.value })}
                dir="rtl"
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-primary'
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-primary'
                } focus:outline-none focus:ring-2`}
                placeholder="أدخل العنوان الرئيسي"
              />
            </div>

            {/* Arabic Content */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Testimonial Content (Arabic)
              </label>
              <textarea
                value={formData.content_ar}
                onChange={(e) => setFormData({ ...formData, content_ar: e.target.value })}
                rows={4}
                dir="rtl"
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-primary'
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-primary'
                } focus:outline-none focus:ring-2 resize-none`}
                placeholder="أدخل محتوى الشهادة"
              />
            </div>
          </div>

          {/* Spanish Content Section */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-yellow-50'} space-y-4`}>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Spanish (Español)
            </h3>

            {/* Spanish Headline */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Headline (Spanish)
              </label>
              <input
                type="text"
                value={formData.headline_es}
                onChange={(e) => setFormData({ ...formData, headline_es: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-primary'
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-primary'
                } focus:outline-none focus:ring-2`}
                placeholder="Ingrese el titular"
              />
            </div>

            {/* Spanish Content */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Testimonial Content (Spanish)
              </label>
              <textarea
                value={formData.content_es}
                onChange={(e) => setFormData({ ...formData, content_es: e.target.value })}
                rows={4}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-primary'
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-primary'
                } focus:outline-none focus:ring-2 resize-none`}
                placeholder="Ingrese el contenido del testimonio"
              />
            </div>
          </div>

          {/* Portuguese Content Section */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-orange-50'} space-y-4`}>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Portuguese (Português)
            </h3>

            {/* Portuguese Headline */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Headline (Portuguese)
              </label>
              <input
                type="text"
                value={formData.headline_pt}
                onChange={(e) => setFormData({ ...formData, headline_pt: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-primary'
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-primary'
                } focus:outline-none focus:ring-2`}
                placeholder="Digite o título"
              />
            </div>

            {/* Portuguese Content */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Testimonial Content (Portuguese)
              </label>
              <textarea
                value={formData.content_pt}
                onChange={(e) => setFormData({ ...formData, content_pt: e.target.value })}
                rows={4}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-primary'
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-primary'
                } focus:outline-none focus:ring-2 resize-none`}
                placeholder="Digite o conteúdo do depoimento"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Testimonial Image
            </label>
            {currentImage && !formData.image && (
              <div className="mb-3">
                {/* Use getFileUrl to construct full URL for backend uploads */}
                <img src={getFileUrl(currentImage)} alt="Current" className="h-32 w-auto rounded-lg object-cover" />
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Current image</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFormData({ ...formData, image: file });
                }
              }}
              className={`w-full px-4 py-3 rounded-lg border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-primary'
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-primary'
              } focus:outline-none focus:ring-2`}
            />
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Upload an image to be displayed on the left side of the testimonial (recommended: 600x400px)
            </p>
          </div>

          {/* Company Logo Upload */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Company Logo
            </label>
            {currentCompanyLogo && !formData.company_logo && (
              <div className="mb-3">
                {/* Use getFileUrl to construct full URL for backend uploads */}
                <img src={getFileUrl(currentCompanyLogo)} alt="Current Logo" className="h-16 w-auto rounded-lg object-contain bg-gray-100 p-2" />
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Current company logo</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFormData({ ...formData, company_logo: file });
                }
              }}
              className={`w-full px-4 py-3 rounded-lg border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-primary'
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-primary'
              } focus:outline-none focus:ring-2`}
            />
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Upload a company logo to be displayed at the bottom of the testimonial (recommended: transparent PNG, max height 48px)
            </p>
          </div>

          {/* Rating */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Rating <span className="text-red-500">*</span>
            </label>
            {renderStarRating()}
            {errors.rating && <p className="text-red-500 text-sm mt-1">{errors.rating}</p>}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={() => navigate('/admin/testimonials')}
              className={`px-6 py-3 rounded-lg ${
                isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              } transition-colors`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Saving...' : id ? 'Update Testimonial' : 'Create Testimonial'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
