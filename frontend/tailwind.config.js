/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // ===========================================
      // BRAND COLORS
      // ===========================================
      colors: {
        // Primary brand color - Main blue
        brand: {
          DEFAULT: '#0d47c0',
          light: '#1a5fd8',
          dark: '#0a3a99',
          50: '#f0f5ff',
          100: '#e0ebff',
          200: '#c7dbff',
          300: '#a3c4ff',
          400: '#7aa5ff',
          500: '#5585ff',
          600: '#0d47c0',
          700: '#0a3a99',
          800: '#082d75',
          900: '#061f52',
        },
        // Accent color - Orange (for highlights)
        accent: {
          DEFAULT: '#ff6b35',
          light: '#ff8c5c',
          dark: '#e55a2b',
        },
        // Legacy primary alias (for backwards compatibility)
        primary: {
          DEFAULT: '#0d47c0',
          light: '#1a5fd8',
          dark: '#0a3a99',
          50: '#f0f5ff',
          100: '#e0ebff',
          200: '#c7dbff',
          300: '#a3c4ff',
          400: '#7aa5ff',
          500: '#5585ff',
          600: '#0d47c0',
          700: '#0a3a99',
          800: '#082d75',
          900: '#061f52',
        },

        // ===========================================
        // SURFACE COLORS (Backgrounds)
        // ===========================================
        surface: {
          DEFAULT: '#ffffff',           // Main white background
          elevated: '#ffffff',          // Cards, floating elements
          muted: '#f8fafc',             // Subtle gray background
          subtle: '#f1f5f9',            // Even more subtle
          'brand-light': '#f5faff',     // Light blue (30% brighter than blue-50)
          'brand-50': '#eff6ff',        // Standard blue-50
        },
        // Legacy background alias
        background: {
          DEFAULT: '#ffffff',
          alt: '#f8fafc',
          subtle: '#f1f5f9',
          'blue-light': '#f5faff',
        },

        // ===========================================
        // TEXT COLORS
        // ===========================================
        text: {
          primary: '#1a1a2e',           // Headings, important text
          secondary: '#64748b',          // Body text, descriptions
          tertiary: '#94a3b8',           // Muted text, placeholders
          inverse: '#ffffff',            // Text on dark backgrounds
          brand: '#0d47c0',              // Brand-colored text
        },

        // ===========================================
        // BORDER COLORS
        // ===========================================
        border: {
          DEFAULT: '#e2e8f0',
          light: '#f1f5f9',
          dark: '#cbd5e1',
        },

        // ===========================================
        // SEMANTIC COLORS
        // ===========================================
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },

      // ===========================================
      // TYPOGRAPHY
      // ===========================================
      fontFamily: {
        sans: [
          'Satoshi',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        brand: ['Pacifico', 'cursive'],
      },
      fontSize: {
        // Display sizes (for hero sections)
        'display-1': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-2': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-3': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.01em', fontWeight: '700' }],

        // Heading sizes
        'heading-1': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        'heading-2': ['2rem', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '700' }],
        'heading-3': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        'heading-4': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],

        // Body sizes
        'body-lg': ['1.125rem', { lineHeight: '1.75' }],
        'body': ['1rem', { lineHeight: '1.75' }],
        'body-sm': ['0.875rem', { lineHeight: '1.6' }],

        // Caption/utility sizes
        'caption': ['0.75rem', { lineHeight: '1.5' }],
        'overline': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.05em', fontWeight: '600' }],
      },
      lineHeight: {
        tight: '1.1',
        snug: '1.25',
        relaxed: '1.75',
      },
      letterSpacing: {
        tighter: '-0.02em',
        tight: '-0.01em',
        wide: '0.02em',
        wider: '0.05em',
      },

      // ===========================================
      // SPACING & LAYOUT
      // ===========================================
      spacing: {
        // Section spacing
        'section': '7rem',              // 112px - Large section padding
        'section-sm': '4rem',           // 64px - Smaller section padding
        'section-xs': '2.5rem',         // 40px - Compact section padding

        // Container padding
        'container': '2rem',            // 32px
        'container-sm': '1rem',         // 16px

        // Component spacing
        '18': '4.5rem',
        '88': '22rem',
      },
      maxWidth: {
        'container': '80rem',           // 1280px - Main container
        'content': '65ch',              // Optimal reading width
        'narrow': '42rem',              // Narrow content sections
        'wide': '90rem',                // Wide layouts
      },

      // ===========================================
      // BORDER RADIUS
      // ===========================================
      borderRadius: {
        'card': '1rem',                 // 16px - Cards, modals
        'card-lg': '1.5rem',            // 24px - Large cards
        'button': '9999px',             // Fully rounded buttons
        'input': '0.5rem',              // 8px - Form inputs
        'badge': '9999px',              // Fully rounded badges
        'section': '2rem',              // 32px - Section corners
        // Legacy
        'elegant': '1rem',
        'smooth': '0.75rem',
      },

      // ===========================================
      // BOX SHADOWS
      // ===========================================
      boxShadow: {
        // Card shadows
        'card': '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 10px 40px rgba(0, 0, 0, 0.1)',
        'card-elevated': '0 20px 50px rgba(0, 0, 0, 0.12)',

        // Brand shadows (blue tinted)
        'brand-sm': '0 2px 8px rgba(13, 71, 192, 0.08)',
        'brand': '0 4px 20px rgba(13, 71, 192, 0.12)',
        'brand-lg': '0 8px 30px rgba(13, 71, 192, 0.15)',

        // Utility shadows
        'soft': '0 2px 15px rgba(0, 0, 0, 0.05)',
        'inner-soft': 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',

        // Legacy
        'elegant': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'elegant-lg': '0 8px 30px rgba(0, 0, 0, 0.12)',
        'elegant-xl': '0 20px 50px rgba(0, 0, 0, 0.15)',
        'inner-elegant': 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
      },

      // ===========================================
      // TEXT SHADOWS
      // ===========================================
      textShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.1)',
        'DEFAULT': '0 2px 4px rgba(0, 0, 0, 0.15)',
        'lg': '0 3px 6px rgba(0, 0, 0, 0.2)',
        'subtitle': '1px 1px 2px rgba(0, 0, 0, 0.2), 0 0 1em rgba(0, 0, 0, 0.1)',
        'elegant': '0 2px 8px rgba(0, 0, 0, 0.1)',
      },

      // ===========================================
      // BACKDROP BLUR
      // ===========================================
      backdropBlur: {
        'elegant': '12px',
        'glass': '16px',
      },

      // ===========================================
      // ANIMATIONS
      // ===========================================
      animation: {
        // Legacy animations (kept for backwards compatibility)
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',

        // New framer-motion replacement animations
        'fade-in-up': 'fade-in-up 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'fade-in-up-fast': 'fade-in-up 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'fade-in-up-slow': 'fade-in-up 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',

        'fade-in-down': 'fade-in-down 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'fade-in-down-fast': 'fade-in-down 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'fade-in-down-slow': 'fade-in-down 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',

        'fade-in-left': 'fade-in-left 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'fade-in-left-fast': 'fade-in-left 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'fade-in-left-slow': 'fade-in-left 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',

        'fade-in-right': 'fade-in-right 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'fade-in-right-fast': 'fade-in-right 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'fade-in-right-slow': 'fade-in-right 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',

        'scale-fade-in': 'scale-fade-in 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'scale-fade-in-fast': 'scale-fade-in 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'scale-fade-in-slow': 'scale-fade-in 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
      },
      keyframes: {
        // Legacy keyframes
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },

        // New framer-motion replacement keyframes
        'fade-in-up': {
          from: {
            opacity: '0',
            transform: 'translate3d(0, 20px, 0)',
          },
          to: {
            opacity: '1',
            transform: 'translate3d(0, 0, 0)',
          },
        },
        'fade-in-down': {
          from: {
            opacity: '0',
            transform: 'translate3d(0, -20px, 0)',
          },
          to: {
            opacity: '1',
            transform: 'translate3d(0, 0, 0)',
          },
        },
        'fade-in-left': {
          from: {
            opacity: '0',
            transform: 'translate3d(-20px, 0, 0)',
          },
          to: {
            opacity: '1',
            transform: 'translate3d(0, 0, 0)',
          },
        },
        'fade-in-right': {
          from: {
            opacity: '0',
            transform: 'translate3d(20px, 0, 0)',
          },
          to: {
            opacity: '1',
            transform: 'translate3d(0, 0, 0)',
          },
        },
        'scale-fade-in': {
          from: {
            opacity: '0',
            transform: 'translate3d(0, 0, 0) scale(0.95)',
          },
          to: {
            opacity: '1',
            transform: 'translate3d(0, 0, 0) scale(1)',
          },
        },
      },

      // ===========================================
      // ANIMATION UTILITIES
      // Staggered animation delays, fill modes, and timing functions
      // ===========================================
      animationDelay: {
        '0': '0ms',
        '100': '100ms',
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
        '600': '600ms',
        '700': '700ms',
        '800': '800ms',
        '1000': '1000ms',
        '2000': '2000ms',
        '4000': '4000ms',
      },
      animationFillMode: {
        'none': 'none',
        'forwards': 'forwards',
        'backwards': 'backwards',
        'both': 'both',
      },

      // ===========================================
      // TRANSITIONS
      // ===========================================
      transitionTimingFunction: {
        'elegant': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        // Framer-motion easing equivalents
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '300ms',
        'slow': '500ms',
        // Framer-motion typical durations
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
        '600': '600ms',
      },
    },
  },
  plugins: [
    typography,
    // Text shadow utility plugin
    function({ matchUtilities, theme }) {
      matchUtilities(
        {
          'text-shadow': (value) => ({
            textShadow: value,
          }),
        },
        { values: theme('textShadow') }
      )
    },
    // Animation delay utility plugin
    function({ matchUtilities, theme }) {
      matchUtilities(
        {
          'animation-delay': (value) => ({
            animationDelay: value,
          }),
        },
        { values: theme('animationDelay') }
      )
    },
    // Animation fill mode utility plugin
    function({ matchUtilities, theme }) {
      matchUtilities(
        {
          'animation-fill': (value) => ({
            animationFillMode: value,
          }),
        },
        { values: theme('animationFillMode') }
      )
    },
  ],
};
