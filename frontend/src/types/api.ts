// API Response types

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
  statusCode: number;
}

// API Request types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface BlogFilters extends PaginationParams {
  category?: string;
  tag?: string;
  search?: string;
  published?: boolean;
}

export interface TestimonialFilters extends PaginationParams {
  featured?: boolean;
  rating?: number;
}

export interface IntegrationFilters extends PaginationParams {
  category?: string;
  status?: string;
}
