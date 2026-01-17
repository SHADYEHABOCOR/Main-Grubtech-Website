import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// API Configuration
// This file centralizes all API configuration to make it easy to switch between environments

/**
 * Get the base API URL from environment variables
 * Falls back to localhost for development
 */
export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/api$/, '');

// Timeout configuration (30 seconds max as per security requirements)
const DEFAULT_TIMEOUT = 30000; // 30 seconds

// Set global axios defaults for any direct axios usage
// This ensures consistent timeout behavior across the app
axios.defaults.timeout = DEFAULT_TIMEOUT;

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 30000; // 30 seconds

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

// Rate limit event handler type
type RateLimitHandler = (info: RateLimitInfo) => void;
let rateLimitHandler: RateLimitHandler | null = null;

/**
 * Rate limit information extracted from 429 responses
 */
export interface RateLimitInfo {
  retryAfter: number; // seconds until rate limit resets
  message: string;
  endpoint: string;
}

/**
 * API error response data structure
 */
interface ApiErrorData {
  code?: string;
  message?: string;
}

/**
 * Set the global rate limit handler
 * This should be called once from the App component
 */
export function setRateLimitHandler(handler: RateLimitHandler | null): void {
  rateLimitHandler = handler;
}

/**
 * Parse rate limit headers from response
 */
function parseRateLimitInfo(error: AxiosError): RateLimitInfo {
  const headers = error.response?.headers;
  const data = error.response?.data as { message?: string } | undefined;

  // Try to get retry-after from headers (standard header)
  let retryAfter = 60; // default to 60 seconds

  if (headers?.['retry-after']) {
    retryAfter = parseInt(headers['retry-after'], 10) || 60;
  } else if (headers?.['ratelimit-reset']) {
    // Some APIs use ratelimit-reset as a timestamp
    const resetTime = parseInt(headers['ratelimit-reset'], 10);
    if (resetTime > Date.now() / 1000) {
      retryAfter = Math.ceil(resetTime - Date.now() / 1000);
    }
  }

  return {
    retryAfter,
    message: data?.message || 'Too many requests. Please try again later.',
    endpoint: error.config?.url || 'unknown',
  };
}

const processQueue = (error: Error | null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

/**
 * Determine if a request should be retried based on the error
 */
function shouldRetryRequest(error: AxiosError, retryCount: number): boolean {
  // Don't retry if we've exceeded max retries
  if (retryCount >= MAX_RETRIES) return false;

  const status = error.response?.status;

  // Don't retry 4xx client errors (except 408 timeout and 429 rate limit)
  if (status && status >= 400 && status < 500 && status !== 408 && status !== 429) {
    return false;
  }

  // Retry on server errors (5xx)
  if (status && status >= 500) {
    return true;
  }

  // Retry on timeout (408)
  if (status === 408) {
    return true;
  }

  // Retry on rate limit (429) with the retry-after delay
  if (status === 429) {
    return true;
  }

  // Retry on network errors
  if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || !error.response) {
    return true;
  }

  return false;
}

/**
 * Calculate delay for retry with exponential backoff
 */
function calculateRetryDelay(error: AxiosError, retryCount: number): number {
  // For rate limiting, use retry-after header if available
  if (error.response?.status === 429) {
    const retryAfter = error.response.headers?.['retry-after'];
    if (retryAfter) {
      const seconds = parseInt(retryAfter, 10);
      if (!isNaN(seconds)) {
        // Add small jitter to prevent thundering herd
        return seconds * 1000 + Math.random() * 1000;
      }
    }
  }

  // Exponential backoff with jitter
  const delay = Math.min(RETRY_BASE_DELAY * Math.pow(2, retryCount), MAX_RETRY_DELAY);
  const jitter = Math.random() * 500; // 0-500ms jitter

  return delay + jitter;
}

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Extended request config with retry metadata
interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _retryCount?: number;
  _isRetrying?: boolean;
}

