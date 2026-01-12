/**
 * Environment Configuration with Validation
 *
 * This module provides type-safe environment variable validation
 * using Zod. It ensures all required variables are set at startup
 * and provides sensible defaults for optional ones.
 *
 * AWS Deployment: Use AWS Secrets Manager or Parameter Store
 * to inject these values at runtime.
 */

import { z, ZodError } from 'zod';

// Helper for transforming string to number with default
const stringToNumber = (defaultValue: number) =>
  z.string().default(String(defaultValue)).transform(Number);

// Helper for transforming string to boolean with default
const stringToBoolean = (defaultValue: boolean) =>
  z.string().default(String(defaultValue)).transform(v => v === 'true');

// Environment schema with strict validation
const envSchema = z.object({
  // Server Configuration
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: stringToNumber(3001),

  // Security (REQUIRED in production)
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // Admin Setup (only used for initial setup, should be removed after)
  ADMIN_USERNAME: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),
  SETUP_SECRET_TOKEN: z.string().min(32).optional(),

  // Frontend URL for CORS
  FRONTEND_URL: z.string().url().optional(),
  ALLOWED_ORIGINS: z.string().optional(), // Comma-separated list of allowed origins

  // Database Configuration
  // SQLite (development) or PostgreSQL (production)
  DATABASE_TYPE: z.enum(['sqlite', 'postgres']).default('sqlite'),
  DATABASE_URL: z.string().optional(), // PostgreSQL connection string
  DATABASE_PATH: z.string().default('./grubtech.db'), // SQLite path
  DATABASE_POOL_MIN: stringToNumber(2),
  DATABASE_POOL_MAX: stringToNumber(10),

  // AWS S3 Configuration (for file uploads in production)
  STORAGE_TYPE: z.enum(['local', 's3']).default('local'),
  AWS_REGION: z.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET_NAME: z.string().optional(),
  CLOUDFRONT_URL: z.string().url().optional(), // CDN URL for serving images

  // Email Configuration (optional - graceful degradation if not set)
  EMAIL_ENABLED: stringToBoolean(false),
  EMAIL_HOST: z.string().optional(),
  EMAIL_PORT: z.string().transform(Number).optional(),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASS: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
  ADMIN_EMAIL: z.string().email().optional(),

  // Logging Configuration
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
  LOG_FORMAT: z.enum(['json', 'pretty']).default('json'),

  // Rate Limiting Configuration
  // Login rate limiter (protects against brute force attacks)
  LOGIN_RATE_LIMIT_WINDOW_MS: stringToNumber(15 * 60 * 1000), // 15 minutes
  LOGIN_RATE_LIMIT_MAX: stringToNumber(
    process.env.NODE_ENV === 'production' ? 20 : 100 // Higher limit in dev
  ),

  // API rate limiter (general request throttling)
  API_RATE_LIMIT_WINDOW_MS: stringToNumber(15 * 60 * 1000), // 15 minutes
  API_RATE_LIMIT_MAX: stringToNumber(
    process.env.NODE_ENV === 'production' ? 1000 : 5000 // Higher limit in dev
  ),

  // Analytics rate limiter (for tracking endpoints)
  ANALYTICS_RATE_LIMIT_WINDOW_MS: stringToNumber(1 * 60 * 1000), // 1 minute
  ANALYTICS_RATE_LIMIT_MAX: stringToNumber(
    process.env.NODE_ENV === 'production' ? 500 : 2000 // Higher limit in dev
  ),

  // Lead form rate limiter (protects against spam)
  LEAD_RATE_LIMIT_WINDOW_MS: stringToNumber(60 * 60 * 1000), // 1 hour
  LEAD_RATE_LIMIT_MAX: stringToNumber(
    process.env.NODE_ENV === 'production' ? 10 : 50 // Higher limit in dev
  ),

  // Setup rate limiter (protects against setup token brute-forcing)
  SETUP_RATE_LIMIT_WINDOW_MS: stringToNumber(60 * 60 * 1000), // 1 hour
  SETUP_RATE_LIMIT_MAX: stringToNumber(5), // 5 attempts per hour

  // Legacy rate limiting (deprecated - use specific limiters above)
  RATE_LIMIT_WINDOW_MS: stringToNumber(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: stringToNumber(1000),

  // Feature Flags
  ENABLE_SETUP_ADMIN: stringToBoolean(false),
  ENABLE_ANALYTICS: stringToBoolean(true),
});

// Type for validated environment
export type Env = z.infer<typeof envSchema>;

// Validate environment and export
function validateEnv(): Env {
  try {
    const env = envSchema.parse(process.env);

    // Additional production validations
    if (env.NODE_ENV === 'production') {
      // JWT_SECRET must not be the default
      if (env.JWT_SECRET.includes('change') || env.JWT_SECRET.length < 64) {
        throw new Error('Production JWT_SECRET must be a secure 64+ character string');
      }

      // S3 must be configured in production (no local file storage)
      if (env.STORAGE_TYPE === 'local') {
        console.warn('[WARNING] Using local storage in production. Consider using S3.');
      }

      // PostgreSQL recommended in production
      if (env.DATABASE_TYPE === 'sqlite') {
        console.warn('[WARNING] Using SQLite in production. Consider using PostgreSQL/RDS.');
      }

      // Setup admin should be disabled
      if (env.ENABLE_SETUP_ADMIN) {
        throw new Error('ENABLE_SETUP_ADMIN must be false in production');
      }
    }

    // Validate setup admin token requirement
    if (env.ENABLE_SETUP_ADMIN && !env.SETUP_SECRET_TOKEN) {
      throw new Error('SETUP_SECRET_TOKEN is required when ENABLE_SETUP_ADMIN is true');
    }

    return env;
  } catch (error) {
    if (error instanceof ZodError) {
      const missingVars = error.issues.map((e: z.ZodIssue) => `  - ${e.path.join('.')}: ${e.message}`);
      console.error('\n============================================');
      console.error('ENVIRONMENT VALIDATION FAILED');
      console.error('============================================');
      console.error('The following environment variables have issues:\n');
      console.error(missingVars.join('\n'));
      console.error('\n============================================');
      console.error('Please check your .env file or environment variables.');
      console.error('============================================\n');
      process.exit(1);
    }
    throw error;
  }
}

// Export validated environment
export const env = validateEnv();

// Helper to check if we're in production
export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
export const isStaging = env.NODE_ENV === 'staging';

// Export allowed origins as array
export const getAllowedOrigins = (): string[] => {
  const origins: string[] = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:4173',
    'http://localhost:3000',
  ];

  if (env.FRONTEND_URL) {
    origins.push(env.FRONTEND_URL);
  }

  if (env.ALLOWED_ORIGINS) {
    origins.push(...env.ALLOWED_ORIGINS.split(',').map(o => o.trim()));
  }

  return origins.filter(Boolean);
};