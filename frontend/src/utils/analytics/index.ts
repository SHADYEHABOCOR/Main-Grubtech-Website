/**
 * Analytics Module - Main Export
 * Central point for all analytics functionality
 */

export { analytics } from './analytics';
export type { AnalyticsEvent, AnalyticsProperties } from './analytics';
export { useScrollTracking, useTimeTracking } from './useScrollTracking';
export {
  initDeferredAnalytics,
  shouldLoadAnalytics,
  loadAnalyticsIfNeeded,
  getAnalyticsState,
  ANALYTICS_CONFIG,
} from './deferredAnalytics';
