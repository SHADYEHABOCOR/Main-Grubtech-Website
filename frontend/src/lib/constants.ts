/**
 * Design System Constants
 * Centralized configuration for layout, animations, and design tokens
 *
 * Usage:
 * import { LAYOUT, ANIMATION, COLORS } from '@/lib/constants';
 */

// ===========================================
// LAYOUT CONSTANTS
// ===========================================
export const LAYOUT = {
  /** Main container max-width: 1280px */
  maxWidth: 'max-w-7xl',
  /** Narrow content max-width: 672px */
  narrowWidth: 'max-w-narrow',
  /** Wide layout max-width: 1440px */
  wideWidth: 'max-w-wide',

  /** Standard horizontal padding for containers */
  containerPadding: 'px-4 sm:px-6 lg:px-8',

  /** Section vertical padding - responsive */
  sectionPadding: {
    default: 'py-12 sm:py-16 md:py-28',
    small: 'py-10 sm:py-12 md:py-24',
    compact: 'py-8 sm:py-10 md:py-16',
    hero: 'pt-24 pb-20 sm:pt-28 sm:pb-32 md:pt-40 md:pb-80 lg:pt-48 lg:pb-96',
  },

  /** Grid gaps */
  gridGap: {
    default: 'gap-6 md:gap-8',
    large: 'gap-8 md:gap-12',
    small: 'gap-4 md:gap-6',
  },
} as const;

// ===========================================
// ANIMATION CONSTANTS
// ===========================================
export const ANIMATION = {
  /** Default transition for most elements */
  default: 'transition-all duration-300 ease-out',
  /** Fast transition for interactive elements */
  fast: 'transition-all duration-150 ease-out',
  /** Slow transition for subtle effects */
  slow: 'transition-all duration-500 ease-out',
  /** Elegant cubic-bezier transition */
  elegant: 'transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',

  /** Framer Motion animation variants */
  framer: {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.5, ease: 'easeOut' },
    },
    fadeInUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5, ease: 'easeOut' },
    },
    fadeInDown: {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5, ease: 'easeOut' },
    },
    fadeInLeft: {
      initial: { opacity: 0, x: -30 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.5, ease: 'easeOut' },
    },
    fadeInRight: {
      initial: { opacity: 0, x: 30 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.5, ease: 'easeOut' },
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.4, ease: 'easeOut' },
    },
    staggerChildren: {
      animate: {
        transition: { staggerChildren: 0.1 },
      },
    },
  },

  /** Button hover effects */
  buttonHover: {
    scale: 1.03,
    y: -2,
    transition: { type: 'spring', stiffness: 400, damping: 17 },
  },
  buttonTap: {
    scale: 0.98,
  },
} as const;

// ===========================================
// COLOR CONSTANTS (for JS usage)
// ===========================================
export const COLORS = {
  brand: {
    primary: '#0d47c0',
    light: '#1a5fd8',
    dark: '#0a3a99',
  },
  accent: {
    default: '#ff6b35',
    light: '#ff8c5c',
    dark: '#e55a2b',
  },
  text: {
    primary: '#1a1a2e',
    secondary: '#64748b',
    tertiary: '#94a3b8',
  },
  surface: {
    white: '#ffffff',
    muted: '#f8fafc',
    subtle: '#f1f5f9',
    brandLight: '#f5faff',
  },
  semantic: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
} as const;

// ===========================================
// GRADIENT PRESETS
// ===========================================
export const GRADIENTS = {
  /** Hero section gradient (dark blue to light blue) */
  hero: 'linear-gradient(180deg, #0B1120 0%, #141B2E 15%, #1E2A45 30%, #2B4571 45%, #4A7AB8 60%, #7AA5D4 75%, #B5D4EF 85%, #E5F1FA 95%, #F8FCFF 100%)',

  /** Primary CTA gradient */
  primary: 'linear-gradient(135deg, #0d47c0 0%, #1a5fd8 100%)',

  /** Accent gradient */
  accent: 'linear-gradient(135deg, #ff6b35 0%, #ff8c5c 100%)',

  /** Subtle brand gradient for backgrounds */
  brandSubtle: 'linear-gradient(135deg, rgba(13, 71, 192, 0.05) 0%, rgba(255, 107, 53, 0.05) 100%)',

  /** Glass effect gradient */
  glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.75) 100%)',
} as const;

// ===========================================
// SHADOW PRESETS
// ===========================================
export const SHADOWS = {
  card: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
  cardHover: '0 10px 40px rgba(0, 0, 0, 0.1)',
  cardElevated: '0 20px 50px rgba(0, 0, 0, 0.12)',
  brandSmall: '0 2px 8px rgba(13, 71, 192, 0.08)',
  brand: '0 4px 20px rgba(13, 71, 192, 0.12)',
  brandLarge: '0 8px 30px rgba(13, 71, 192, 0.15)',
} as const;

// ===========================================
// BREAKPOINTS (for JS usage)
// ===========================================
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// ===========================================
// Z-INDEX SCALE
// ===========================================
export const Z_INDEX = {
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  toast: 80,
  cursor: 9999,
} as const;

// ===========================================
// COMMON CLASS COMBINATIONS
// ===========================================
export const STYLES = {
  /** Standard container with max-width and padding */
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',

  /** Section with brand-light background */
  sectionBrandLight: 'py-12 sm:py-16 md:py-28 bg-surface-brand-light',

  /** Section with white background */
  sectionWhite: 'py-12 sm:py-16 md:py-28 bg-white',

  /** Card base styles */
  card: 'bg-white rounded-card border border-gray-100 shadow-card hover:shadow-card-hover transition-shadow',

  /** Card with brand shadow */
  cardBrand: 'bg-white rounded-card-lg border border-gray-100 shadow-xl shadow-blue-500/10',

  /** Section heading */
  sectionHeading: 'text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-snug mb-3 md:mb-6',

  /** Section subheading */
  sectionSubheading: 'text-sm sm:text-base md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed',

  /** Badge pill style */
  badgePill: 'inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold',

  /** Navigation dots */
  navDot: 'h-2 md:h-2.5 rounded-full transition-all duration-300',
  navDotActive: 'w-6 md:w-10 bg-blue-600',
  navDotInactive: 'w-2 md:w-2.5 bg-gray-300 hover:bg-blue-300',

  /** Navigation arrows */
  navArrow: 'p-2 md:p-3 rounded-full bg-white border border-gray-200 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all duration-300 group shadow-sm',
} as const;

// ===========================================
// TYPE EXPORTS
// ===========================================
export type LayoutKeys = keyof typeof LAYOUT;
export type AnimationKeys = keyof typeof ANIMATION;
export type ColorKeys = keyof typeof COLORS;
export type GradientKeys = keyof typeof GRADIENTS;
export type StyleKeys = keyof typeof STYLES;
