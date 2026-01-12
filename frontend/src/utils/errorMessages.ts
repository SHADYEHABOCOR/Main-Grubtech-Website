/**
 * Error Message Sanitization Utility
 *
 * Provides user-friendly error messages while preventing
 * exposure of technical details, stack traces, or sensitive information.
 */

// Known safe error codes that can be shown to users
const SAFE_ERROR_CODES: Record<string, string> = {
  // Authentication errors
  'INVALID_CREDENTIALS': 'Invalid username or password.',
  'TOKEN_EXPIRED': 'Your session has expired. Please log in again.',
  'UNAUTHORIZED': 'You are not authorized to perform this action.',
  'SESSION_EXPIRED': 'Your session has expired. Please log in again.',

  // Validation errors
  'VALIDATION_ERROR': 'Please check your input and try again.',
  'INVALID_EMAIL': 'Please enter a valid email address.',
  'REQUIRED_FIELD': 'Please fill in all required fields.',

  // Rate limiting
  'RATE_LIMIT_EXCEEDED': 'Too many requests. Please wait a moment and try again.',
  'TOO_MANY_REQUESTS': 'Too many requests. Please wait a moment and try again.',

  // Network errors
  'NETWORK_ERROR': 'Unable to connect to the server. Please check your connection.',
  'TIMEOUT': 'The request timed out. Please try again.',
  'ERR_NETWORK': 'Unable to connect to the server. Please check your connection.',
  'ECONNABORTED': 'The request timed out. Please try again.',

  // Server errors
  'SERVER_ERROR': 'Something went wrong on our end. Please try again later.',
  'INTERNAL_ERROR': 'Something went wrong on our end. Please try again later.',

  // Form-specific errors
  'DUPLICATE_EMAIL': 'This email is already registered.',
  'ALREADY_SUBSCRIBED': 'You are already subscribed to our newsletter.',

  // Resource errors
  'NOT_FOUND': 'The requested resource was not found.',
  'FORBIDDEN': 'You do not have permission to access this resource.',
};

// Default user-friendly messages by HTTP status code
const STATUS_CODE_MESSAGES: Record<number, string> = {
  400: 'There was a problem with your request. Please check your input.',
  401: 'Please log in to continue.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  408: 'The request timed out. Please try again.',
  409: 'This action conflicts with existing data.',
  422: 'Please check your input and try again.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Something went wrong on our end. Please try again later.',
  502: 'The server is temporarily unavailable. Please try again later.',
  503: 'The service is temporarily unavailable. Please try again later.',
  504: 'The request timed out. Please try again.',
};

