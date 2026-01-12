import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, Star } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { testimonialsApi } from '../../services/adminApi';
import { useDebounce } from '../../hooks/useDebounce';
import { DataState } from '../../components/ui/DataState';
import type { Testimonial } from '../../types';

export const TestimonialsList: React.FC = () => {
  const { isDarkMode, showToast } = useAdmin();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      const data = await testimonialsApi.getAll();
      setTestimonials(data);
      setIsError(false);
      setError(null);
    } catch (err) {
      setIsError(true);
      setError(err instanceof Error ? err : new Error('Failed to load testimonials'));
      showToast('Failed to load testimonials', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const handleDelete = async (id: number) => {
    try {
      await testimonialsApi.delete(String(id));
      setTestimonials(testimonials.filter((t) => t.id !== id));
      showToast('Testimonial deleted successfully', 'success');
      setDeleteId(null);
    } catch {
      showToast('Failed to delete testimonial', 'error');
    }
  };

  const filteredTestimonials = testimonials.filter((testimonial) =>
    testimonial.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    testimonial.company.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4 md:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className={`text-lg md:text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Testimonials
          </h1>
          <p className={`text-xs md:text-sm text-gray-500 mt-0.5`}>
            Manage customer testimonials
          </p>
        </div>
        <Link
          to="/admin/testimonials/new"
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all text-xs md:text-sm font-medium whitespace-nowrap shadow-sm hover:shadow-md"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Testimonial
        </Link>
      </div>

      {/* Search */}
      <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white/50 backdrop-blur-sm'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200/50'} shadow-sm`}>
        <div className="relative">
          <Search className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder="Search by name or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-8 pr-3 py-1.5 rounded-lg border text-xs md:text-sm bg-white/80 ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'border-gray-200 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-primary/20`}
          />
        </div>
      </div>

      {/* Testimonials List */}
      <DataState
        isLoading={loading}
        isError={isError}
        error={error}
        isEmpty={filteredTestimonials.length === 0}
        onRetry={fetchTestimonials}
        variant="default"
        messages={{
          loading: 'Loading testimonials...',
          error: 'Failed to load testimonials. Please try again.',
          empty: 'No testimonials found'
        }}
      >
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className={`w-full rounded-xl overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white/50 backdrop-blur-sm'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200/50'} shadow-sm`}>
              <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50/50 backdrop-blur-sm border-b border-gray-200/50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Name
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Company
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Rating
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Content
                  </th>
                  <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredTestimonials.map((testimonial) => (
                  <tr key={testimonial.id} className={isDarkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}>
                    <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      <div className="font-medium">{testimonial.name}</div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {testimonial.company}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStars(testimonial.rating)}
                    </td>
                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <div className="max-w-md truncate">{testimonial.content}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/testimonials/edit/${testimonial.id}`}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => setDeleteId(testimonial.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredTestimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white/50 backdrop-blur-sm'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200/50'} shadow-sm hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {testimonial.name}
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {testimonial.company}
                    </p>
                    <div className="mt-2">{renderStars(testimonial.rating)}</div>
                  </div>
                  <div className="flex gap-1.5">
                    <Link
                      to={`/admin/testimonials/edit/${testimonial.id}`}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => setDeleteId(testimonial.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {testimonial.content}
                </p>
              </div>
            ))}
          </div>
        </>
      </DataState>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`max-w-md w-full p-4 md:p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white/50 backdrop-blur-sm'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200/50'} shadow-sm`}>
            <h2 className={`text-lg md:text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Confirm Delete
            </h2>
            <p className={`mb-4 text-xs md:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Are you sure you want to delete this testimonial? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className={`px-3 py-1.5 rounded-lg text-xs md:text-sm ${
                  isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white/80 text-gray-900 hover:shadow-sm'
                } transition-all`}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-xs md:text-sm shadow-sm hover:shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
