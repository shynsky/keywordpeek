/**
 * Next.js Instrumentation
 *
 * This file is loaded at app startup and is used to initialize
 * monitoring and observability tools like Sentry.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Server-side Sentry initialization
    const { initSentryServer } = await import("./sentry.server.config");
    initSentryServer();
  }
}
