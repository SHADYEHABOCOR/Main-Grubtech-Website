import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import type { Career } from '../types/global';

/**
 * Fetch all active job vacancies with caching
 * Uses 10-minute staleTime since careers change infrequently
 */
export const useCareers = () => {
  return useQuery({
    queryKey: ['careers'],
    queryFn: async () => {
      const { data } = await axios.get<Career[]>(API_ENDPOINTS.CAREERS.BASE);
      return data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes - careers change infrequently
  });
};

/**
 * Fetch single career by id
 * Uses 10-minute staleTime since careers change infrequently
 */
export const useCareer = (id: string | number) => {
  return useQuery({
    queryKey: ['career', id],
    queryFn: async () => {
      const { data } = await axios.get<Career>(`${API_ENDPOINTS.CAREERS.BASE}/${id}`);
      return data;
    },
    enabled: !!id, // Only run query if id exists
    staleTime: 1000 * 60 * 10, // 10 minutes - careers change infrequently
  });
};

/**
 * Admin: Fetch all careers (including inactive)
 * Uses 2-minute staleTime for fresher admin data
 */
export const useAdminCareers = (token: string | null) => {
  return useQuery({
    queryKey: ['adminCareers'],
    queryFn: async () => {
      const { data } = await axios.get<Career[]>(API_ENDPOINTS.CAREERS.ADMIN_ALL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
    enabled: !!token, // Only fetch if authenticated
    staleTime: 1000 * 60 * 2, // 2 minutes - admin needs fresher data
  });
};

/**
 * Admin: Delete career mutation
 */
export const useDeleteCareer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, token }: { id: string; token: string }) => {
      const { data } = await axios.delete(API_ENDPOINTS.CAREERS.ADMIN_BY_ID(id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch careers after deletion
      queryClient.invalidateQueries({ queryKey: ['adminCareers'] });
      queryClient.invalidateQueries({ queryKey: ['careers'] });
    },
  });
};
