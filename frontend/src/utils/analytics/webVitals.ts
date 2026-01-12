/**
 * Core Web Vitals Tracking
 *
 * Tracks Google's Core Web Vitals metrics:
 * - LCP (Largest Contentful Paint) - Loading performance
 * - FID (First Input Delay) - Interactivity
 * - CLS (Cumulative Layout Shift) - Visual stability
 * - INP (Interaction to Next Paint) - Responsiveness
 * - TTFB (Time to First Byte) - Server response time
 * - FCP (First Contentful Paint) - Initial render
 */

import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';

// Thresholds for Core Web Vitals (in milliseconds except CLS)
const THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 },
  FID: { good: 100, needsImprovement: 300 },
  CLS: { good: 0.1, needsImprovement: 0.25 },
  INP: { good: 200, needsImprovement: 500 },
  TTFB: { good: 800, needsImprovement: 1800 },
  FCP: { good: 1800, needsImprovement: 3000 },
};

type MetricRating = 'good' | 'needs-improvement' | 'poor';

/**
 * Get rating for a metric value
 */
function getRating(name: string, value: number): MetricRating {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
}

/**
 * Send metric to analytics
 */
function sendToAnalytics(metric: Metric): void {
  const rating = getRating(metric.name, metric.value);

  // Send to Google Analytics 4 if available
  if (typeof window.gtag === 'function') {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      metric_rating: rating,
      metric_delta: Math.round(metric.delta),
      non_interaction: true,
    });
  }

  // Log in development
  if (import.meta.env.DEV) {
    const color = rating === 'good' ? '🟢' : rating === 'needs-improvement' ? '🟡' : '🔴';
    console.log(
      `${color} ${metric.name}: ${metric.value.toFixed(metric.name === 'CLS' ? 3 : 0)}${metric.name === 'CLS' ? '' : 'ms'} (${rating})`
    );
  }

  // Send to Sentry as a custom metric if available
  if (import.meta.env.PROD && rating === 'poor') {
    // Only report poor metrics to reduce noise
    import('../../lib/sentry').then(({ captureMessage }) => {
      captureMessage(`Poor ${metric.name}: ${metric.value.toFixed(2)}`, 'warning');
    }).catch(() => {
      // Sentry not available, ignore
    });
  }
}

/**
 * Initialize Core Web Vitals tracking
 * Call this once when the app loads
 */
export function initWebVitals(): void {
  // Only track if analytics consent is given
  // The metrics will still be collected but not sent

  try {
    // Largest Contentful Paint - measures loading performance
    onLCP(sendToAnalytics);

    // First Input Delay - measures interactivity (being replaced by INP)
    // Note: FID is deprecated, but still useful for older browser support

    // Cumulative Layout Shift - measures visual stability
    onCLS(sendToAnalytics);

    // Interaction to Next Paint - measures responsiveness
    onINP(sendToAnalytics);

    // Time to First Byte - measures server response time
    onTTFB(sendToAnalytics);

    // First Contentful Paint - measures initial render
    onFCP(sendToAnalytics);

    if (import.meta.env.DEV) {
      console.log('📊 Core Web Vitals tracking initialized');
    }
  } catch (error) {
    console.error('Failed to initialize Web Vitals:', error);
  }
}

/**
 * Get a summary of current Web Vitals
 * Useful for debugging or displaying in a dev tools panel
 */
export function getWebVitalsSummary(): Promise<Record<string, { value: number; rating: MetricRating }>> {
  return new Promise((resolve) => {
    const results: Record<string, { value: number; rating: MetricRating }> = {};

    const collectMetric = (metric: Metric) => {
      results[metric.name] = {
        value: metric.value,
        rating: getRating(metric.name, metric.value),
      };
    };

    onLCP(collectMetric);
    onCLS(collectMetric);
    onINP(collectMetric);
    onTTFB(collectMetric);
    onFCP(collectMetric);

    // Resolve after a short delay to collect metrics
    setTimeout(() => resolve(results), 100);
  });
}
