import type { TutorialStep } from '../types';

/**
 * Home Dashboard tutorial steps
 * Interactive tutorial cursor overlay that guides users through the home dashboard features
 */
export const homeTutorialSteps: TutorialStep[] = [
  { target: 'home-welcome', text: "Welcome back! Here's your daily snapshot.", delay: 3500 },
  { target: 'home-date-filter', text: "Filter your sales by Today, Week, or Month.", delay: 3500 },
  { target: 'home-orders-stat', text: "Track total orders processed today.", delay: 3000 },
  { target: 'home-net-sales-stat', text: "Monitor Net Sales in real-time.", delay: 3000 },
  { target: 'home-filter-btn', text: "Export data or apply filters.", delay: 3000 },
  { target: 'home-chart-title', text: "See order distribution across all channels.", delay: 4000 },
  { target: 'home-chart-bar', text: "Pickup orders lead today!", delay: 3000 },
];

/**
 * Sales Reports tutorial steps
 * Interactive tutorial cursor overlay that guides users through the sales reports features
 */
export const salesTutorialSteps: TutorialStep[] = [
  { target: 'sales-sidebar-item', text: "Access Real-Time Reports from the sidebar.", delay: 3500 },
  { target: 'sales-tabs', text: "Switch between Overview, Brands, or Locations.", delay: 3500 },
  { target: 'sales-metric-dropdown', text: "Select different metrics to visualize.", delay: 3000 },
  { target: 'sales-chart', text: "Compare Current vs Previous period trends.", delay: 4000 },
  { target: 'sales-download-btn', text: "Download CSV reports instantly.", delay: 3000 },
  { target: 'sales-table', text: "Detailed breakdown by date.", delay: 4000 },
];
