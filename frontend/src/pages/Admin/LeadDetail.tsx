import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Building2, Calendar, Tag, Globe, MessageSquare } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

interface Lead {
  id: number;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  restaurant_type: string | null;
  message: string | null;
  form_type: string;
  source_page: string | null;
  created_at: string;
}

export const LeadDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  // const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = `${API_BASE_URL}/api`;

  useEffect(() => {
    if (id) {
      fetchLead();
    }
  }, [id]);

  const fetchLead = async () => {
    try {
      const response = await axios.get(`${API_URL}/leads`, { withCredentials: true });
      const foundLead = response.data.leads?.find((l: Lead) => l.id === parseInt(id || '0'));
      setLead(foundLead || null);
    } catch (error) {
      console.error('Error fetching lead:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFormTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      demo: 'bg-blue-100 text-blue-800',
      contact: 'bg-green-100 text-green-800',
      trial: 'bg-purple-100 text-purple-800',
      newsletter: 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading lead details...</div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="space-y-4 md:space-y-5">
        <div className="flex items-center justify-between">
          <Link
            to="/admin/leads"
            className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 text-xs md:text-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Leads
          </Link>
        </div>
        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-8 md:p-12 text-center border border-gray-200/50 shadow-sm">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Lead Not Found</h2>
          <p className="text-gray-600 mb-4 text-xs md:text-sm">The lead you're looking for doesn't exist.</p>
          <Link
            to="/admin/leads"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all text-xs md:text-sm shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Leads List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/leads"
          className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors text-xs md:text-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Leads
        </Link>
      </div>

      {/* Lead Header Card */}
      <div className="bg-white/50 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 p-4 md:p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary font-bold text-lg md:text-2xl">
                {lead.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900">{lead.name}</h1>
              <p className="text-gray-500 mt-0.5 text-xs md:text-sm">Lead #{lead.id}</p>
              {lead.company && (
                <div className="flex items-center gap-1.5 text-gray-600 mt-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span className="font-medium text-xs md:text-sm">{lead.company}</span>
                </div>
              )}
            </div>
          </div>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getFormTypeBadge(lead.form_type)}`}>
            {lead.form_type.charAt(0).toUpperCase() + lead.form_type.slice(1)}
          </span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
        {/* Left Column - Contact Info */}
        <div className="lg:col-span-2 space-y-4 md:space-y-5">
          {/* Contact Information */}
          <div className="bg-white/50 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 p-4 md:p-6 hover:shadow-md transition-shadow">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3">Contact Information</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 p-2.5 md:p-3 bg-gray-50/50 rounded-lg">
                <Mail className="w-4 h-4 md:w-5 md:h-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs md:text-sm text-gray-600 mb-0.5">Email Address</div>
                  <a
                    href={`mailto:${lead.email}`}
                    className="text-gray-900 font-medium hover:text-primary transition-colors break-all text-xs md:text-sm"
                  >
                    {lead.email}
                  </a>
                </div>
              </div>

              {lead.phone && (
                <div className="flex items-start gap-2.5 p-2.5 md:p-3 bg-gray-50/50 rounded-lg">
                  <Phone className="w-4 h-4 md:w-5 md:h-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-xs md:text-sm text-gray-600 mb-0.5">Phone Number</div>
                    <a
                      href={`tel:${lead.phone}`}
                      className="text-gray-900 font-medium hover:text-green-600 transition-colors text-xs md:text-sm"
                    >
                      {lead.phone}
                    </a>
                  </div>
                </div>
              )}

              {lead.company && (
                <div className="flex items-start gap-2.5 p-2.5 md:p-3 bg-gray-50/50 rounded-lg">
                  <Building2 className="w-4 h-4 md:w-5 md:h-5 text-gray-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-xs md:text-sm text-gray-600 mb-0.5">Company Name</div>
                    <div className="text-gray-900 font-medium text-xs md:text-sm">{lead.company}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-4 pt-4 border-t border-gray-200/50">
              <div className="flex flex-wrap gap-2">
                <a
                  href={`mailto:${lead.email}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all text-xs md:text-sm shadow-sm hover:shadow-md"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Send Email
                </a>
                {lead.phone && (
                  <a
                    href={`tel:${lead.phone}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-xs md:text-sm shadow-sm hover:shadow-md"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call Now
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Message */}
          {lead.message && (
            <div className="bg-white/50 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 p-4 md:p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-1.5 mb-3">
                <MessageSquare className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">Message</h2>
              </div>
              <div className="bg-gray-50/50 rounded-lg p-3 md:p-4">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-xs md:text-sm">{lead.message}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Metadata */}
        <div className="space-y-4 md:space-y-5">
          {/* Lead Details */}
          <div className="bg-white/50 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 p-4 md:p-6 hover:shadow-md transition-shadow">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3">Lead Details</h2>
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs md:text-sm text-gray-600 mb-1">
                  <Tag className="w-3.5 h-3.5" />
                  Form Type
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getFormTypeBadge(lead.form_type)}`}>
                  {lead.form_type.charAt(0).toUpperCase() + lead.form_type.slice(1)}
                </span>
              </div>

              {lead.restaurant_type && (
                <div>
                  <div className="text-xs md:text-sm text-gray-600 mb-0.5">Restaurant Type</div>
                  <div className="text-gray-900 font-medium text-xs md:text-sm">{lead.restaurant_type}</div>
                </div>
              )}

              <div className="pt-3 border-t border-gray-200/50">
                <div className="flex items-center gap-1.5 text-xs md:text-sm text-gray-600 mb-0.5">
                  <Globe className="w-3.5 h-3.5" />
                  Source Page
                </div>
                <div className="text-gray-900 font-medium text-xs md:text-sm">{lead.source_page || 'Direct / Unknown'}</div>
              </div>

              <div className="pt-3 border-t border-gray-200/50">
                <div className="flex items-center gap-1.5 text-xs md:text-sm text-gray-600 mb-0.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Submission Date
                </div>
                <div className="text-gray-900 font-medium text-xs md:text-sm">
                  {new Date(lead.created_at).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {new Date(lead.created_at).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200/50">
                <div className="text-xs md:text-sm text-gray-600 mb-0.5">Time Since Submission</div>
                <div className="text-gray-900 font-medium text-xs md:text-sm">
                  {getTimeSince(new Date(lead.created_at))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get time since submission
function getTimeSince(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
}
