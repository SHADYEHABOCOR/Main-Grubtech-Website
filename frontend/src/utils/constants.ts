/**
 * Application Constants
 *
 * NOTE: API configuration (API_BASE_URL, API_ENDPOINTS, apiClient) has been moved to config/api.ts
 * Import from '../config/api' for all API-related configuration.
 */

// App Configuration
export const APP_NAME = 'Grubtech';
export const CONTACT_EMAIL = 'contact@grubtech.com';
export const SUPPORT_EMAIL = 'support@grubtech.com';

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;

// Form validation
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;

// Social Links
export const SOCIAL_LINKS = {
  linkedin: 'https://linkedin.com/company/grubtech',
  twitter: 'https://twitter.com/grubtech',
  facebook: 'https://facebook.com/grubtech',
  instagram: 'https://instagram.com/grubtech',
} as const;

// Languages
export const SUPPORTED_LANGUAGES = ['en', 'ar', 'es', 'pt'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// Restaurant Types
export const RESTAURANT_TYPES = {
  SMB: 'smb',
  REGIONAL_CHAIN: 'regional-chain',
  GLOBAL_BRAND: 'global-brand',
  DARK_KITCHEN: 'dark-kitchen',
} as const;

// Solutions
export const SOLUTIONS = {
  GONLINE: 'gOnline',
  GONLINE_LITE: 'gOnlineLite',
  GKDS: 'gKDS',
  GDISPATCH: 'gDispatch',
} as const;
