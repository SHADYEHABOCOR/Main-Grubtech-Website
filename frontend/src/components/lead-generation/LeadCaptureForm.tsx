import React, { useState } from 'react';
import { Send, Check, AlertCircle } from 'lucide-react';
import { analytics } from '../../utils/analytics/analytics';
import { RequiredFieldsLegend } from '../ui/RequiredFieldsLegend';

interface LeadCaptureFormProps {
  formType?: 'demo' | 'contact' | 'newsletter' | 'trial';
  title?: string;
  subtitle?: string;
  onSuccess?: () => void;
}

interface FormData {
  name: string;
  email: string;
  company: string;
  phone: string;
  restaurantType: string;
  message: string;
}

export const LeadCaptureForm: React.FC<LeadCaptureFormProps> = ({
  formType = 'contact',
  title,
  subtitle,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    phone: '',
    restaurantType: '',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    // Track form start
    analytics.track('contact_form_start', {
      form_type: formType,
    });

    try {
      // Send to your backend API
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          formType,
          source: window.location.pathname,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      // Track successful submission
      analytics.trackFormSubmit(formType, {
        restaurant_type: formData.restaurantType,
        has_company: !!formData.company,
      });

      analytics.track('lead_captured', {
        form_type: formType,
        source_page: window.location.pathname,
      });

      // Send to webhook if configured (Slack/Discord notification)
      const webhookUrl = import.meta.env.VITE_LEAD_WEBHOOK_URL;
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: `🎯 New Lead Captured!\n\nName: ${formData.name}\nEmail: ${formData.email}\nCompany: ${formData.company}\nType: ${formData.restaurantType}\nForm: ${formType}\nPage: ${window.location.pathname}`,
          }),
        }).catch(console.error);
      }

      setStatus('success');
      onSuccess?.();

      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          company: '',
          phone: '',
          restaurantType: '',
          message: '',
        });
        setStatus('idle');
      }, 3000);

    } catch (error) {
      console.error('Form submission error:', error);
      setStatus('error');
      setErrorMessage('Something went wrong. Please try again.');

      setTimeout(() => {
        setStatus('idle');
        setErrorMessage('');
      }, 5000);
    }
  };

  const restaurantTypes = [
    'Independent Restaurant',
    'Small Chain (2-10 locations)',
    'Regional Chain (11-50 locations)',
    'Global Chain (50+ locations)',
    'Dark Kitchen / Cloud Kitchen',
    'Franchise',
    'Other',
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-border-light">
      {title && (
        <div className="mb-6">
          <h3 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
            {title}
          </h3>
          {subtitle && (
            <p className="text-text-secondary">{subtitle}</p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <RequiredFieldsLegend />
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-border-light rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="John Doe"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-border-light rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="john@restaurant.com"
          />
        </div>

        {/* Company */}
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-text-primary mb-2">
            Company / Restaurant Name *
          </label>
          <input
            type="text"
            id="company"
            name="company"
            required
            value={formData.company}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-border-light rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Your Restaurant"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-text-primary mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-border-light rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="+1 (555) 123-4567"
          />
        </div>

        {/* Restaurant Type */}
        <div>
          <label htmlFor="restaurantType" className="block text-sm font-medium text-text-primary mb-2">
            Restaurant Type *
          </label>
          <select
            id="restaurantType"
            name="restaurantType"
            required
            value={formData.restaurantType}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-border-light rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
          >
            <option value="">Select type...</option>
            {restaurantTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-text-primary mb-2">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-border-light rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
            placeholder="Tell us about your needs..."
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={status === 'submitting' || status === 'success'}
          className={`w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-semibold text-white transition-all duration-300 ${
            status === 'success'
              ? 'bg-green-600'
              : status === 'error'
              ? 'bg-red-600'
              : 'bg-primary hover:bg-primary-dark'
          } disabled:opacity-50 disabled:cursor-not-allowed ${
            status === 'idle' || status === 'error'
              ? 'hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200 ease-out'
              : ''
          }`}
        >
          {status === 'submitting' && (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Sending...</span>
            </>
          )}
          {status === 'success' && (
            <>
              <Check className="w-5 h-5" />
              <span>Sent Successfully!</span>
            </>
          )}
          {status === 'error' && (
            <>
              <AlertCircle className="w-5 h-5" />
              <span>Error - Try Again</span>
            </>
          )}
          {status === 'idle' && (
            <>
              <Send className="w-5 h-5" />
              <span>Send Message</span>
            </>
          )}
        </button>

        {errorMessage && (
          <p className="text-red-600 text-sm text-center">{errorMessage}</p>
        )}
      </form>
    </div>
  );
};
