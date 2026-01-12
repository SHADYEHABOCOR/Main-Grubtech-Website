import { apiClient, API_ENDPOINTS } from '../config/api';
import type { Testimonial } from '../types';
import type { PaginatedResponse, TestimonialFilters } from '../types/api';
import i18n from '../i18n/config';

export const testimonialsService = {
  /**
   * Get all testimonials with pagination and filters
   */
  async getTestimonials(filters?: TestimonialFilters): Promise<PaginatedResponse<Testimonial>> {
    const response = await apiClient.get<PaginatedResponse<Testimonial>>(API_ENDPOINTS.TESTIMONIALS.BASE, {
      params: { ...filters, lang: i18n.language }
    });
    return response.data;
  },

  /**
   * Get featured testimonials
   */
  async getFeaturedTestimonials(limit: number = 3): Promise<PaginatedResponse<Testimonial>> {
    const response = await apiClient.get<PaginatedResponse<Testimonial>>(API_ENDPOINTS.TESTIMONIALS.BASE, {
      params: { featured: true, limit, lang: i18n.language }
    });
    return response.data;
  },
};
