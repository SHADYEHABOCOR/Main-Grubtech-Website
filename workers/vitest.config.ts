import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
  test: {
    globals: true,
    testTimeout: 10000, // 10 seconds for async operations
    pool: '@cloudflare/vitest-pool-workers',
    poolOptions: {
      workers: {
        wrangler: {
          configPath: './wrangler.toml',
        },
        miniflare: {
          // Bindings for testing
          d1Databases: ['DB'],
          kvNamespaces: ['CACHE'],
          r2Buckets: ['UPLOADS'],
          bindings: {
            // Test environment variables
            ENVIRONMENT: 'test',
            ALLOWED_ORIGINS: 'http://localhost:3000',
            LOG_LEVEL: 'debug',
            RATE_LIMIT_WINDOW_MS: '60000',
            RATE_LIMIT_MAX_REQUESTS: '1000',
            // Test secrets (use test values, never real credentials)
            JWT_SECRET: 'test-jwt-secret-for-testing-only',
            EMAIL_API_KEY: 'test-email-api-key',
            ADMIN_EMAIL: 'test@example.com',
          },
        },
      },
    },
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        'migrations/',
        'scripts/',
      ],
    },
  },
});