/**
 * Axios instance configured for API calls with httpOnly cookie support
 * - withCredentials: true enables sending/receiving cookies cross-origin
 * - Includes automatic token refresh on 401 errors
 * - Includes automatic retry with exponential backoff for transient failures
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Required for httpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: DEFAULT_TIMEOUT,
});

// Response interceptor to handle retries, token refresh, and rate limiting
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Initialize retry count
    const retryCount = originalRequest._retryCount || 0;

    // Handle rate limiting (429 Too Many Requests)
    if (error.response?.status === 429) {
      const rateLimitInfo = parseRateLimitInfo(error);

      // Notify the app about rate limiting (only on first occurrence, not retries)
      if (rateLimitHandler && !originalRequest._isRetrying) {
        rateLimitHandler(rateLimitInfo);
      }

      // If we should retry rate-limited requests
      if (shouldRetryRequest(error, retryCount)) {
        const delay = calculateRetryDelay(error, retryCount);
        console.log(`Rate limited. Retrying in ${Math.round(delay / 1000)}s... (attempt ${retryCount + 1}/${MAX_RETRIES})`);

        await sleep(delay);

        originalRequest._retryCount = retryCount + 1;
        originalRequest._isRetrying = true;

        return apiClient(originalRequest);
      }

      // Reject with enhanced error information
      const enhancedError = new Error(rateLimitInfo.message) as Error & {
        isRateLimited: boolean;
        retryAfter: number;
        originalError: AxiosError;
      };
      enhancedError.isRateLimited = true;
      enhancedError.retryAfter = rateLimitInfo.retryAfter;
      enhancedError.originalError = error;

      return Promise.reject(enhancedError);
    }

    // Handle retryable errors (5xx, network errors, timeouts)
    if (shouldRetryRequest(error, retryCount) && !originalRequest._isRetrying) {
      const delay = calculateRetryDelay(error, retryCount);
      const errorType = error.response?.status
        ? `HTTP ${error.response.status}`
        : (error.code || 'Network error');

      console.log(`${errorType}. Retrying in ${Math.round(delay / 1000)}s... (attempt ${retryCount + 1}/${MAX_RETRIES})`);

      await sleep(delay);

      originalRequest._retryCount = retryCount + 1;
      originalRequest._isRetrying = true;

      return apiClient(originalRequest);
    }

    // Reset retry flag after handling retries
    originalRequest._isRetrying = false;

    // Check if this is a 401 error with TOKEN_EXPIRED code
    const errorData = error.response?.data as ApiErrorData | undefined;
    const isTokenExpired =
      error.response?.status === 401 &&
      errorData?.code === 'TOKEN_EXPIRED';

    // Don't retry token refresh if:
    // - Not a token expired error
    // - Already retried this request for token refresh
    // - This is the refresh endpoint itself
    if (
      !isTokenExpired ||
      originalRequest._retry ||
      originalRequest.url?.includes('/api/auth/refresh') ||
      originalRequest.url?.includes('/api/auth/login')
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // If already refreshing, queue this request
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => apiClient(originalRequest))
        .catch(err => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Attempt to refresh the token
      await apiClient.post('/api/auth/refresh');

      // Token refreshed successfully, process queued requests
      processQueue(null);

      // Retry the original request
      return apiClient(originalRequest);
    } catch (refreshError) {
      // Refresh failed, process queued requests with error
      processQueue(refreshError as Error);

      // Clear any stored user data and redirect to login
      sessionStorage.removeItem('admin_user');

      // Only redirect if we're in the admin section
      if (window.location.pathname.startsWith('/admin') && !window.location.pathname.includes('/login')) {
        window.location.href = '/admin/login';
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

/**
 * Get the full API endpoint URL
 * @param path - The API path (e.g., '/api/blog')
 * @returns The full URL
 */
