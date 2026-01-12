import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../config/api';
import { VideoData } from '../utils/videoHelpers';

export const useVideos = () => {
  const { i18n } = useTranslation();

  // Note: Inherits 5-minute staleTime from global queryClient config
  // Videos are relatively static so the default is appropriate
  return useQuery({
    queryKey: ['videos', i18n.language],
    queryFn: async () => {
      const response = await axios.get<VideoData[]>(`${API_ENDPOINTS.VIDEO_GALLERIES.BASE}?lang=${i18n.language}`);
      return response.data;
    },
  });
};

/**
 * Fetch single video by id
 * Uses 10-minute staleTime since videos change rarely
 */
export const useVideo = (id: string | number) => {
  return useQuery({
    queryKey: ['video', id],
    queryFn: async () => {
      const { data } = await axios.get<VideoData>(`${API_ENDPOINTS.VIDEO_GALLERIES.BASE}/${id}`);
      return data;
    },
    enabled: !!id, // Only run query if id exists
    staleTime: 1000 * 60 * 10, // 10 minutes - videos change rarely
  });
};

/**
 * Admin: Fetch all videos (including inactive)
 * Uses 2-minute staleTime for fresher admin data
 */
export const useAdminVideos = (token: string | null) => {
  return useQuery({
    queryKey: ['adminVideos'],
    queryFn: async () => {
      const { data } = await axios.get<VideoData[]>(API_ENDPOINTS.VIDEO_GALLERIES.ADMIN, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
    enabled: !!token, // Only fetch if authenticated
    staleTime: 1000 * 60 * 2, // 2 minutes - admin needs fresher data
  });
};

/**
 * Admin: Delete video mutation
 */
export const useDeleteVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, token }: { id: string; token: string }) => {
      const { data } = await axios.delete(API_ENDPOINTS.VIDEO_GALLERIES.ADMIN_BY_ID(id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch videos after deletion
      queryClient.invalidateQueries({ queryKey: ['adminVideos'] });
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
  });
};
