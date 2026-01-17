/**
 * Sentry Server-Side Configuration
 *
 * This configures the server-side Sentry SDK for API route and server component errors.
 * Only initializes if NEXT_PUBLIC_SENTRY_DSN is set.
 */

import * as Sentry from "@sentry/node";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

export function initSentryServer() {
  if (!SENTRY_DSN) {
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,

    // Performance monitoring - sample 10% of transactions in production
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Only enable in production
    enabled: process.env.NODE_ENV === "production",

    // Environment tag
    environment: process.env.NODE_ENV,

    // Filter out noisy errors
    ignoreErrors: [
      // Network errors
      "ECONNREFUSED",
      "ENOTFOUND",
      "ETIMEDOUT",
      // User-caused errors
      "Unauthorized",
      "Insufficient credits",
    ],

    // Don't send PII by default
    sendDefaultPii: false,

    // Before sending, sanitize sensitive data
    beforeSend(event) {
      // Remove any potential PII
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }

      // Remove sensitive request data
      if (event.request) {
        delete event.request.cookies;
        if (event.request.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.cookie;
        }
      }

      // Redact API keys from extra data
      if (event.extra) {
        const redactKeys = ["apiKey", "api_key", "password", "token", "secret"];
        for (const key of redactKeys) {
          if (key in event.extra) {
            event.extra[key] = "[REDACTED]";
          }
        }
      }

      return event;
    },
  });
}

// Re-export Sentry for use in server code
export { Sentry };
