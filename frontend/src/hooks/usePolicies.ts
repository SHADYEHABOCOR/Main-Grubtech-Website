import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../config/api';
import type { Policy } from '../types/global';

/**
 * Fetch all published policy pages with caching and language support
 * Uses 10-minute staleTime since policy content changes infrequently
 */
export const usePolicies = () => {
  const { i18n } = useTranslation();

  return useQuery({
    queryKey: ['policies', i18n.language],
    queryFn: async () => {
      const { data } = await axios.get<{ data: Policy[] }>(
        `${API_ENDPOINTS.POLICIES.BASE}?lang=${i18n.language}`
      );
      return data.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes - policy content changes infrequently
  });
};

/**
 * Fetch single policy page by slug with language support
 * Uses 10-minute staleTime since policy content changes infrequently
 */
export const usePolicy = (slug: string) => {
  const { i18n } = useTranslation();

  return useQuery({
    queryKey: ['policy', slug, i18n.language],
    queryFn: async () => {
      const { data } = await axios.get<Policy>(
        `${API_ENDPOINTS.POLICIES.BASE}/${slug}?lang=${i18n.language}`
      );
      return data;
    },
    enabled: !!slug, // Only run query if slug exists
    staleTime: 1000 * 60 * 10, // 10 minutes - policy content changes infrequently
  });
};

/**
 * Admin: Fetch all policies (including drafts)
 * Uses 2-minute staleTime for fresher admin data
 */
export const useAdminPolicies = (token: string | null) => {
  return useQuery({
    queryKey: ['adminPolicies'],
    queryFn: async () => {
      const { data } = await axios.get<Policy[]>(API_ENDPOINTS.POLICIES.ADMIN_ALL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
    enabled: !!token, // Only fetch if authenticated
    staleTime: 1000 * 60 * 2, // 2 minutes - admin needs fresher data
  });
};

/**
 * Admin: Delete policy mutation
 */
export const useDeletePolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, token }: { id: string; token: string }) => {
      const { data } = await axios.delete(API_ENDPOINTS.POLICIES.ADMIN_BY_ID(id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch policies after deletion
      queryClient.invalidateQueries({ queryKey: ['adminPolicies'] });
      queryClient.invalidateQueries({ queryKey: ['policies'] });
    },
  });
};
