import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Building2, Clock, ChevronRight } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

interface Lead {
  id: number;
  name: string;
  email: string;
  company: string | null;
  form_type: string;
  created_at: string;
}

interface RecentLeadsWidgetProps {
  leads: Lead[];
}

export const RecentLeadsWidget: React.FC<RecentLeadsWidgetProps> = ({ leads }) => {
  const navigate = useNavigate();
  const { isDarkMode } = useAdmin();

  const getFormTypeBadge = (type: string) => {
    const styles: Record<string, { bg: string; text: string }> = {
      demo: {
        bg: isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50',
        text: isDarkMode ? 'text-blue-400' : 'text-blue-600'
      },
      contact: {
        bg: isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50',
        text: isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
      },
      trial: {
        bg: isDarkMode ? 'bg-violet-500/10' : 'bg-violet-50',
        text: isDarkMode ? 'text-violet-400' : 'text-violet-600'
      },
      newsletter: {
        bg: isDarkMode ? 'bg-amber-500/10' : 'bg-amber-50',
        text: isDarkMode ? 'text-amber-400' : 'text-amber-600'
      },
    };
    return styles[type] || {
      bg: isDarkMode ? 'bg-gray-700' : 'bg-gray-100',
      text: isDarkMode ? 'text-gray-300' : 'text-gray-600'
    };
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div
      className={`animate-fade-in-up-fast rounded-2xl p-6 ${
        isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-100'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Recent Leads
          </h3>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Latest form submissions
          </p>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
          isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50'
        }`}>
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-semibold tracking-wide text-emerald-600 uppercase">Live</span>
        </div>
      </div>

      {/* Leads List */}
      <div className="space-y-1">
        {leads.length === 0 ? (
          <div className={`text-center py-12 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            <p className="text-sm">No recent leads</p>
          </div>
        ) : (
          leads.map((lead, index) => {
            const badgeStyle = getFormTypeBadge(lead.form_type);
            return (
              <div
                key={lead.id}
                onClick={() => navigate(`/admin/leads/${lead.id}`)}
                className={`animate-fade-in-left-fast group flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all ${
                  isDarkMode
                    ? 'hover:bg-gray-800'
                    : 'hover:bg-gray-50'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                }`}>
                  <span className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {getInitials(lead.name)}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-medium truncate ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {lead.name}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${badgeStyle.bg} ${badgeStyle.text}`}>
                      {lead.form_type}
                    </span>
                  </div>
                  <div className={`flex items-center gap-3 text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <span className="flex items-center gap-1 truncate">
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      {lead.email}
                    </span>
                    {lead.company && (
                      <span className="hidden sm:flex items-center gap-1 truncate">
                        <Building2 className="w-3 h-3 flex-shrink-0" />
                        {lead.company}
                      </span>
                    )}
                  </div>
                </div>

                {/* Time & Arrow */}
                <div className="flex items-center gap-3">
                  <span className={`flex items-center gap-1 text-xs whitespace-nowrap ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    <Clock className="w-3 h-3" />
                    {getTimeAgo(lead.created_at)}
                  </span>
                  <ChevronRight className={`w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* View All Button */}
      {leads.length > 0 && (
        <button
          onClick={() => navigate('/admin/leads')}
          className={`w-full mt-4 py-3 text-sm font-medium rounded-xl transition-all ${
            isDarkMode
              ? 'text-gray-300 hover:bg-gray-800'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          View all leads
        </button>
      )}
    </div>
  );
};