// Patterns that indicate technical/sensitive content that should not be shown
const SENSITIVE_PATTERNS = [
  /at\s+[\w.]+\s+\(/i,           // Stack trace pattern
  /^\s*at\s+/,                   // Stack trace line
  /Error:\s*$/,                  // Empty error prefix
  /undefined|null/i,             // Technical values
  /\b(sql|query|database|db)\b/i,// Database references
  /\b(token|secret|key|password|credential)\b/i, // Sensitive terms
  /\b(file|path|directory|module)\b.*\//i, // File paths
  /\b(node_modules|dist|src)\b/i, // Internal paths
  /\[\w+\]:/,                    // Error codes in brackets
  /^\d{3}:/,                     // HTTP status with message
  /ENOENT|ECONNREFUSED|ETIMEDOUT/, // System error codes
  /\.(js|ts|tsx|jsx):\d+/,       // Source file references
];

/**
 * API Error structure from backend
 */
interface ApiErrorResponse {
  code?: string;
  error?: string;
  message?: string;
  statusCode?: number;
  status?: number;
}

/**
 * Error with response data (e.g., from axios)
 */
interface ErrorWithResponse {
  response?: {
    data?: ApiErrorResponse;
    status?: number;
  };
  code?: string;
  message?: string;
}

/**
 * Check if a message contains sensitive/technical content
 */
function containsSensitiveContent(message: string): boolean {
  return SENSITIVE_PATTERNS.some(pattern => pattern.test(message));
}

/**
 * Get a user-friendly error message from any error type
 *
 * @param error - The error to sanitize
 * @param defaultMessage - Fallback message if no safe message can be determined
 * @returns A user-friendly error message safe to display
 */
export function getErrorMessage(
  error: unknown,
  defaultMessage = 'An error occurred. Please try again.'
): string {
  // Handle null/undefined
  if (!error) {
    return defaultMessage;
  }

  // Handle string errors
  if (typeof error === 'string') {
    // Check if it's a known safe error code
    if (SAFE_ERROR_CODES[error]) {
      return SAFE_ERROR_CODES[error];
    }
    // Check if it contains sensitive content
    if (containsSensitiveContent(error)) {
      return defaultMessage;
    }
    // Return the string if it looks safe and is reasonable length
    if (error.length < 200 && !error.includes('\n')) {
      return error;
    }
    return defaultMessage;
  }

  // Handle error objects with response (axios-like)
  if (typeof error === 'object') {
    const err = error as ErrorWithResponse;

    // Try to get error code from response
    const errorCode = err.response?.data?.code || err.code;
    if (errorCode && SAFE_ERROR_CODES[errorCode]) {
      return SAFE_ERROR_CODES[errorCode];
    }

    // Try to get status code message
    const statusCode = err.response?.status || err.response?.data?.statusCode;
    if (statusCode && STATUS_CODE_MESSAGES[statusCode]) {
      return STATUS_CODE_MESSAGES[statusCode];
    }

    // Check error field from response
    const errorField = err.response?.data?.error;
    if (errorField && typeof errorField === 'string') {
      if (SAFE_ERROR_CODES[errorField]) {
        return SAFE_ERROR_CODES[errorField];
      }
      // Only show if it looks like a user-friendly message
      if (!containsSensitiveContent(errorField) && errorField.length < 150) {
        return errorField;
      }
    }

    // Check message field - be more cautious here
    const message = err.response?.data?.message || err.message;
    if (message && typeof message === 'string') {
      // Check known safe codes
      if (SAFE_ERROR_CODES[message]) {
        return SAFE_ERROR_CODES[message];
      }
      // Be very careful with raw messages
      if (
        !containsSensitiveContent(message) &&
        message.length < 150 &&
        !message.includes('\n') &&
        // Only allow messages that look intentionally user-friendly
        /^[A-Z]/.test(message) && // Starts with capital
        /[.!?]$/.test(message)    // Ends with punctuation
      ) {
        return message;
      }
    }

    // Handle Error instances
    if (error instanceof Error) {
      const name = error.name;
      if (name === 'NetworkError' || name === 'TypeError') {
        return 'Unable to connect to the server. Please check your connection.';
      }
      if (name === 'TimeoutError' || name === 'AbortError') {
        return 'The request timed out. Please try again.';
      }
    }
  }

  return defaultMessage;
}

/**
 * Get error message specifically for form submissions
 */
export function getFormErrorMessage(
  error: unknown,
  formType: 'contact' | 'newsletter' | 'demo' | 'login' | 'general' = 'general'
): string {
  const formDefaults: Record<string, string> = {
    contact: 'Unable to send your message. Please try again or email us directly.',
    newsletter: 'Unable to subscribe. Please try again later.',
    demo: 'Unable to submit your demo request. Please try again or contact us directly.',
    login: 'Login failed. Please check your credentials and try again.',
    general: 'An error occurred. Please try again.',
  };

  return getErrorMessage(error, formDefaults[formType]);
}

/**
 * Get error message for authentication-related errors
 */
export function getAuthErrorMessage(error: unknown): string {
  const err = error as ErrorWithResponse;

  // Check for specific auth error codes
  const errorCode = err?.response?.data?.code || err?.code;
  if (errorCode === 'INVALID_CREDENTIALS') {
    return 'Invalid username or password.';
  }
  if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'SESSION_EXPIRED') {
    return 'Your session has expired. Please log in again.';
  }
  if (errorCode === 'UNAUTHORIZED' || err?.response?.status === 401) {
    return 'Invalid username or password.';
  }
  if (errorCode === 'FORBIDDEN' || err?.response?.status === 403) {
    return 'You do not have permission to access this area.';
  }

  return getFormErrorMessage(error, 'login');
}

/**
 * Check if an error is a network/connectivity error
 */
export function isNetworkError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const err = error as ErrorWithResponse;
  const code = err.code;
  const message = err.message?.toLowerCase() || '';

  return (
    code === 'ERR_NETWORK' ||
    code === 'ECONNABORTED' ||
    code === 'ECONNREFUSED' ||
    message.includes('network error') ||
    message.includes('failed to fetch') ||
    !err.response // No response usually means network issue
  );
}

/**
 * Check if an error is a rate limit error
 */
export function isRateLimitError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const err = error as ErrorWithResponse;
  return (
    err.response?.status === 429 ||
    err.response?.data?.code === 'RATE_LIMIT_EXCEEDED' ||
    err.response?.data?.code === 'TOO_MANY_REQUESTS'
  );
}
