/**
 * Shared TypeScript interfaces and types for DashboardShowcase components
 */

/**
 * Tutorial step configuration for the interactive cursor overlay
 */
export interface TutorialStep {
  target: string; // data-tutorial-target attribute value
  text: string;
  delay?: number;
}

/**
 * Data point for bar chart visualization
 */
export interface BarChartDataPoint {
  name: string;
  value: number;
}

/**
 * Data point for line chart visualization with comparison
 */
export interface LineChartDataPoint {
  date: string;
  current: number;
  previous: number;
}

/**
 * Sales table row data
 */
export interface TableRow {
  date: string;
  orders: number;
  curr: string;
  gross: string;
  disc: string;
  earn: string;
  vat: string;
  net: string;
  avg: string;
  isTotal?: boolean;
}

/**
 * Recent order item
 */
export interface RecentOrder {
  id: string;
  customer: string;
  channel: string;
  amount: string;
  status: 'Completed' | 'Preparing' | 'In Transit';
  time: string;
}
