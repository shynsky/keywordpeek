/**
 * Sentry Client-Side Configuration
 *
 * This configures the client-side Sentry SDK for browser error tracking.
 * Only initializes if NEXT_PUBLIC_SENTRY_DSN is set.
 */

import * as Sentry from "@sentry/browser";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

export function initSentryClient() {
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
      // Browser extensions
      "top.GLOBALS",
      "originalCreateNotification",
      "canvas.contentDocument",
      "MyApp_RemoveAllHighlights",
      "atomicFindClose",
      // Network errors
      "Network request failed",
      "Failed to fetch",
      "Load failed",
      // User cancellations
      "AbortError",
      "The operation was aborted",
      // Common non-issues
      "ResizeObserver loop",
      "Non-Error promise rejection captured",
    ],

    // Don't send PII by default
    sendDefaultPii: false,

    // Before sending, sanitize sensitive data
    beforeSend(event) {
      // Remove any potential PII from user object
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }

      // Remove authorization headers from breadcrumbs
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
          if (breadcrumb.data?.headers) {
            delete breadcrumb.data.headers.authorization;
            delete breadcrumb.data.headers.cookie;
          }
          return breadcrumb;
        });
      }

      return event;
    },
  });
}

// Re-export Sentry for use in components
export { Sentry };
