import { apiClient, API_ENDPOINTS } from '../config/api';
import type { Integration } from '../types';
import type { PaginatedResponse, IntegrationFilters } from '../types/api';

export const integrationsService = {
  /**
   * Get all integrations with filters
   */
  async getIntegrations(filters?: IntegrationFilters): Promise<PaginatedResponse<Integration>> {
    const response = await apiClient.get<PaginatedResponse<Integration>>(API_ENDPOINTS.INTEGRATIONS.BASE, { params: filters });
    return response.data;
  },

  /**
   * Get available integration categories
   */
  async getCategories(): Promise<string[]> {
    const response = await apiClient.get<PaginatedResponse<Integration>>(API_ENDPOINTS.INTEGRATIONS.BASE, {
      params: { status: 'active', limit: 500 }
    });
    const integrations = response.data.data || [];
    // Extract unique categories
    const categories = [...new Set(integrations.map(integration => integration.category))];
    return categories;
  },
};