export function getApiUrl(path: string): string {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

/**
 * Get the full URL for an uploaded file
 * @param path - The file path (e.g., '/uploads/image.jpg')
 * @returns The full URL
 */
export function getFileUrl(path: string): string {
  if (!path) return '';

  // If it's already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // If it's a local asset path, return as is
  if (path.startsWith('/src/')) {
    return path;
  }

  // If it's from the frontend public folder, return as is (served by Vite/frontend)
  // This includes: /images/, /integration-logos/, /favicon, /manifest, etc.
  if (
    path.startsWith('/images/') ||
    path.startsWith('/integration-logos/') ||
    path.startsWith('/favicon') ||
    path.startsWith('/manifest')
  ) {
    return path;
  }

  // Otherwise, prepend the API base URL (for backend uploads like /uploads/*)
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

// Export the base URL for direct use
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: getApiUrl('/api/auth/login'),
    LOGOUT: getApiUrl('/api/auth/logout'),
    LOGOUT_ALL: getApiUrl('/api/auth/logout-all'),
    REFRESH: getApiUrl('/api/auth/refresh'),
    VERIFY: getApiUrl('/api/auth/verify'),
    ME: getApiUrl('/api/auth/me'),
  },
  BLOG: {
    BASE: getApiUrl('/api/blog'),
    ADMIN_ALL: getApiUrl('/api/blog/admin/all'),
    ADMIN_CREATE: getApiUrl('/api/blog/admin/create'),
    ADMIN_BY_ID: (id: string) => getApiUrl(`/api/blog/admin/${id}`),
  },
  TESTIMONIALS: {
    BASE: getApiUrl('/api/testimonials'),
    ADMIN_ALL: getApiUrl('/api/testimonials/admin/all'),
    ADMIN_CREATE: getApiUrl('/api/testimonials/admin/create'),
    ADMIN_BY_ID: (id: string) => getApiUrl(`/api/testimonials/admin/${id}`),
  },
  CAREERS: {
    BASE: getApiUrl('/api/careers'),
    APPLY: getApiUrl('/api/careers/apply'),
    APPLICATIONS: getApiUrl('/api/careers/applications'),
    ADMIN_ALL: getApiUrl('/api/careers/admin/all'),
    ADMIN_CREATE: getApiUrl('/api/careers/admin/create'),
    ADMIN_BY_ID: (id: string) => getApiUrl(`/api/careers/admin/${id}`),
  },
  INTEGRATIONS: {
    BASE: getApiUrl('/api/integrations'),
    BY_ID: (id: string) => getApiUrl(`/api/integrations/${id}`),
    ADMIN_ALL: getApiUrl('/api/integrations/admin/all'),
    ADMIN_BY_ID: (id: string) => getApiUrl(`/api/integrations/admin/${id}`),
  },
  INTEGRATION_REQUESTS: {
    BASE: getApiUrl('/api/integration-requests'),
    ADMIN_ALL: getApiUrl('/api/integration-requests/admin/all'),
    ADMIN_BY_ID: (id: string) => getApiUrl(`/api/integration-requests/admin/${id}`),
  },
  VIDEO_GALLERIES: {
    BASE: getApiUrl('/api/video-galleries'),
    ADMIN: getApiUrl('/api/video-galleries/admin'),
    ADMIN_CREATE: getApiUrl('/api/video-galleries/admin/create'),
    ADMIN_BY_ID: (id: string) => getApiUrl(`/api/video-galleries/admin/${id}`),
  },
  POLICIES: {
    BASE: getApiUrl('/api/policies'),
    ADMIN_ALL: getApiUrl('/api/policies/admin/all'),
    ADMIN_BY_ID: (id: string) => getApiUrl(`/api/policies/admin/${id}`),
  },
  TEAM: {
    BASE: getApiUrl('/api/team'),
    ADMIN_ALL: getApiUrl('/api/team/admin/all'),
    ADMIN_CREATE: getApiUrl('/api/team/admin/create'),
    ADMIN_BY_ID: (id: string) => getApiUrl(`/api/team/admin/${id}`),
  },
  CONTENT: {
    BASE: getApiUrl('/api/content'),
    ADMIN_ALL: getApiUrl('/api/content/admin/all'),
    ADMIN_SECTION: (section: string) => getApiUrl(`/api/content/admin/${section}`),
  },
  SETUP: {
    CREATE_ADMIN: getApiUrl('/api/setup/create-admin'),
    LIST_USERS: getApiUrl('/api/setup/list-users'),
  },
};

