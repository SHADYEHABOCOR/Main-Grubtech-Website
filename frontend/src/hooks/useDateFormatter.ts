import { useMemo } from 'react';
import { formatDate, formatTime, formatDateTime } from '@/utils/dateFormatters';

/**
 * Date Formatter Hook Options
 */
export interface UseDateFormatterOptions {
  /** Locale string for date formatting (e.g., 'en-US') */
  locale?: string;
  /** Intl.DateTimeFormatOptions for customizing date format */
  formatOptions?: Intl.DateTimeFormatOptions;
  /** Type of formatting to apply */
  formatType?: 'date' | 'time' | 'datetime';
}

/**
 * Date Formatter Hook
 *
 * Memoizes date formatting for arrays of items to avoid redundant
 * Date object creation and locale formatting operations on every render.
 * Useful for list components with many date fields.
 *
 * @param items - Array of items to format dates for
 * @param dateSelector - Function to extract the date field from each item
 * @param options - Optional formatting configuration
 * @returns Map of items to formatted date strings
 *
 * @example
 * // Basic usage with blog posts
 * const BlogList = ({ posts }: { posts: BlogPost[] }) => {
 *   const formattedDates = useDateFormatter(
 *     posts,
 *     post => post.publishedAt
 *   );
 *
 *   return (
 *     <ul>
 *       {posts.map(post => (
 *         <li key={post.id}>
 *           {post.title} - {formattedDates.get(post)}
 *         </li>
 *       ))}
 *     </ul>
 *   );
 * };
 *
 * @example
 * // With custom formatting options
 * const formattedDates = useDateFormatter(
 *   posts,
 *   post => post.publishedAt,
 *   {
 *     locale: 'en-US',
 *     formatOptions: {
 *       year: 'numeric',
 *       month: 'long',
 *       day: 'numeric'
 *     },
 *     formatType: 'date'
 *   }
 * );
 *
 * @example
 * // Formatting time for timestamps
 * const formattedTimes = useDateFormatter(
 *   leads,
 *   lead => lead.createdAt,
 *   { formatType: 'time' }
 * );
 */
export function useDateFormatter<T>(
  items: T[],
  dateSelector: (item: T) => string | number | Date,
  options: UseDateFormatterOptions = {}
): Map<T, string> {
  const { locale, formatOptions, formatType = 'date' } = options;

  return useMemo(() => {
    const formattedMap = new Map<T, string>();

    // Select the appropriate formatter based on formatType
    const formatter = formatType === 'time'
      ? formatTime
      : formatType === 'datetime'
      ? formatDateTime
      : formatDate;

    // Format dates for all items
    for (const item of items) {
      const dateValue = dateSelector(item);
      const formatted = formatter(dateValue, locale, formatOptions);
      formattedMap.set(item, formatted);
    }

    return formattedMap;
  }, [items, dateSelector, locale, formatOptions, formatType]);
}

/**
 * Multiple Date Formatters Hook
 *
 * Memoizes multiple date formatting operations for arrays of items.
 * Useful when you need to format both date and time separately
 * (e.g., in admin tables showing creation date and time).
 *
 * @param items - Array of items to format dates for
 * @param dateSelector - Function to extract the date field from each item
 * @param options - Formatting configuration for each formatter
 * @returns Object with separate Maps for each formatter
 *
 * @example
 * // Format both date and time for leads
 * const LeadsList = ({ leads }: { leads: Lead[] }) => {
 *   const { dates, times } = useMultipleDateFormatters(
 *     leads,
 *     lead => lead.createdAt,
 *     {
 *       dates: { formatType: 'date' },
 *       times: { formatType: 'time' }
 *     }
 *   );
 *
 *   return (
 *     <ul>
 *       {leads.map(lead => (
 *         <li key={lead.id}>
 *           Date: {dates.get(lead)} Time: {times.get(lead)}
 *         </li>
 *       ))}
 *     </ul>
 *   );
 * };
 */
export function useMultipleDateFormatters<T>(
  items: T[],
  dateSelector: (item: T) => string | number | Date,
  formatters: Record<string, UseDateFormatterOptions>
): Record<string, Map<T, string>> {
  return useMemo(() => {
    const result: Record<string, Map<T, string>> = {};

    for (const [key, options] of Object.entries(formatters)) {
      const { locale, formatOptions, formatType = 'date' } = options;
      const formattedMap = new Map<T, string>();

      // Select the appropriate formatter based on formatType
      const formatter = formatType === 'time'
        ? formatTime
        : formatType === 'datetime'
        ? formatDateTime
        : formatDate;

      // Format dates for all items
      for (const item of items) {
        const dateValue = dateSelector(item);
        const formatted = formatter(dateValue, locale, formatOptions);
        formattedMap.set(item, formatted);
      }

      result[key] = formattedMap;
    }

    return result;
  }, [items, dateSelector, formatters]);
}
