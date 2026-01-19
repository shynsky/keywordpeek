/**
 * Get the application URL for redirects.
 * Uses NEXT_PUBLIC_APP_URL in production, falls back to window.location.origin for local dev.
 */
export function getAppUrl(): string {
  // Use environment variable if set (production)
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // Fallback to current origin (local development)
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // SSR fallback
  return "https://keywordpeek.com";
}