/**
 * Retry configuration options for fetchWithRetry
 */
export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  timeout?: number;
  shouldRetry?: (response: Response) => boolean;
}

/**
 * Creates an AbortController with timeout
 * Returns the signal and a cleanup function
 */
function createTimeoutController(timeout: number): { signal: AbortSignal; cleanup: () => void } {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  return {
    signal: controller.signal,
    cleanup: () => clearTimeout(timeoutId),
  };
}

/**
 * Fetch wrapper with automatic retry, exponential backoff, and timeout
 * Use this for direct fetch calls that don't go through axios/apiClient
 *
 * @example
 * const response = await fetchWithRetry('/api/data', { method: 'GET' });
 * const data = await response.json();
 *
 * // With custom timeout
 * const response = await fetchWithRetry('/api/data', {}, { timeout: 10000 });
 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  retryOptions?: RetryOptions
): Promise<Response> {
  const {
    maxRetries = MAX_RETRIES,
    baseDelay = RETRY_BASE_DELAY,
    maxDelay = MAX_RETRY_DELAY,
    timeout = DEFAULT_TIMEOUT,
    shouldRetry = (response: Response) => {
      // Retry on server errors (5xx)
      if (response.status >= 500) return true;
      // Retry on timeout (408) and rate limit (429)
      if (response.status === 408 || response.status === 429) return true;
      // Don't retry other 4xx client errors
      if (response.status >= 400) return false;
      return false;
    },
  } = retryOptions || {};

  let lastError: Error | null = null;
  let lastResponse: Response | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const { signal, cleanup } = createTimeoutController(timeout);

    try {
      // Merge the timeout signal with any existing signal in options
      const fetchOptions: RequestInit = {
        ...options,
        signal: options?.signal
          ? // If there's an existing signal, we can't easily combine them
            // so we prioritize the provided signal (user has control)
            options.signal
          : signal,
      };

      const response = await fetch(url, fetchOptions);
      cleanup();

      // If response is OK or we shouldn't retry, return it
      if (response.ok || !shouldRetry(response)) {
        return response;
      }

      lastResponse = response;

      // Check for rate limit retry-after header
      let delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after');
        if (retryAfter) {
          const seconds = parseInt(retryAfter, 10);
          if (!isNaN(seconds)) {
            delay = seconds * 1000;
          }
        }
      }

      // Add jitter to prevent thundering herd
      delay += Math.random() * 500;

      if (attempt < maxRetries) {
        console.log(`HTTP ${response.status}. Retrying in ${Math.round(delay / 1000)}s... (attempt ${attempt + 1}/${maxRetries})`);
        await sleep(delay);
      }
    } catch (error) {
      cleanup();
      lastError = error as Error;

      // Check if this was a timeout (AbortError)
      const isTimeout = (error as Error).name === 'AbortError';
      const errorType = isTimeout ? 'Request timeout' : 'Network error';

      // Network errors and timeouts should be retried
      if (attempt < maxRetries) {
        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay) + Math.random() * 500;
        console.log(`${errorType}. Retrying in ${Math.round(delay / 1000)}s... (attempt ${attempt + 1}/${maxRetries})`);
        await sleep(delay);
      }
    }
  }

  // If we have a response (even if it was an error), return it
  if (lastResponse) {
    return lastResponse;
  }

  // Otherwise throw the last error
  throw lastError || new Error('Request failed after maximum retries');
}
