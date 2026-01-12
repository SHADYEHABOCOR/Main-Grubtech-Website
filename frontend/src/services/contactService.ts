import { apiClient, getApiUrl } from '../config/api';
import { SUPPORTED_LANGUAGES } from '../utils/constants';
import type { ContactFormData } from '../types';
import type { ApiResponse } from '../types/api';

// Helper function to remove language prefix from pathname
const getCleanPathname = (): string => {
  const pathname = window.location.pathname;
  // Check if pathname starts with a supported language prefix
  for (const lang of SUPPORTED_LANGUAGES) {
    if (pathname.startsWith(`/${lang}/`)) {
      return pathname.substring(lang.length + 1); // Remove /lang prefix
    }
  }
  return pathname;
};

export const contactService = {
  /**
   * Submit contact form
   */
  async submitContact(data: ContactFormData): Promise<ApiResponse<{ id: string }>> {
    // Transform data to match backend expectations
    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      company: data.company,
      message: data.message,
      form_type: 'contact',
      source_page: getCleanPathname()
    };
    return apiClient.post(getApiUrl('/api/leads'), payload);
  },

  /**
   * Subscribe to newsletter
   */
  async subscribeNewsletter(email: string, language: string): Promise<ApiResponse> {
    return apiClient.post(getApiUrl('/api/leads'), {
      name: 'Newsletter Subscriber',
      email,
      form_type: 'newsletter',
      message: `Newsletter subscription - Language: ${language}`
    });
  },
};
