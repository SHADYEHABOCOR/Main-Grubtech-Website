import type { BarChartDataPoint, LineChartDataPoint } from '../types';

/**
 * Bar Chart data for Home Dashboard
 * Represents order distribution across different delivery channels
 */
export const barChartData: BarChartDataPoint[] = [
  { name: 'Pickup', value: 19 },
  { name: 'Uber Eats', value: 17 },
  { name: 'Deliveroo', value: 13 },
  { name: 'Dine In', value: 8 },
  { name: 'Grubtech', value: 4 },
  { name: 'Careem', value: 3 },
  { name: 'Talabat', value: 3 },
  { name: 'ChatFood', value: 2 },
  { name: 'KeeTa', value: 1 },
  { name: 'Noon', value: 1 },
  { name: 'Hungerstation', value: 1 },
];

/**
 * Line Chart data for Sales Reports
 * Compares current period sales with previous period
 */
export const lineChartData: LineChartDataPoint[] = [
  { date: 'Dec 4', current: 2500, previous: 2000 },
  { date: 'Dec 5', current: 3500, previous: 2800 },
  { date: 'Dec 6', current: 5200, previous: 3100 },
  { date: 'Dec 7', current: 3200, previous: 2500 },
  { date: 'Dec 8', current: 3800, previous: 3200 },
  { date: 'Dec 9', current: 4100, previous: 3400 },
  { date: 'Dec 10', current: 3900, previous: 3100 },
  { date: 'Dec 11', current: 2800, previous: 2000 },
];
