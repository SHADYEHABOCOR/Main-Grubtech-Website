import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { teamApi } from '../../services/adminApi';
import { getFileUrl } from '../../config/api';

interface FormData {
  name: string;
  role: string;
  bio: string;
  photo: File | null;
}

export const TeamForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode, showToast } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isServerImage, setIsServerImage] = useState(false); // Track if image is from server
  const [formData, setFormData] = useState<FormData>({
    name: '',
    role: '',
    bio: '',
    photo: null,
  });

  const fetchTeamMember = useCallback(async () => {
    try {
      const data = await teamApi.getAll();
      const member = data.find((m: { id: string }) => m.id === id);
      if (member) {
        setFormData({
          name: member.name,
          role: member.role,
          bio: member.bio,
          photo: null,
        });
        setImagePreview(member.photo);
        setIsServerImage(true); // Mark as server image
      }
    } catch {
      showToast('Failed to load team member', 'error');
    }
  }, [id, showToast]);

  useEffect(() => {
    if (id) {
      fetchTeamMember();
    }
  }, [id, fetchTeamMember]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.role.trim()) {
      newErrors.role = 'Role is required';
    }

    if (!formData.bio.trim()) {
      newErrors.bio = 'Bio is required';
    }

    if (!id && !formData.photo) {
      newErrors.photo = 'Photo is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, photo: file });
      setIsServerImage(false); // New file selected, not from server
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, photo: null });
    setImagePreview('');
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
      data.append('role', formData.role);
      data.append('bio', formData.bio);
      if (formData.photo) {
        data.append('photo', formData.photo);
      }

      if (id) {
        await teamApi.update(id, data as unknown as Record<string, unknown>);
        showToast('Team member updated successfully', 'success');
      } else {
        await teamApi.create(data as unknown as Record<string, unknown>);
        showToast('Team member created successfully', 'success');
      }

      navigate('/admin/team');
    } catch {
      showToast('Failed to save team member', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => navigate('/admin/team')}
        className={`inline-flex items-center gap-2 mb-6 ${
          isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
        } transition-colors`}
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Team
      </button>

      <h1 className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {id ? 'Edit Team Member' : 'Add New Team Member'}
      </h1>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow space-y-6`}>
          {/* Photo Upload */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Photo {!id && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-4">
              {imagePreview ? (
                <div className="relative inline-block">
                  {/* Use getFileUrl for server images, raw preview for newly selected files */}
                  <img
                    src={isServerImage ? getFileUrl(imagePreview) : imagePreview}
                    alt="Preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label
                  className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer ${
                    errors.photo
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                      : isDarkMode
                      ? 'border-gray-600 bg-gray-700 hover:bg-gray-650'
                      : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                  } transition-colors`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className={`w-10 h-10 mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <p className={`mb-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      PNG, JPG or WEBP (MAX. 800x800px)
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
            {errors.photo && <p className="text-red-500 text-sm mt-1">{errors.photo}</p>}
          </div>

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
              placeholder="Enter full name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Role */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Role <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.role
                  ? 'border-red-500 focus:ring-red-500'
                  : isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-primary'
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-primary'
              } focus:outline-none focus:ring-2`}
              placeholder="e.g., CEO, CTO, Product Manager"
            />
            {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
          </div>

          {/* Bio */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Bio <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={5}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.bio
                  ? 'border-red-500 focus:ring-red-500'
                  : isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-primary'
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-primary'
              } focus:outline-none focus:ring-2 resize-none`}
              placeholder="Enter bio/description"
            />
            {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio}</p>}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={() => navigate('/admin/team')}
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
              {loading ? 'Saving...' : id ? 'Update Team Member' : 'Create Team Member'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
