import dotenv from "dotenv";

dotenv.config();

/**
 * Validates that required environment variables are set
 * @param {string} key - Environment variable key
 * @param {string} [defaultValue] - Optional default value
 * @returns {string} The environment variable value
 * @throws {Error} If required variable is missing
 */
const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

/**
 * Node environment configuration
 */
export const NODE_ENV = getEnvVar("NODE_ENV", "development");

/**
 * Server configuration
 */
export const SERVER_CONFIG = {
  PORT: parseInt(getEnvVar("PORT", "3001"), 10),
  HOST: "0.0.0.0",
} as const;

/**
 * Cookie configuration
 */
export const COOKIE_CONFIG = {
  MAX_AGE: 3 * 60 * 60, // 3 HOURS
  HTTP_ONLY: NODE_ENV === "production",
  SAME_SITE: "strict",
  SECURE: true,
  DOMAIN: process.env.COOKIE_DOMAIN,
  PATH: "/",
} as const;

/**
 * Supabase configuration
 */
export const SUPABASE_CONFIG = {
  URL: getEnvVar("SUPABASE_URL"),
  SERVICE_ROLE_KEY: getEnvVar("SUPABASE_SERVICE_ROLE_KEY", ""),
} as const;

/**
 * Upstash Redis configuration
 */
export const REDIS_CONFIG = {
  URL: getEnvVar("UPSTASH_REDIS_REST_URL", ""),
  TOKEN: getEnvVar("UPSTASH_REDIS_REST_TOKEN", ""),
} as const;

/**
 * CORS configuration
 */
export const CORS_CONFIG = {
  ORIGIN: getEnvVar("CORS_ORIGIN", "*"),
  CREDENTIALS: true,
} as const;

/**
 * Rate limiting configuration
 */
export const RATE_LIMIT_CONFIG = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 6,
} as const;

export const LOOSE_RATE_LIMIT_CONFIG = {
  WINDOW_MS: 60 * 1000, // 1 minute
  MAX_REQUESTS: 20,
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

/**
 * File upload configuration
 */
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_MIME_TYPES: ["image/jpeg", "image/png", "image/webp"],
} as const;

/**
 * Session configuration";
 */
export const SESSION_CONFIG = {
  MAX_ACTIVE_SESSIONS: 5,
  SESSION_TTL: 7 * 24 * 60 * 60 // 7 days
};

export const LOGIN_ATTEMPT_CONFIG = {
  ATTEMPT_WINDOW: 1 * 60 * 60, // 1 hour
  MAX_ATTEMPTS: 5,
  LOCK_DURATION: 30 * 60 // 30 minutes
}

export const PREFIX_CONFIG = {
  SESSION_PREFIX: "session:",
  DEVICE_SESSION_PREFIX: "device_session:",
  ACTIVE_SESSIONS_PREFIX: "active_sessions:",
  SESSION_SET_PREFIX: "user:sessions:",
  USER_AUTH_INFO_PREFIX: "auth:user:",
  RATE_LIMIT_PREFIX: "rate_limit:",
  BLOCKED_IP_PREFIX: "blocked_ip:",
  BLOCKED_EMAIL_PREFIX: "blocked_email:",
  FAILED_LOGIN_PREFIX: "failed_login:",
  LOCK_ACCOUNT_PREFIX: "lock_account:",
  CSRF_PREFIX: "csrf:",
};

/**
 * Helper methods
 */
export const isDevelopment = (): boolean => NODE_ENV === "development";
export const isProduction = (): boolean => NODE_ENV === "production";
export const isTest = (): boolean => NODE_ENV === "test";
