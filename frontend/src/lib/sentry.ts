/**
 * Sentry Error Monitoring Configuration
 *
 * Provides production error tracking with:
 * - Automatic error capture
 * - Performance monitoring
 * - User context
 * - Release tracking
 */

import * as Sentry from '@sentry/react';

// Only initialize in production or if explicitly enabled
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const IS_PRODUCTION = import.meta.env.PROD;
const ENABLE_SENTRY = import.meta.env.VITE_ENABLE_SENTRY === 'true';

/**
 * Initialize Sentry error monitoring
 * Call this before rendering the app
 */
export function initSentry(): void {
  // Only initialize if DSN is configured and we're in production (or explicitly enabled)
  if (!SENTRY_DSN || (!IS_PRODUCTION && !ENABLE_SENTRY)) {
    if (import.meta.env.DEV) {
      console.log('ℹ️ Sentry disabled (no DSN or not in production)');
    }
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,

    // Environment and release info
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_APP_VERSION || 'development',

    // Integrations
    integrations: [
      // Browser tracing for performance monitoring
      Sentry.browserTracingIntegration(),
      // Replay for session recording (captures 10% of sessions, 100% of errors)
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],

    // Performance monitoring sample rate (adjust based on traffic)
    // 0.1 = 10% of transactions
    tracesSampleRate: IS_PRODUCTION ? 0.1 : 1.0,

    // Session replay sample rates
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

    // Filter out noisy errors
    beforeSend(event, hint) {
      const error = hint.originalException;

      // Ignore network errors that are expected (user went offline, etc.)
      if (error instanceof Error) {
        const message = error.message.toLowerCase();

        // Ignore common non-actionable errors
        if (
          message.includes('network error') ||
          message.includes('failed to fetch') ||
          message.includes('load failed') ||
          message.includes('cancelled') ||
          message.includes('aborted')
        ) {
          return null;
        }

        // Ignore ResizeObserver errors (browser quirk, not actionable)
        if (message.includes('resizeobserver')) {
          return null;
        }
      }

      return event;
    },

    // Don't send PII by default
    sendDefaultPii: false,

    // Ignore errors from browser extensions
    denyUrls: [
      // Chrome extensions
      /extensions\//i,
      /^chrome:\/\//i,
      /^chrome-extension:\/\//i,
      // Firefox extensions
      /^moz-extension:\/\//i,
      // Safari extensions
      /^safari-extension:\/\//i,
    ],
  });

  console.log('✅ Sentry error monitoring initialized');
}

/**
 * Set user context for error tracking
 * Call this after user logs in
 */
export function setSentryUser(user: {
  id: string;
  email?: string;
  username?: string;
}): void {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
}

/**
 * Clear user context
 * Call this after user logs out
 */
export function clearSentryUser(): void {
  Sentry.setUser(null);
}

/**
 * Capture a custom error with additional context
 */
export function captureError(
  error: Error,
  context?: Record<string, unknown>
): void {
  if (context) {
    Sentry.setContext('additional', context);
  }
  Sentry.captureException(error);
}

/**
 * Capture a custom message (for non-error events)
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info'
): void {
  Sentry.captureMessage(message, level);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, unknown>
): void {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
}

// Export Sentry's ErrorBoundary for use in components
export { ErrorBoundary } from '@sentry/react';
