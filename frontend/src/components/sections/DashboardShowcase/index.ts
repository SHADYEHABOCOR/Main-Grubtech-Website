/**
 * Dashboard Showcase Module
 * Main barrel export file for the DashboardShowcase section
 *
 * This module provides a comprehensive dashboard showcase with interactive tutorials,
 * demonstrating both home dashboard and sales reports views.
 *
 * Usage:
 * import { DashboardShowcaseSection } from '@/components/sections/DashboardShowcase';
 *
 * For component-level imports:
 * import { StatCard, FeatureCard, Sidebar } from '@/components/sections/DashboardShowcase/components';
 *
 * For data imports:
 * import { barChartData, tableData, homeTutorialSteps } from '@/components/sections/DashboardShowcase/data';
 *
 * For type imports:
 * import type { TutorialStep, BarChartDataPoint } from '@/components/sections/DashboardShowcase/types';
 */

// Main Component
export { DashboardShowcaseSection } from './DashboardShowcaseSection';

// Re-export types for convenience
export type {
  TutorialStep,
  BarChartDataPoint,
  LineChartDataPoint,
  TableRow,
  RecentOrder,
} from './types';

// Re-export sub-modules for convenience (optional, but useful for advanced usage)
export * as DashboardComponents from './components';
export * as DashboardData from './data';
