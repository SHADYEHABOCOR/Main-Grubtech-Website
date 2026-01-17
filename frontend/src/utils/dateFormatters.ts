/**
 * Date Formatting Utilities with Memoization
 *
 * These utilities cache formatted dates to avoid redundant Date object
 * creation and locale formatting operations, improving performance in
 * list components with many date fields.
 */

// Cache for formatted dates
// Key format: `${timestamp}-${formatType}-${locale}-${optionsKey}`
const dateCache = new Map<string, string>();

// Maximum cache size to prevent memory leaks
const MAX_CACHE_SIZE = 1000;

/**
 * Generates a cache key for date formatting
 */
function getCacheKey(
  dateInput: string | number | Date,
  formatType: 'date' | 'time' | 'datetime',
  locale?: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const timestamp = new Date(dateInput).getTime();
  const optionsKey = options ? JSON.stringify(options) : 'default';
  const localeKey = locale || 'default';
  return `${timestamp}-${formatType}-${localeKey}-${optionsKey}`;
}

/**
 * Clears the date formatting cache
 * Useful for testing or when memory management is needed
 */
export function clearDateCache(): void {
  dateCache.clear();
}

/**
 * Evicts oldest entries if cache exceeds maximum size
 */
function evictOldestEntries(): void {
  if (dateCache.size >= MAX_CACHE_SIZE) {
    const entriesToDelete = dateCache.size - MAX_CACHE_SIZE + 100; // Delete 100 oldest entries
    const keys = Array.from(dateCache.keys());
    for (let i = 0; i < entriesToDelete; i++) {
      dateCache.delete(keys[i]);
    }
  }
}

/**
 * Format Date with Memoization
 *
 * Formats a date using toLocaleDateString with caching to avoid
 * redundant formatting operations.
 *
 * @param dateInput - Date string, timestamp, or Date object
 * @param locale - Optional locale string (e.g., 'en-US')
 * @param options - Optional Intl.DateTimeFormatOptions
 * @returns Formatted date string
 *
 * @example
 * const formattedDate = formatDate('2024-01-15');
 * // Returns: "1/15/2024" (format depends on user's locale)
 *
 * @example
 * const formattedDate = formatDate('2024-01-15', 'en-US', {
 *   year: 'numeric',
 *   month: 'long',
 *   day: 'numeric'
 * });
 * // Returns: "January 15, 2024"
 */
export function formatDate(
  dateInput: string | number | Date,
  locale?: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const cacheKey = getCacheKey(dateInput, 'date', locale, options);

  // Return cached value if available
  if (dateCache.has(cacheKey)) {
    return dateCache.get(cacheKey)!;
  }

  // Format and cache the date
  evictOldestEntries();
  const formatted = new Date(dateInput).toLocaleDateString(locale, options);
  dateCache.set(cacheKey, formatted);

  return formatted;
}

/**
 * Format Time with Memoization
 *
 * Formats a time using toLocaleTimeString with caching to avoid
 * redundant formatting operations.
 *
 * @param dateInput - Date string, timestamp, or Date object
 * @param locale - Optional locale string (e.g., 'en-US')
 * @param options - Optional Intl.DateTimeFormatOptions
 * @returns Formatted time string
 *
 * @example
 * const formattedTime = formatTime('2024-01-15T14:30:00');
 * // Returns: "2:30:00 PM" (format depends on user's locale)
 *
 * @example
 * const formattedTime = formatTime('2024-01-15T14:30:00', 'en-US', {
 *   hour: '2-digit',
 *   minute: '2-digit'
 * });
 * // Returns: "02:30 PM"
 */
export function formatTime(
  dateInput: string | number | Date,
  locale?: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const cacheKey = getCacheKey(dateInput, 'time', locale, options);

  // Return cached value if available
  if (dateCache.has(cacheKey)) {
    return dateCache.get(cacheKey)!;
  }

  // Format and cache the time
  evictOldestEntries();
  const formatted = new Date(dateInput).toLocaleTimeString(locale, options);
  dateCache.set(cacheKey, formatted);

  return formatted;
}

/**
 * Format DateTime with Memoization
 *
 * Formats both date and time using toLocaleString with caching to avoid
 * redundant formatting operations.
 *
 * @param dateInput - Date string, timestamp, or Date object
 * @param locale - Optional locale string (e.g., 'en-US')
 * @param options - Optional Intl.DateTimeFormatOptions
 * @returns Formatted datetime string
 *
 * @example
 * const formattedDateTime = formatDateTime('2024-01-15T14:30:00');
 * // Returns: "1/15/2024, 2:30:00 PM" (format depends on user's locale)
 *
 * @example
 * const formattedDateTime = formatDateTime('2024-01-15T14:30:00', 'en-US', {
 *   year: 'numeric',
 *   month: 'short',
 *   day: 'numeric',
 *   hour: '2-digit',
 *   minute: '2-digit'
 * });
 * // Returns: "Jan 15, 2024, 02:30 PM"
 */
export function formatDateTime(
  dateInput: string | number | Date,
  locale?: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const cacheKey = getCacheKey(dateInput, 'datetime', locale, options);

  // Return cached value if available
  if (dateCache.has(cacheKey)) {
    return dateCache.get(cacheKey)!;
  }

  // Format and cache the datetime
  evictOldestEntries();
  const formatted = new Date(dateInput).toLocaleString(locale, options);
  dateCache.set(cacheKey, formatted);

  return formatted;
}

/**
 * Get cache statistics
 * Useful for monitoring and debugging
 *
 * @returns Object with cache size and max size
 */
export function getDateCacheStats(): { size: number; maxSize: number } {
  return {
    size: dateCache.size,
    maxSize: MAX_CACHE_SIZE,
  };
}
