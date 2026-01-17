import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { blogApi } from '../../services/adminApi';
import { useDebounce } from '../../hooks/useDebounce';
import { useDateFormatter } from '../../hooks/useDateFormatter';
import { DataState } from '../../components/ui/DataState';
import fallbackBlogImage from '../../assets/images/67dc711ca538931a3fa8e856_1.webp';

interface BlogPost {
  id: number;
  title_en: string;
  title_ar: string | null;
  title_es: string | null;
  title_pt: string | null;
  content_en: string;
  content_ar: string | null;
  content_es: string | null;
  content_pt: string | null;
  slug: string;
  featured_image: string | null;
  status: 'draft' | 'published';
  language: string;
  created_at: string;
  updated_at: string;
}

export const BlogList: React.FC = () => {
  const { isDarkMode, showToast } = useAdmin();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await blogApi.getAll();
      setPosts(data);
      setIsError(false);
      setError(null);
    } catch (err) {
      setIsError(true);
      setError(err instanceof Error ? err : new Error('Failed to load blog posts'));
      showToast('Failed to load blog posts', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await blogApi.delete(id);
      showToast('Post deleted successfully', 'success');
      loadPosts();
    } catch {
      showToast('Failed to delete post', 'error');
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title_en.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
    const matchesLanguage = filterLanguage === 'all' || post.language === filterLanguage;
    return matchesSearch && matchesStatus && matchesLanguage;
  });

  // Memoize date formatting for filtered posts
  const formattedDates = useDateFormatter(
    filteredPosts,
    post => post.created_at,
    { formatType: 'date' }
  );

  return (
    <div className="space-y-4 md:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className={`text-lg md:text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Blog Posts
          </h1>
          <p className={`text-xs md:text-sm text-gray-500 mt-0.5`}>
            Manage your blog content
          </p>
        </div>
        <Link
          to="/admin/blog/new"
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all text-xs md:text-sm font-medium whitespace-nowrap shadow-sm hover:shadow-md"
        >
          <Plus className="w-3.5 h-3.5" />
          New Post
        </Link>
      </div>

      {/* Filters */}
      <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white/50 backdrop-blur-sm'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200/50'} shadow-sm`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-8 pr-3 py-1.5 rounded-lg text-xs md:text-sm bg-white/80 ${
                isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'text-gray-900 border-gray-200'
              } border focus:outline-none focus:ring-2 focus:ring-primary/20`}
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`px-3 py-1.5 rounded-lg text-xs md:text-sm bg-white/80 ${
              isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'text-gray-900 border-gray-200'
            } border focus:outline-none focus:ring-2 focus:ring-primary/20`}
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          <select
            value={filterLanguage}
            onChange={(e) => setFilterLanguage(e.target.value)}
            className={`px-3 py-1.5 rounded-lg text-xs md:text-sm bg-white/80 ${
              isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'text-gray-900 border-gray-200'
            } border focus:outline-none focus:ring-2 focus:ring-primary/20`}
          >
            <option value="all">All Languages</option>
            <option value="en">English</option>
            <option value="ar">Arabic</option>
            <option value="es">Spanish</option>
            <option value="pt">Portuguese</option>
          </select>
        </div>
      </div>

      {/* Posts Table */}
      <DataState
        isLoading={loading}
        isError={isError}
        error={error}
        isEmpty={filteredPosts.length === 0}
        onRetry={loadPosts}
        variant="default"
        messages={{
          loading: 'Loading blog posts...',
          error: 'Failed to load blog posts. Please try again.',
          empty: 'No blog posts found. Try adjusting your filters or create a new post.',
        }}
      >
        <div className={`rounded-xl overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white/50 backdrop-blur-sm'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200/50'} shadow-sm`}>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50/50 backdrop-blur-sm border-b border-gray-200/50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Post
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Date
                  </th>
                  <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredPosts.map((post) => (
                  <tr key={post.id} className={isDarkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={post.featured_image || fallbackBlogImage}
                          alt={post.title_en}
                          className="w-16 h-10 object-cover rounded"
                        />
                        <div>
                          <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {post.title_en}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          post.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formattedDates.get(post)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/blog/edit/${post.id}`}
                          className={`p-1.5 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          <Edit className="w-3.5 h-3.5 text-blue-500" />
                        </Link>
                        <button
                          onClick={() => handleDelete(String(post.id))}
                          className={`p-1.5 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
            {filteredPosts.map((post) => (
              <div key={post.id} className="p-4">
                <div className="flex items-start gap-4">
                  <img
                    src={post.featured_image || fallbackBlogImage}
                    alt={post.title_en}
                    className="w-20 h-14 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {post.title_en}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          post.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {post.status}
                      </span>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {formattedDates.get(post)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/admin/blog/edit/${post.id}`}
                        className="px-2.5 py-1 bg-blue-500 text-white rounded text-xs shadow-sm hover:shadow-md transition-all"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(String(post.id))}
                        className="px-2.5 py-1 bg-red-500 text-white rounded text-xs shadow-sm hover:shadow-md transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DataState>
    </div>
  );
};
