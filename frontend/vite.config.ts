import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { imagetools } from 'vite-imagetools';
import { visualizer } from 'rollup-plugin-visualizer';

// Check if we're in analyze mode
const isAnalyze = process.env.ANALYZE === 'true';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer - only enabled when running `npm run build:analyze`
    isAnalyze && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap', // Options: 'sunburst', 'treemap', 'network'
    }),
    imagetools({
      defaultDirectives: (_url) => {
        // Apply WebP conversion and optimization to all images
        return new URLSearchParams({
          format: 'webp',
          quality: '80',
        });
      },
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png'],
      manifest: false, // We're using our custom manifest.json
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        // Increase cache size limits for better performance
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
        // Precache critical routes for offline support
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/admin/],
        runtimeCaching: [
          // Static assets with long-term caching
          {
            urlPattern: /\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            urlPattern: /\/api\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5 // 5 minutes
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: false
      }
    })
  ],
  optimizeDeps: {
    // PERF FIX: lucide-react was EXCLUDED, causing 1500+ individual icon requests in dev
    // By INCLUDING it, Vite pre-bundles all icons into a single file
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',  // This prevents 1500+ individual icon file requests
    ],
  },
  build: {
    // Target modern browsers for smaller bundles
    target: 'esnext',
    // Enable CSS code splitting for better caching and parallel loading
    cssCodeSplit: true,
    // Inline small CSS files (< 4KB) directly into JS to reduce HTTP requests
    // Larger CSS files are extracted for better caching
    assetsInlineLimit: 4096,
    // Enable hidden source maps for Sentry error tracking
    // 'hidden' means they're generated but not linked in the JS files
    // Upload these to Sentry during deployment for readable stack traces
    sourcemap: 'hidden',
    rollupOptions: {
      output: {
        // Optimize chunk naming for better caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
manualChunks: {
          // Group all vendor chunks explicitly to avoid circular dependency issues
          'vendor-react': ['react', 'react-dom', 'scheduler'],
          'vendor-router': ['react-router', 'react-router-dom'],
          'vendor-animations': ['framer-motion'],
          'vendor-i18n': ['i18next', 'react-i18next', 'i18next-browser-languagedetector', 'i18next-http-backend'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-sentry': ['@sentry/react'],
          'vendor-charts': ['recharts'],
          'vendor-seo': ['react-helmet-async'],
          'vendor-scroll': ['lenis'],
          'vendor-sanitize': ['dompurify'],
          'vendor-http': ['axios'],
          'vendor-icons': ['lucide-react'],
          'vendor-vitals': ['web-vitals'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
    // Remove console statements in production build
    // Keeps console.error for critical error reporting
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Don't drop all - we want to keep console.error
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 2,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
  },
});
