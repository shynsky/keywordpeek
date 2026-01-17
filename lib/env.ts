/**
 * Environment Variable Validation
 *
 * Validates all required environment variables at import time.
 * Import this module early in your application to catch missing vars.
 */

type EnvConfig = {
  name: string;
  required: boolean;
  isPublic?: boolean;
};

const ENV_VARS: EnvConfig[] = [
  // Supabase
  { name: "NEXT_PUBLIC_SUPABASE_URL", required: true, isPublic: true },
  { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", required: true, isPublic: true },
  { name: "SUPABASE_SERVICE_ROLE_KEY", required: true },

  // Stripe
  { name: "STRIPE_SECRET_KEY", required: true },
  { name: "STRIPE_WEBHOOK_SECRET", required: true },

  // DataForSEO (either AUTH or LOGIN+PASSWORD)
  { name: "DATAFORSEO_LOGIN", required: false },
  { name: "DATAFORSEO_PASSWORD", required: false },
  { name: "DATAFORSEO_AUTH", required: false },

  // OpenAI
  { name: "OPENAI_API_KEY", required: true },

  // Sentry (optional but recommended for production)
  { name: "NEXT_PUBLIC_SENTRY_DSN", required: false, isPublic: true },
  { name: "SENTRY_AUTH_TOKEN", required: false },

  // Vercel KV (optional, for distributed rate limiting)
  { name: "KV_REST_API_URL", required: false },
  { name: "KV_REST_API_TOKEN", required: false },

  // Development
  { name: "DEV_USER_ID", required: false },
  { name: "NEXT_PUBLIC_DEV_USER_ID", required: false, isPublic: true },
];

export interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

/**
 * Validate environment variables and return results
 */
export function validateEnv(): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const config of ENV_VARS) {
    const value = process.env[config.name];

    if (config.required && !value) {
      missing.push(config.name);
    }
  }

  // Special validation: DataForSEO requires either AUTH or LOGIN+PASSWORD
  const hasDataForSEOAuth = process.env.DATAFORSEO_AUTH;
  const hasDataForSEOCreds =
    process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD;

  if (!hasDataForSEOAuth && !hasDataForSEOCreds) {
    missing.push(
      "DATAFORSEO_AUTH or (DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD)"
    );
  }

  // Warnings for recommended optional vars in production
  if (
    process.env.NODE_ENV === "production" &&
    !process.env.NEXT_PUBLIC_SENTRY_DSN
  ) {
    warnings.push(
      "NEXT_PUBLIC_SENTRY_DSN is not set. Error monitoring is disabled."
    );
  }

  if (
    process.env.NODE_ENV === "production" &&
    !process.env.KV_REST_API_URL
  ) {
    warnings.push(
      "KV_REST_API_URL is not set. Rate limiting will use in-memory storage (resets on deploy)."
    );
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * Validate environment variables and throw if invalid
 * Call this at application startup
 */
export function assertEnv(): void {
  const result = validateEnv();

  if (!result.valid) {
    const message = [
      "Missing required environment variables:",
      ...result.missing.map((name) => `  - ${name}`),
      "",
      "Please set these variables in your .env.local file or deployment configuration.",
    ].join("\n");

    throw new Error(message);
  }

  // Log warnings in production
  if (process.env.NODE_ENV === "production" && result.warnings.length > 0) {
    console.warn(
      "[ENV] Warnings:\n" +
        result.warnings.map((w) => `  - ${w}`).join("\n")
    );
  }
}

/**
 * Get a typed environment variable with runtime validation
 */
export function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is not set`);
  }
  return value;
}

/**
 * Get an optional environment variable
 */
export function getEnvOptional(name: string): string | undefined {
  return process.env[name];
}
