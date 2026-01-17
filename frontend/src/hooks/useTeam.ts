import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import type { TeamMember } from '../types/index';

/**
 * Fetch all team members with caching
 * Uses 10-minute staleTime since team changes infrequently
 */
export const useTeam = () => {
  return useQuery({
    queryKey: ['team'],
    queryFn: async () => {
      const { data } = await axios.get<TeamMember[]>(API_ENDPOINTS.TEAM.BASE);
      return data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes - team changes infrequently
  });
};

/**
 * Fetch single team member by id
 * Uses 10-minute staleTime since team changes infrequently
 */
export const useTeamMember = (id: string | number) => {
  return useQuery({
    queryKey: ['teamMember', id],
    queryFn: async () => {
      const { data } = await axios.get<TeamMember>(`${API_ENDPOINTS.TEAM.BASE}/${id}`);
      return data;
    },
    enabled: !!id, // Only run query if id exists
    staleTime: 1000 * 60 * 10, // 10 minutes - team changes infrequently
  });
};

/**
 * Admin: Fetch all team members (including inactive)
 * Uses 2-minute staleTime for fresher admin data
 */
export const useAdminTeam = (token: string | null) => {
  return useQuery({
    queryKey: ['adminTeam'],
    queryFn: async () => {
      const { data } = await axios.get<TeamMember[]>(API_ENDPOINTS.TEAM.ADMIN_ALL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
    enabled: !!token, // Only fetch if authenticated
    staleTime: 1000 * 60 * 2, // 2 minutes - admin needs fresher data
  });
};

/**
 * Admin: Delete team member mutation
 */
export const useDeleteTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, token }: { id: string; token: string }) => {
      const { data } = await axios.delete(API_ENDPOINTS.TEAM.ADMIN_BY_ID(id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch team after deletion
      queryClient.invalidateQueries({ queryKey: ['adminTeam'] });
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
  });
};
