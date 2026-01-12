import type { TableRow, RecentOrder } from '../types';

/**
 * Sales Summary Table Data
 * Detailed breakdown of sales by date including orders, gross sales, discounts, net sales, VAT, and averages
 */
export const tableData: TableRow[] = [
  { date: 'Total', orders: 704, curr: 'AED', gross: '59,194.95', disc: '3,065.84', earn: '56,129.11', vat: '2,672.34', net: '53,456.77', avg: '84.10', isTotal: true },
  { date: '2025/12/04', orders: 89, curr: 'AED', gross: '6,245.00', disc: '312.25', earn: '5,932.75', vat: '282.51', net: '5,650.24', avg: '70.17' },
  { date: '2025/12/05', orders: 108, curr: 'AED', gross: '8,873.00', disc: '415.15', earn: '8,457.85', vat: '402.75', net: '8,055.10', avg: '82.16' },
  { date: '2025/12/06', orders: 126, curr: 'AED', gross: '12,986.00', disc: '608.80', earn: '12,377.20', vat: '589.39', net: '11,787.81', avg: '103.06' },
  { date: '2025/12/07', orders: 100, curr: 'AED', gross: '8,610.33', disc: '434.50', earn: '8,175.83', vat: '389.33', net: '7,786.50', avg: '86.10' },
  { date: '2025/12/08', orders: 95, curr: 'AED', gross: '7,980.62', disc: '399.03', earn: '7,581.59', vat: '361.03', net: '7,220.56', avg: '84.01' },
  { date: '2025/12/09', orders: 102, curr: 'AED', gross: '8,500.00', disc: '425.00', earn: '8,075.00', vat: '384.52', net: '7,690.48', avg: '83.33' },
  { date: '2025/12/10', orders: 84, curr: 'AED', gross: '6,000.00', disc: '471.11', earn: '5,528.89', vat: '263.33', net: '5,265.56', avg: '71.43' },
];

/**
 * Recent Orders Data
 * List of most recent orders displayed in the Home Dashboard
 */
export const recentOrders: RecentOrder[] = [
  { id: '#ORD-2847', customer: 'Ahmed Hassan', channel: 'Talabat', amount: '87.50', status: 'Completed', time: '2 min ago' },
  { id: '#ORD-2846', customer: 'Sara Ali', channel: 'Careem', amount: '124.00', status: 'Preparing', time: '5 min ago' },
  { id: '#ORD-2845', customer: 'Mohammed Khalid', channel: 'Pickup', amount: '56.25', status: 'Completed', time: '8 min ago' },
  { id: '#ORD-2844', customer: 'Fatima Omar', channel: 'Dine-In', amount: '203.75', status: 'Completed', time: '12 min ago' },
  { id: '#ORD-2843', customer: 'Youssef Nabil', channel: 'Deliveroo', amount: '98.00', status: 'In Transit', time: '15 min ago' },
];
