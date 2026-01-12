import React, { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Briefcase,
  Plug,
  Video,
  Users,
  Moon,
  Sun,
  Menu,
  X,
  LogOut,
  BarChart3,
  UserCheck,
  Scale,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { apiClient, API_ENDPOINTS } from '../../config/api';

export const AdminLayout: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/admin/leads', icon: Users, label: 'Leads' },
    { path: '/admin/job-applications', icon: UserCheck, label: 'Job Applications' },
    { path: '/admin/blog', icon: FileText, label: 'Blog' },
    { path: '/admin/testimonials', icon: MessageSquare, label: 'Testimonials' },
    { path: '/admin/video-galleries', icon: Video, label: 'Video Galleries' },
    { path: '/admin/careers', icon: Briefcase, label: 'Careers' },
    { path: '/admin/integrations', icon: Plug, label: 'Integrations' },
    { path: '/admin/policies', icon: Scale, label: 'Policy Pages' },
  ];

  const handleLogout = async () => {
    try {
      // Call logout endpoint to clear httpOnly cookie on server
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch {
      // Continue with logout even if API call fails
    }
    // Clear cached user data
    sessionStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div data-admin-panel className={`min-h-screen ${isDarkMode ? 'dark bg-gray-950' : 'bg-gray-50'}`}>
      {/* Header - Fixed at top */}
      <header className={`fixed top-0 left-0 right-0 z-40 backdrop-blur-md ${isDarkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'} border-b`}>
        <div className="flex items-center justify-between px-4 md:px-6 py-3">
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`lg:hidden p-1.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
            >
              {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <h1 className={`text-base md:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Grubtech CMS
            </h1>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            <button
              onClick={toggleDarkMode}
              className={`p-1.5 rounded-lg transition-all ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-gray-500" />}
            </button>
            <button
              onClick={handleLogout}
              className={`p-1.5 rounded-lg transition-all ${isDarkMode ? 'hover:bg-gray-800 text-red-400' : 'hover:bg-gray-100 text-red-500'}`}
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Content wrapper with top padding to account for fixed header */}
      <div className="flex pt-[49px]">
        {/* Sidebar - Fixed below header */}
        <aside
          className={`fixed left-0 top-[49px] z-30 w-56 h-[calc(100vh-49px)] transition-transform ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } ${isDarkMode ? 'bg-gray-900/50 backdrop-blur-md border-gray-800' : 'bg-white/50 backdrop-blur-md border-gray-200'} border-r`}
        >
          <nav className="p-3 space-y-1 overflow-y-auto h-full">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-sm ${
                    active
                      ? isDarkMode
                        ? 'bg-primary/90 text-white shadow-lg shadow-primary/20'
                        : 'bg-primary text-white shadow-md shadow-primary/20'
                      : isDarkMode
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 lg:ml-56">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};
