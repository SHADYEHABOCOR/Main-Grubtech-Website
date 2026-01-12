/**
 * HTML Sanitization Utility
 *
 * Provides XSS protection for dynamic HTML content using DOMPurify.
 * Sanitizes HTML with secure defaults while preserving safe formatting elements.
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 *
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML safe for rendering with dangerouslySetInnerHTML
 *
 * @example
 * ```tsx
 * <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />
 * ```
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'ul',
      'ol',
      'li',
      'a',
      'blockquote',
      'code',
      'pre',
      'img',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'hr',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Strip all HTML tags and return plain text
 *
 * Safely removes all HTML tags and returns only the text content.
 * Uses DOMPurify to avoid DOM-based XSS vulnerabilities.
 *
 * @param html - The HTML string to strip
 * @returns Plain text content without any HTML tags
 *
 * @example
 * ```ts
 * const text = stripHtml('<p>Hello <strong>world</strong></p>');
 * // Returns: "Hello world"
 * ```
 */
export function stripHtml(html: string): string {
  // Use DOMPurify to strip all tags (ALLOWED_TAGS: [])
  // This is safer than using DOM manipulation directly
  const cleaned = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });

  return cleaned;
}
