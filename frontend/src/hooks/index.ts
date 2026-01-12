/**
 * Hooks Library
 * Centralized exports for all custom React hooks
 *
 * Usage:
 * import { useTestimonials, useIntegrations, useBlogPosts } from '@/hooks';
 */

// Data fetching hooks (React Query)
export { useBlogPosts, useBlogPost, useAdminBlogPosts, useDeleteBlogPost } from './useBlogPosts';
export { useCareers, useCareer, useAdminCareers, useDeleteCareer } from './useCareers';
export { usePolicies, usePolicy, useAdminPolicies, useDeletePolicy } from './usePolicies';
export { useTestimonials, useTestimonial, useFeaturedTestimonials, useAdminTestimonials, useDeleteTestimonial } from './useTestimonials';
export { useIntegrations, useIntegration, useIntegrationCategories, useAdminIntegrations, useDeleteIntegration } from './useIntegrations';
export { useVideos, useVideo, useAdminVideos, useDeleteVideo } from './useVideos';
export { useContent } from './useContent';

// Utility hooks
export { useDebounce } from './useDebounce';
export { useFetch } from './useFetch';
export { useForm } from './useForm';
export { useResponsive } from './useResponsive';
export { useReducedMotion } from './useReducedMotion';

// Animation & UX hooks
export { useLenis } from './useLenis';
export { ScrollRestoration } from './useScrollRestoration';
export { useChartReady } from './useChartReady';

// Analytics hooks
export { useWebsiteAnalytics } from './useWebsiteAnalytics';
export { useRealTimeAnalytics } from './useRealTimeAnalytics';
export { useOnlineStatus } from './useOnlineStatus';
