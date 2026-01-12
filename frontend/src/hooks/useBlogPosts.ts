import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { getApiUrl } from '../config/api';

interface BlogPost {
  id: number;
  slug: string;
  title_en: string;
  content_en: string;
  featured_image: string | null;
  status: string;
  created_at: string;
}

const API_BASE = getApiUrl('/api');

/**
 * Fetch all blog posts with caching
 * Uses 10-minute staleTime since blog content changes infrequently
 */
export const useBlogPosts = () => {
  return useQuery({
    queryKey: ['blogPosts'],
    queryFn: async () => {
      const { data } = await axios.get<BlogPost[]>(`${API_BASE}/blog`);
      return data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes - blog content changes infrequently
  });
};

/**
 * Fetch single blog post by slug
 * Uses 10-minute staleTime since blog content changes infrequently
 */
export const useBlogPost = (slug: string) => {
  return useQuery({
    queryKey: ['blogPost', slug],
    queryFn: async () => {
      const { data } = await axios.get<BlogPost>(`${API_BASE}/blog/${slug}`);
      return data;
    },
    enabled: !!slug, // Only run query if slug exists
    staleTime: 1000 * 60 * 10, // 10 minutes - blog content changes infrequently
  });
};

/**
 * Admin: Fetch all blog posts (including drafts)
 * Uses 2-minute staleTime for fresher admin data
 */
export const useAdminBlogPosts = (token: string | null) => {
  return useQuery({
    queryKey: ['adminBlogPosts'],
    queryFn: async () => {
      const { data } = await axios.get<BlogPost[]>(`${API_BASE}/blog/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
    enabled: !!token, // Only fetch if authenticated
    staleTime: 1000 * 60 * 2, // 2 minutes - admin needs fresher data
  });
};

/**
 * Admin: Delete blog post mutation
 */
export const useDeleteBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, token }: { id: string; token: string }) => {
      const { data } = await axios.delete(`${API_BASE}/blog/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch blog posts after deletion
      queryClient.invalidateQueries({ queryKey: ['adminBlogPosts'] });
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
    },
  });
};
