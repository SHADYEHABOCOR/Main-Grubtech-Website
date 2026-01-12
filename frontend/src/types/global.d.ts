/**
 * Global Type Definitions
 *
 * Extends Window interface and provides types for third-party scripts
 * that are loaded dynamically (analytics, tracking, etc.)
 */

// Google Analytics / gtag
interface GtagFunction {
  (command: 'config', targetId: string, config?: Record<string, unknown>): void;
  (command: 'event', eventName: string, eventParams?: Record<string, unknown>): void;
  (command: 'consent', action: 'update' | 'default', params: Record<string, string>): void;
  (command: 'set', params: Record<string, unknown>): void;
  (...args: unknown[]): void;
}

// Mixpanel
interface MixpanelInstance {
  init(token: string, config?: Record<string, unknown>): void;
  track(event: string, properties?: Record<string, unknown>): void;
  identify(userId: string): void;
  people: {
    set(properties: Record<string, unknown>): void;
  };
  opt_out_tracking(): void;
  opt_in_tracking(): void;
}

// Hotjar
interface HotjarInstance {
  (...args: unknown[]): void;
  q?: unknown[];
}

// Microsoft Clarity
interface ClarityFunction {
  (...args: unknown[]): void;
  q?: unknown[];
}

// Lenis smooth scroll
interface LenisInstance {
  raf(time: number): void;
  destroy(): void;
  on(event: string, callback: (e: unknown) => void): void;
  scrollTo(target: string | number | HTMLElement, options?: Record<string, unknown>): void;
}

// Extend Window interface
declare global {
  interface Window {
    // Google Analytics
    dataLayer: unknown[];
    gtag: GtagFunction;

    // Mixpanel
    mixpanel?: MixpanelInstance;

    // Hotjar
    hj?: HotjarInstance;
    _hjSettings?: {
      hjid: number;
      hjsv: number;
    };

    // Microsoft Clarity
    clarity?: ClarityFunction;

    // Lenis smooth scroll
    lenis?: LenisInstance | null;

    // Request Idle Callback (not available in all browsers)
    requestIdleCallback?: (
      callback: IdleRequestCallback,
      options?: IdleRequestOptions
    ) => number;
    cancelIdleCallback?: (handle: number) => void;
  }
}

// Idle callback types (for browsers that don't support it)
interface IdleDeadline {
  readonly didTimeout: boolean;
  timeRemaining(): number;
}

type IdleRequestCallback = (deadline: IdleDeadline) => void;

interface IdleRequestOptions {
  timeout?: number;
}

// API Error Response type
export interface ApiErrorResponse {
  code?: string;
  message?: string;
  status?: number;
}

// Axios-like error type
export interface NetworkError extends Error {
  response?: {
    status: number;
    data?: ApiErrorResponse;
  };
  code?: string;
  isRateLimited?: boolean;
  retryAfter?: number;
  config?: {
    url?: string;
  };
}

// Translation return objects
export interface TranslationValue {
  title?: string;
  description?: string;
  icon?: string;
  label?: string;
  path?: string;
  year?: string | number;
  name?: string;
  location?: string;
  [key: string]: unknown;
}

// Blog post from API
export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  created_at: string;
  updated_at: string;
  published: boolean;
}

// Career/Job from API
export interface Career {
  id: number;
  slug: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements?: string;
  published: boolean;
}

// Integration from API
export interface Integration {
  id: number;
  slug: string;
  name: string;
  category: string;
  description: string;
  logo_url?: string;
  website?: string;
  published: boolean;
}

// Policy page from API
export interface Policy {
  id: number;
  slug: string;
  title: string;
  content: string;
  meta_description: string | null;
  status: 'published' | 'draft';
  created_at: string;
  updated_at: string;
}

export {};
