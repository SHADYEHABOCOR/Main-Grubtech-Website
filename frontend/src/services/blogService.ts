import { apiClient, API_ENDPOINTS, getApiUrl } from '../config/api';
import type { BlogPost } from '../types';
import type { ApiResponse, PaginatedResponse, BlogFilters } from '../types/api';

export const blogService = {
  /**
   * Get all blog posts with pagination and filters
   */
  async getPosts(filters?: BlogFilters): Promise<PaginatedResponse<BlogPost>> {
    const response = await apiClient.get<PaginatedResponse<BlogPost>>(API_ENDPOINTS.BLOG.BASE, { params: filters });
    return response.data;
  },

  /**
   * Get single blog post by slug
   */
  async getPostBySlug(slug: string): Promise<ApiResponse<BlogPost>> {
    const response = await apiClient.get<ApiResponse<BlogPost>>(getApiUrl(`/api/blog/${slug}`));
    return response.data;
  },

  /**
   * Get featured blog posts
   */
  async getFeaturedPosts(limit: number = 3): Promise<PaginatedResponse<BlogPost>> {
    const response = await apiClient.get<PaginatedResponse<BlogPost>>(API_ENDPOINTS.BLOG.BASE, { params: { featured: true, limit } });
    return response.data;
  },
};
