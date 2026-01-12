import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';
import './i18n/config';
import { LanguageProvider } from './context/LanguageContext';
import { queryClient } from './lib/queryClient';
import { initSentry, captureError } from './lib/sentry';

// ===========================================
// Initialize Error Monitoring (before anything else)
// ===========================================
initSentry();

// ===========================================
// Suppress Known Recharts Warnings
// ===========================================
// Filter out the Recharts dimension warning that appears during initial render
// The charts use useChartReady hook to wait for proper dimensions before rendering
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  const message = args[0];
  if (
    typeof message === 'string' &&
    message.includes('width(-1) and height(-1)') &&
    message.includes('chart should be greater than 0')
  ) {
    // Suppress this specific warning - it's expected during initial chart mount
    return;
  }
  originalWarn.apply(console, args);
};

// ===========================================
// Global Error Handlers
// ===========================================

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  console.error('Unhandled Promise Rejection:', event.reason);

  // Prevent the default browser behavior (logging to console twice)
  event.preventDefault();

  // Send to Sentry (it will only capture if initialized)
  if (event.reason instanceof Error) {
    captureError(event.reason, { type: 'unhandledrejection' });
  }
});

// Handle global JavaScript errors
window.addEventListener('error', (event: ErrorEvent) => {
  console.error('Global Error:', event.error || event.message);

  // Send to Sentry (it will only capture if initialized)
  if (event.error instanceof Error) {
    captureError(event.error, { type: 'global_error' });
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </QueryClientProvider>
  </StrictMode>
);
