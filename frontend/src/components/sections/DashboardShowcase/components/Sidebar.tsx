import React from 'react';
import {
  ChevronDown,
  LayoutDashboard,
  BarChart2,
  BookOpen,
  Box,
  Grid,
  Megaphone,
  Landmark,
  Users,
  Settings,
  ChevronRight,
  LogOut,
  ChevronLeft,
} from 'lucide-react';

interface SidebarProps {
  /** Current active page/view in the dashboard */
  activePage: 'home' | 'sales';
  /** Whether to reduce motion for accessibility */
  prefersReducedMotion?: boolean;
}

/**
 * Sidebar component displays the dashboard navigation sidebar.
 * Contains multiple menu items including Home, Real-Time Reports (with submenu),
 * Menu Management, Inventory, Applications, Marketing, gLend, User Management,
 * and Account Settings. Also includes language selector and user profile footer.
 *
 * @example
 * <Sidebar activePage="home" />
 * <Sidebar activePage="sales" prefersReducedMotion={true} />
 */
export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  prefersReducedMotion = false,
}) => {
  return (
    <div className="flex w-56 bg-white h-full flex-col border-r border-gray-200 flex-shrink-0">
      {/* Logo */}
      <div className="p-5 flex items-center justify-between relative">
        <h1 className="text-xl font-bold text-blue-600 tracking-tight">grubtech</h1>
        <button
          className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs shadow-sm border border-blue-100 absolute -right-3 top-6 z-20"
          aria-label="Collapse sidebar"
          tabIndex={-1}
        >
          <ChevronLeft size={14} />
        </button>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1 text-sm">
        <div
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium ${
            !prefersReducedMotion ? 'transition-colors' : ''
          } ${
            activePage === 'home'
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <LayoutDashboard size={16} />
          <span>Home</span>
        </div>

        <div>
          <div
            data-tutorial-target="sales-sidebar-item"
            className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer ${
              !prefersReducedMotion ? 'transition-colors' : ''
            } ${
              activePage === 'sales'
                ? 'text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <BarChart2 size={16} />
              <span>Real-Time Reports</span>
            </div>
            <ChevronDown size={14} />
          </div>

          {activePage === 'sales' && (
            <div className="ml-9 mt-1 space-y-1 border-l border-gray-100 pl-2">
              <div className="px-3 py-2 text-sm text-gray-500 hover:text-blue-600 cursor-pointer">
                Dashboard
              </div>
              <div className="px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-md font-medium cursor-pointer border-l-2 border-blue-600 -ml-2.5">
                Sales
              </div>
              <div className="px-3 py-2 text-sm text-gray-500 hover:text-blue-600 cursor-pointer">
                Menu Performance
              </div>
            </div>
          )}
        </div>

        <div
          className={`flex items-center justify-between px-3 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer ${
            !prefersReducedMotion ? 'transition-colors' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <BookOpen size={16} />
            <span>Menu Management</span>
          </div>
          <ChevronDown size={14} className="text-gray-400" />
        </div>

        <div
          className={`flex items-center justify-between px-3 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer ${
            !prefersReducedMotion ? 'transition-colors' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <Box size={16} />
            <span>Inventory</span>
          </div>
          <ChevronDown size={14} className="text-gray-400" />
        </div>

        <div
          className={`flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer ${
            !prefersReducedMotion ? 'transition-colors' : ''
          }`}
        >
          <Grid size={16} />
          <span>Applications</span>
        </div>

        <div
          className={`flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer ${
            !prefersReducedMotion ? 'transition-colors' : ''
          }`}
        >
          <Megaphone size={16} />
          <span>Marketing</span>
        </div>

        <div
          className={`flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer ${
            !prefersReducedMotion ? 'transition-colors' : ''
          }`}
        >
          <Landmark size={16} />
          <span>gLend</span>
          <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[9px] rounded-full font-bold">
            New
          </span>
        </div>

        <div
          className={`flex items-center justify-between px-3 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer ${
            !prefersReducedMotion ? 'transition-colors' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <Users size={16} />
            <span>User Management</span>
          </div>
          <ChevronDown size={14} className="text-gray-400" />
        </div>

        <div
          className={`flex items-center justify-between px-3 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer ${
            !prefersReducedMotion ? 'transition-colors' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <Settings size={16} />
            <span>Account Settings</span>
          </div>
          <ChevronDown size={14} className="text-gray-400" />
        </div>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-gray-200">
        <div
          className={`flex items-center justify-between px-2 py-2 text-sm text-gray-600 mb-2 cursor-pointer hover:bg-gray-50 rounded-lg ${
            !prefersReducedMotion ? 'transition-colors' : ''
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 text-xs">
              🌐
            </span>
            <span>EN</span>
          </div>
          <ChevronRight size={14} />
        </div>
        <div
          className={`flex items-center justify-between px-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg ${
            !prefersReducedMotion ? 'transition-colors' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
              SE
            </div>
            <span className="text-sm font-medium text-blue-600">Shady Ehab</span>
          </div>
          <LogOut size={14} className="text-gray-400" />
        </div>
      </div>
    </div>
  );
};
