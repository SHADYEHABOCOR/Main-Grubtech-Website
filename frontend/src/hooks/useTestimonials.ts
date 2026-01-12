import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { testimonialsService } from '../services/testimonialsService';
import { API_ENDPOINTS } from '../config/api';
import type { TestimonialFilters } from '../types/api';
import type { Testimonial } from '../types';

/**
 * Fetch testimonials with pagination and filters
 * Uses 10-minute staleTime since testimonials rarely change
 */
export const useTestimonials = (filters?: TestimonialFilters) => {
  const { i18n } = useTranslation();

  return useQuery({
    queryKey: ['testimonials', i18n.language, filters],
    queryFn: () => testimonialsService.getTestimonials(filters),
    staleTime: 1000 * 60 * 10, // 10 minutes - testimonials change rarely
  });
};

/**
 * Fetch single testimonial by id
 * Uses 10-minute staleTime since testimonials rarely change
 */
export const useTestimonial = (id: string | number) => {
  return useQuery({
    queryKey: ['testimonial', id],
    queryFn: async () => {
      const { data } = await axios.get<Testimonial>(`${API_ENDPOINTS.TESTIMONIALS.BASE}/${id}`);
      return data;
    },
    enabled: !!id, // Only run query if id exists
    staleTime: 1000 * 60 * 10, // 10 minutes - testimonials change rarely
  });
};

/**
 * Fetch featured testimonials for homepage carousel
 * Uses 10-minute staleTime since testimonials rarely change
 */
export const useFeaturedTestimonials = (limit: number = 10) => {
  const { i18n } = useTranslation();

  return useQuery({
    queryKey: ['testimonials', 'featured', i18n.language, limit],
    queryFn: () => testimonialsService.getFeaturedTestimonials(limit),
    staleTime: 1000 * 60 * 10, // 10 minutes - testimonials change rarely
  });
};

/**
 * Admin: Fetch all testimonials (including inactive)
 * Uses 2-minute staleTime for fresher admin data
 */
export const useAdminTestimonials = (token: string | null) => {
  return useQuery({
    queryKey: ['adminTestimonials'],
    queryFn: async () => {
      const { data } = await axios.get<Testimonial[]>(API_ENDPOINTS.TESTIMONIALS.ADMIN_ALL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
    enabled: !!token, // Only fetch if authenticated
    staleTime: 1000 * 60 * 2, // 2 minutes - admin needs fresher data
  });
};

/**
 * Admin: Delete testimonial mutation
 */
export const useDeleteTestimonial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, token }: { id: string; token: string }) => {
      const { data } = await axios.delete(API_ENDPOINTS.TESTIMONIALS.ADMIN_BY_ID(id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch testimonials after deletion
      queryClient.invalidateQueries({ queryKey: ['adminTestimonials'] });
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
  });
};
