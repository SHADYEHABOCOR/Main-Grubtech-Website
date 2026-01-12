/**
 * Dashboard Showcase Components Module
 * Centralized exports for all dashboard components
 *
 * Usage:
 * import { StatCard, FeatureCard, Sidebar, TutorialCursor, HomeDashboardContent, SalesReportsContent } from '@/components/sections/DashboardShowcase/components';
 */

// UI Components
export { StatCard } from './StatCard';
export { FeatureCard } from './FeatureCard';

// Layout Components
export { Sidebar } from './Sidebar';
export { TutorialCursor } from './TutorialCursor';

// Content Components (lazy-loaded for better performance)
export { HomeDashboardContent } from './HomeDashboardContent.lazy';
export { SalesReportsContent } from './SalesReportsContent.lazy';
