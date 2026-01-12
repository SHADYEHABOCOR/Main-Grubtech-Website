import { describe, it, expect } from 'vitest';
import {
  getErrorMessage,
  getFormErrorMessage,
  getAuthErrorMessage,
  isNetworkError,
  isRateLimitError,
} from './errorMessages';

describe('errorMessages utility', () => {
  describe('getErrorMessage', () => {
    it('returns default message for null/undefined errors', () => {
      expect(getErrorMessage(null)).toBe('An error occurred. Please try again.');
      expect(getErrorMessage(undefined)).toBe('An error occurred. Please try again.');
    });

    it('returns custom default message when provided', () => {
      expect(getErrorMessage(null, 'Custom error')).toBe('Custom error');
    });

    it('returns mapped message for known error codes', () => {
      expect(getErrorMessage('INVALID_CREDENTIALS')).toBe('Invalid username or password.');
      expect(getErrorMessage('TOKEN_EXPIRED')).toBe('Your session has expired. Please log in again.');
      expect(getErrorMessage('RATE_LIMIT_EXCEEDED')).toBe('Too many requests. Please wait a moment and try again.');
    });

    it('sanitizes messages with stack traces', () => {
      const errorWithStack = 'Error at function.name (file.ts:123)';
      expect(getErrorMessage(errorWithStack)).toBe('An error occurred. Please try again.');
    });

    it('sanitizes messages with file paths', () => {
      const errorWithPath = 'Error in /node_modules/package/file.js';
      expect(getErrorMessage(errorWithPath)).toBe('An error occurred. Please try again.');
    });

    it('sanitizes messages with database references', () => {
      const dbError = 'SQL query failed: SELECT * FROM users';
      expect(getErrorMessage(dbError)).toBe('An error occurred. Please try again.');
    });

    it('sanitizes messages with sensitive terms', () => {
      const sensitiveError = 'Invalid token provided';
      expect(getErrorMessage(sensitiveError)).toBe('An error occurred. Please try again.');
    });

    it('allows safe user-friendly strings through', () => {
      // Note: must start with capital and end with punctuation to pass
      const safeError = 'Please enter a valid email address.';
      expect(getErrorMessage(safeError)).toBe('Please enter a valid email address.');
    });

    it('handles axios-like error objects with status codes', () => {
      const axiosError = {
        response: {
          status: 404,
          data: { message: 'Not found' },
        },
      };
      expect(getErrorMessage(axiosError)).toBe('The requested resource was not found.');
    });

    it('handles axios-like error objects with error codes', () => {
      const axiosError = {
        response: {
          data: { code: 'INVALID_CREDENTIALS' },
        },
      };
      expect(getErrorMessage(axiosError)).toBe('Invalid username or password.');
    });

    it('returns status message for 401 errors', () => {
      const error401 = { response: { status: 401 } };
      expect(getErrorMessage(error401)).toBe('Please log in to continue.');
    });

    it('returns status message for 429 errors', () => {
      const error429 = { response: { status: 429 } };
      expect(getErrorMessage(error429)).toBe('Too many requests. Please wait a moment and try again.');
    });

    it('returns status message for 500 errors', () => {
      const error500 = { response: { status: 500 } };
      expect(getErrorMessage(error500)).toBe('Something went wrong on our end. Please try again later.');
    });

    it('handles network errors', () => {
      const networkError = new Error('Network Error');
      networkError.name = 'NetworkError';
      expect(getErrorMessage(networkError)).toBe('Unable to connect to the server. Please check your connection.');
    });

    it('sanitizes multiline error messages', () => {
      const multilineError = 'Error occurred\nat line 1\nat line 2';
      expect(getErrorMessage(multilineError)).toBe('An error occurred. Please try again.');
    });
  });

  describe('getFormErrorMessage', () => {
    it('returns contact-specific default message', () => {
      expect(getFormErrorMessage(null, 'contact')).toBe(
        'Unable to send your message. Please try again or email us directly.'
      );
    });

    it('returns newsletter-specific default message', () => {
      expect(getFormErrorMessage(null, 'newsletter')).toBe(
        'Unable to subscribe. Please try again later.'
      );
    });

    it('returns demo-specific default message', () => {
      expect(getFormErrorMessage(null, 'demo')).toBe(
        'Unable to submit your demo request. Please try again or contact us directly.'
      );
    });

    it('returns login-specific default message', () => {
      expect(getFormErrorMessage(null, 'login')).toBe(
        'Login failed. Please check your credentials and try again.'
      );
    });

    it('still extracts known error codes', () => {
      expect(getFormErrorMessage('RATE_LIMIT_EXCEEDED', 'contact')).toBe(
        'Too many requests. Please wait a moment and try again.'
      );
    });
  });

  describe('getAuthErrorMessage', () => {
    it('returns message for INVALID_CREDENTIALS', () => {
      const error = { response: { data: { code: 'INVALID_CREDENTIALS' } } };
      expect(getAuthErrorMessage(error)).toBe('Invalid username or password.');
    });

    it('returns message for TOKEN_EXPIRED', () => {
      const error = { response: { data: { code: 'TOKEN_EXPIRED' } } };
      expect(getAuthErrorMessage(error)).toBe('Your session has expired. Please log in again.');
    });

    it('returns message for 401 status', () => {
      const error = { response: { status: 401 } };
      expect(getAuthErrorMessage(error)).toBe('Invalid username or password.');
    });

    it('returns message for 403 status', () => {
      const error = { response: { status: 403 } };
      expect(getAuthErrorMessage(error)).toBe('You do not have permission to access this area.');
    });

    it('returns default login message for unknown errors', () => {
      const error = { response: { status: 500 } };
      expect(getAuthErrorMessage(error)).toBe('Something went wrong on our end. Please try again later.');
    });
  });

  describe('isNetworkError', () => {
    it('returns false for null/undefined', () => {
      expect(isNetworkError(null)).toBe(false);
      expect(isNetworkError(undefined)).toBe(false);
    });

    it('returns true for ERR_NETWORK code', () => {
      expect(isNetworkError({ code: 'ERR_NETWORK' })).toBe(true);
    });

    it('returns true for ECONNABORTED code', () => {
      expect(isNetworkError({ code: 'ECONNABORTED' })).toBe(true);
    });

    it('returns true for network error message', () => {
      expect(isNetworkError({ message: 'Network Error' })).toBe(true);
    });

    it('returns true for failed to fetch message', () => {
      expect(isNetworkError({ message: 'Failed to fetch' })).toBe(true);
    });

    it('returns true when no response (typical network failure)', () => {
      expect(isNetworkError({ code: 'UNKNOWN', message: 'Something' })).toBe(true);
    });

    it('returns false when response exists', () => {
      expect(isNetworkError({ response: { status: 500 } })).toBe(false);
    });
  });

  describe('isRateLimitError', () => {
    it('returns false for null/undefined', () => {
      expect(isRateLimitError(null)).toBe(false);
      expect(isRateLimitError(undefined)).toBe(false);
    });

    it('returns true for 429 status', () => {
      expect(isRateLimitError({ response: { status: 429 } })).toBe(true);
    });

    it('returns true for RATE_LIMIT_EXCEEDED code', () => {
      expect(isRateLimitError({ response: { data: { code: 'RATE_LIMIT_EXCEEDED' } } })).toBe(true);
    });

    it('returns true for TOO_MANY_REQUESTS code', () => {
      expect(isRateLimitError({ response: { data: { code: 'TOO_MANY_REQUESTS' } } })).toBe(true);
    });

    it('returns false for other errors', () => {
      expect(isRateLimitError({ response: { status: 500 } })).toBe(false);
    });
  });
});
