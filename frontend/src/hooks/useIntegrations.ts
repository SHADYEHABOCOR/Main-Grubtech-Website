import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { integrationsService } from '../services/integrationsService';
import { API_ENDPOINTS } from '../config/api';
import type { IntegrationFilters } from '../types/api';
import type { Integration } from '../types';

/**
 * Fetch integrations with category filters
 * Uses 15-minute staleTime since integrations change very rarely
 */
export const useIntegrations = (filters?: IntegrationFilters) => {
  const { i18n } = useTranslation();

  return useQuery({
    queryKey: ['integrations', i18n.language, filters],
    queryFn: () => integrationsService.getIntegrations(filters),
    staleTime: 1000 * 60 * 15, // 15 minutes - integrations change very rarely
  });
};

/**
 * Fetch single integration by id
 * Uses 10-minute staleTime since integrations change rarely
 */
export const useIntegration = (id: string | number) => {
  return useQuery({
    queryKey: ['integration', id],
    queryFn: async () => {
      const { data } = await axios.get<Integration>(API_ENDPOINTS.INTEGRATIONS.BY_ID(String(id)));
      return data;
    },
    enabled: !!id, // Only run query if id exists
    staleTime: 1000 * 60 * 10, // 10 minutes - integrations change rarely
  });
};

/**
 * Fetch available integration categories
 * Uses 15-minute staleTime since categories change very rarely
 */
export const useIntegrationCategories = () => {
  const { i18n } = useTranslation();

  return useQuery({
    queryKey: ['integrations', 'categories', i18n.language],
    queryFn: () => integrationsService.getCategories(),
    staleTime: 1000 * 60 * 15, // 15 minutes - categories change very rarely
  });
};

/**
 * Admin: Fetch all integrations (including inactive)
 * Uses 2-minute staleTime for fresher admin data
 */
export const useAdminIntegrations = (token: string | null) => {
  return useQuery({
    queryKey: ['adminIntegrations'],
    queryFn: async () => {
      const { data } = await axios.get<Integration[]>(API_ENDPOINTS.INTEGRATIONS.ADMIN_ALL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
    enabled: !!token, // Only fetch if authenticated
    staleTime: 1000 * 60 * 2, // 2 minutes - admin needs fresher data
  });
};

/**
 * Admin: Delete integration mutation
 */
export const useDeleteIntegration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, token }: { id: string; token: string }) => {
      const { data } = await axios.delete(API_ENDPOINTS.INTEGRATIONS.ADMIN_BY_ID(id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch integrations after deletion
      queryClient.invalidateQueries({ queryKey: ['adminIntegrations'] });
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });
};
