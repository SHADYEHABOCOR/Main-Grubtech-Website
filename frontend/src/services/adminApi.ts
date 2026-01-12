import axios from 'axios';
import { apiClient, getApiUrl } from '../config/api';

const API_BASE = getApiUrl('/api');

// Use the shared apiClient which includes automatic token refresh
const authClient = apiClient;

// Blog API
export const blogApi = {
  getAll: async () => {
    const response = await authClient.get(`${API_BASE}/blog/admin/all`);
    return response.data;
  },

  getOne: async (slug: string) => {
    const response = await axios.get(`${API_BASE}/blog/${slug}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await authClient.get(`${API_BASE}/blog/admin/${id}`);
    return response.data;
  },

  create: async (data: FormData) => {
    const response = await authClient.post(`${API_BASE}/blog/admin/create`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  update: async (id: string, data: FormData) => {
    const response = await authClient.put(`${API_BASE}/blog/admin/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await authClient.delete(`${API_BASE}/blog/admin/${id}`);
    return response.data;
  },
};

// Testimonials API
export const testimonialsApi = {
  getAll: async () => {
    const response = await axios.get(`${API_BASE}/testimonials`);
    // Handle paginated response format
    return response.data.data || response.data;
  },

  getById: async (id: string) => {
    const response = await authClient.get(`${API_BASE}/testimonials/admin/${id}`);
    return response.data;
  },

  create: async (data: FormData) => {
    const response = await authClient.post(`${API_BASE}/testimonials/admin/create`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  update: async (id: string, data: FormData) => {
    const response = await authClient.put(`${API_BASE}/testimonials/admin/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await authClient.delete(`${API_BASE}/testimonials/admin/${id}`);
    return response.data;
  },
};

// Website Content API
export const contentApi = {
  getAll: async () => {
    const response = await axios.get(`${API_BASE}/content`);
    return response.data;
  },

  getAllAdmin: async () => {
    const response = await authClient.get(`${API_BASE}/content/admin/all`);
    return response.data;
  },

  getSection: async (section: string) => {
    const response = await axios.get(`${API_BASE}/content/${section}`);
    return response.data;
  },

  updateSection: async (section: string, data: Record<string, unknown>) => {
    const response = await authClient.put(`${API_BASE}/content/admin/${section}`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  },
};

// Settings API
export const settingsApi = {
  get: async () => {
    const response = await authClient.get(`${API_BASE}/settings`);
    return response.data;
  },

  update: async (data: Record<string, unknown>) => {
    const response = await authClient.put(`${API_BASE}/settings`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  },
};

// Team API (placeholder for future use)
export const teamApi = {
  getAll: async () => {
    const response = await authClient.get(`${API_BASE}/team`);
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await authClient.get(`${API_BASE}/team/${id}`);
    return response.data;
  },

  create: async (data: Record<string, unknown>) => {
    const response = await authClient.post(`${API_BASE}/team`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  },

  update: async (id: string, data: Record<string, unknown>) => {
    const response = await authClient.put(`${API_BASE}/team/${id}`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await authClient.delete(`${API_BASE}/team/${id}`);
    return response.data;
  },
};

// Careers API
export const careersApi = {
  getAll: async () => {
    const response = await authClient.get(`${API_BASE}/careers/admin/all`);
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await axios.get(`${API_BASE}/careers/${id}`);
    return response.data;
  },

  create: async (data: Record<string, unknown>) => {
    const response = await authClient.post(`${API_BASE}/careers/admin/create`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  },

  update: async (id: string, data: Record<string, unknown>) => {
    const response = await authClient.put(`${API_BASE}/careers/admin/${id}`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await authClient.delete(`${API_BASE}/careers/admin/${id}`);
    return response.data;
  },
};

// Integrations API
export const integrationsApi = {
  getAll: async () => {
    // PERF: Reduced from 200 to 50 to minimize HTTP requests
    const response = await axios.get(`${API_BASE}/integrations?limit=50`);
    // Handle paginated response format
    return response.data.data || response.data;
  },

  getById: async (id: string) => {
    const response = await axios.get(`${API_BASE}/integrations/${id}`);
    return response.data;
  },

  create: async (data: FormData) => {
    const response = await authClient.post(`${API_BASE}/integrations`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  update: async (id: string, data: FormData) => {
    const response = await authClient.put(`${API_BASE}/integrations/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await authClient.delete(`${API_BASE}/integrations/${id}`);
    return response.data;
  },
};

// Video Galleries API
export const videoGalleriesApi = {
  getAll: async () => {
    const response = await authClient.get(`${API_BASE}/video-galleries/admin`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await authClient.get(`${API_BASE}/video-galleries/admin/${id}`);
    return response.data;
  },

  create: async (data: Record<string, unknown>) => {
    const response = await authClient.post(`${API_BASE}/video-galleries/admin/create`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  },

  update: async (id: string, data: Record<string, unknown>) => {
    const response = await authClient.put(`${API_BASE}/video-galleries/admin/${id}`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await authClient.delete(`${API_BASE}/video-galleries/admin/${id}`);
    return response.data;
  },
};

// Policies API
export const policiesApi = {
  getAll: async () => {
    const response = await authClient.get(`${API_BASE}/policies/admin/all`);
    return response.data.data || response.data;
  },

  getById: async (id: string) => {
    const response = await authClient.get(`${API_BASE}/policies/admin/${id}`);
    return response.data;
  },

  create: async (data: Record<string, unknown>) => {
    const response = await authClient.post(`${API_BASE}/policies/admin`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  },

  update: async (id: string, data: Record<string, unknown>) => {
    const response = await authClient.put(`${API_BASE}/policies/admin/${id}`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await authClient.delete(`${API_BASE}/policies/admin/${id}`);
    return response.data;
  },
};

// Image Upload API
export interface UploadedImage {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  paths: {
    original: string;
    webp: string;
    sizes: Record<string, { original: string; webp: string }>;
  };
}

export const uploadsApi = {
  /**
   * Upload a single image with automatic optimization
   * - Compresses to JPEG and WebP
   * - Generates responsive sizes (large, medium, small, thumbnail)
   * - Creates square thumbnail for avatars
   */
  uploadImage: async (file: File, quality: number = 85): Promise<UploadedImage> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('quality', quality.toString());

    const response = await authClient.post(`${API_BASE}/uploads/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  },

  /**
   * Upload multiple images at once (max 10)
   */
  uploadImages: async (files: File[], quality: number = 85): Promise<UploadedImage[]> => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    formData.append('quality', quality.toString());

    const response = await authClient.post(`${API_BASE}/uploads/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  },

  /**
   * Delete an image and all its variants
   */
  deleteImage: async (filename: string): Promise<void> => {
    await authClient.delete(`${API_BASE}/uploads/image/${filename}`);
  },

  /**
   * List all uploaded images
   */
  listImages: async (): Promise<Record<string, { original?: string; webp?: string; sizes: string[] }>> => {
    const response = await authClient.get(`${API_BASE}/uploads/images`);
    return response.data.data;
  },
};

// Admin API (for admin panel components)
export const adminApi = {
  // Website Content methods
  getWebsiteContent: async () => {
    const response = await authClient.get(`${API_BASE}/content/admin/all`);
    return response.data;
  },

  updateWebsiteContent: async (section: string, data: Record<string, unknown>) => {
    const response = await authClient.put(`${API_BASE}/content/admin/${section}`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  },
};
