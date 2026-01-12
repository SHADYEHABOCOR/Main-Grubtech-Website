import { QueryClient } from '@tanstack/react-query';
import type { NetworkError } from '../types/global';

/**
 * Type guard to check if error is a network error
 */
function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof Error || (typeof error === 'object' && error !== null);
}

/**
 * Safely get error properties
 */
function getErrorStatus(error: unknown): number | undefined {
  if (!isNetworkError(error)) return undefined;
  return error.response?.status;
}

function getErrorCode(error: unknown): string | undefined {
  if (!isNetworkError(error)) return undefined;
  return error.code;
}

function getErrorMessage(error: unknown): string | undefined {
  if (!isNetworkError(error)) return undefined;
  return error.message;
}

/**
 * Determine if an error should be retried
 * - Don't retry 4xx errors (client errors) except 408 (timeout) and 429 (rate limit)
 * - Don't retry if it's a network error that indicates no internet
 * - Retry 5xx errors (server errors)
 * - Retry network errors (might be temporary)
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
  // Max 3 retries
  if (failureCount >= 3) return false;

  // Check for axios/fetch error with response status
  const status = getErrorStatus(error);

  if (status) {
    // Don't retry client errors (400-499) except timeout (408) and rate limit (429)
    if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
      return false;
    }
    // Retry server errors (500-599)
    if (status >= 500) {
      return true;
    }
    // Retry timeout and rate limit (with exponential backoff)
    if (status === 408 || status === 429) {
      return true;
    }
  }

  // Check for rate limit flag
  if (isNetworkError(error) && error.isRateLimited) {
    return true;
  }

  // Check for network errors (no response received)
  const code = getErrorCode(error);
  const message = getErrorMessage(error);
  const hasNetworkError =
    code === 'ECONNABORTED' ||
    code === 'ERR_NETWORK' ||
    message?.includes('Network Error') ||
    message?.includes('Failed to fetch');

  if (hasNetworkError) {
    return true;
  }

  // Default: retry for unknown errors
  return true;
}

/**
 * Calculate retry delay with exponential backoff
 * For rate-limited requests, use the retry-after header if available
 */
function calculateRetryDelay(attemptIndex: number, error: unknown): number {
  // If rate limited, use the retry-after value
  const retryAfter = isNetworkError(error) ? error.retryAfter : undefined;
  if (retryAfter && typeof retryAfter === 'number') {
    // Add a small random jitter (0-1 second) to prevent thundering herd
    return (retryAfter * 1000) + Math.random() * 1000;
  }

  // Exponential backoff: 1s, 2s, 4s, 8s... up to 30s max
  // Add random jitter (0-500ms) to prevent synchronized retries
  const baseDelay = Math.min(1000 * Math.pow(2, attemptIndex), 30000);
  const jitter = Math.random() * 500;

  return baseDelay + jitter;
}

/**
 * React Query Client Configuration
 *
 * Provides:
 * - Automatic caching and refetching
 * - Request deduplication
 * - Background updates
 * - Optimistic updates
 * - Smart retry logic with exponential backoff
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: Data is considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000,

      // Cache time: Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,

      // Smart retry with conditional logic
      retry: shouldRetry,
      retryDelay: calculateRetryDelay,

      // PERF: Disabled refetch on window focus to reduce HTTP requests
      // This was causing all cached queries to refetch whenever user returned to tab
      refetchOnWindowFocus: false,

      // Don't refetch on mount if data is fresh
      refetchOnMount: false,

      // Don't refetch on reconnect if data is fresh
      refetchOnReconnect: true,
    },
    mutations: {
      // Smart retry for mutations (more conservative)
      retry: (failureCount, error) => {
        // Only retry once for mutations
        if (failureCount >= 1) return false;

        // Only retry on network errors or 5xx server errors
        const status = getErrorStatus(error);
        const isServerError = status && status >= 500 && status < 600;
        const code = getErrorCode(error);
        const message = getErrorMessage(error);
        const hasNetworkError =
          code === 'ERR_NETWORK' ||
          message?.includes('Network Error');

        return isServerError || hasNetworkError;
      },
      retryDelay: calculateRetryDelay,
    },
  },
});

// Export utilities for use elsewhere
export { shouldRetry, calculateRetryDelay };
