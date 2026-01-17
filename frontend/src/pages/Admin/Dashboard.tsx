import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, MessageSquare, Briefcase, Plug, ArrowRight, Users, PenLine, Plus } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { blogApi, testimonialsApi, careersApi } from '../../services/adminApi';
import { apiClient, getApiUrl } from '../../config/api';

export const Dashboard: React.FC = () => {
  const { isDarkMode } = useAdmin();
  const [stats, setStats] = useState({
    blogs: 0,
    testimonials: 0,
    careers: 0,
    integrations: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [blogsData, testimonialsData, careersData, integrationsResponse] = await Promise.all([
        blogApi.getAll().catch(() => ({ data: [] })),
        testimonialsApi.getAll().catch(() => []),
        careersApi.getAll().catch(() => ({ data: [] })),
        // Get full response with pagination to access total count
        apiClient.get(getApiUrl('/api/integrations?limit=1')).catch(() => ({ data: { data: [], pagination: { total: 0 } } }))
      ]);

      // blogApi and careersApi return { data: [...], pagination: {...} }
      // testimonialsApi returns [...] directly (already unwrapped)
      // integrationsResponse is full axios response
      setStats({
        blogs: Array.isArray(blogsData.data) ? blogsData.data.length : (Array.isArray(blogsData) ? blogsData.length : 0),
        testimonials: Array.isArray(testimonialsData) ? testimonialsData.length : 0,
        careers: Array.isArray(careersData.data) ? careersData.data.length : (Array.isArray(careersData) ? careersData.length : 0),
        integrations: integrationsResponse.data?.pagination?.total || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    { label: 'Blog Posts', value: stats.blogs, icon: FileText, link: '/admin/blog', color: 'blue' },
    { label: 'Testimonials', value: stats.testimonials, icon: MessageSquare, link: '/admin/testimonials', color: 'emerald' },
    { label: 'Job Openings', value: stats.careers, icon: Briefcase, link: '/admin/careers', color: 'amber' },
    { label: 'Integrations', value: stats.integrations, icon: Plug, link: '/admin/integrations', color: 'violet' },
  ];

  const quickActions = [
    { label: 'View Leads', icon: Users, link: '/admin/leads', primary: true },
    { label: 'New Blog Post', icon: PenLine, link: '/admin/blog/new' },
    { label: 'Add Testimonial', icon: Plus, link: '/admin/testimonials/new' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-semibold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Dashboard
        </h1>
        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Welcome back. Here's an overview of your content.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`h-32 rounded-2xl animate-pulse ${
                isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
              }`}
            />
          ))}
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statsCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Link
                  key={stat.label}
                  to={stat.link}
                  className={`group relative p-5 rounded-2xl transition-all duration-200 ${
                    isDarkMode
                      ? 'bg-gray-900 border border-gray-800 hover:border-gray-700'
                      : 'bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm'
                  }`}
                >
                  {/* Top accent */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl ${
                      stat.color === 'blue' ? 'bg-blue-500' :
                      stat.color === 'emerald' ? 'bg-emerald-500' :
                      stat.color === 'amber' ? 'bg-amber-500' :
                      'bg-violet-500'
                    }`}
                  />

                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <Icon className={`w-5 h-5 ${
                        stat.color === 'blue' ? 'text-blue-500' :
                        stat.color === 'emerald' ? 'text-emerald-500' :
                        stat.color === 'amber' ? 'text-amber-500' :
                        'text-violet-500'
                      }`} />
                    </div>
                    <ArrowRight className={`w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-400'
                    }`} />
                  </div>

                  <div className={`text-3xl font-semibold tracking-tight mb-1 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {stat.value}
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {stat.label}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Quick Actions & Info */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Quick Actions */}
            <div className={`lg:col-span-2 p-6 rounded-2xl ${
              isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-100'
            }`}>
              <h2 className={`text-base font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Quick Actions
              </h2>
              <div className="space-y-2">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.label}
                      to={action.link}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        action.primary
                          ? 'bg-primary text-white hover:bg-primary/90'
                          : isDarkMode
                            ? 'bg-gray-800 text-gray-200 hover:bg-gray-750'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{action.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Getting Started */}
            <div className={`lg:col-span-3 p-6 rounded-2xl ${
              isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-100'
            }`}>
              <h2 className={`text-base font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Getting Started
              </h2>
              <div className="space-y-4">
                <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
                      <Users className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                    </div>
                    <div>
                      <h3 className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Lead Management
                      </h3>
                      <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        View and manage leads from contact forms, track submissions, and export data for follow-up.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
                      <FileText className={`w-4 h-4 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-500'}`} />
                    </div>
                    <div>
                      <h3 className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Content Management
                      </h3>
                      <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Create and manage blog posts, testimonials, job listings, and integrations across multiple languages.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
