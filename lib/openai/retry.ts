/**
 * OpenAI Retry Utility
 *
 * Exponential backoff wrapper for OpenAI API calls.
 */

/**
 * Retry options for API calls
 */
export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxAttempts?: number;
  /** Label for logging purposes */
  label?: string;
}

/**
 * Execute a function with exponential backoff retry
 *
 * @param fn - Async function to execute
 * @param options - Retry configuration
 * @returns Result of the function
 * @throws Last error if all retries fail
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const label = options.label ?? "call";

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      console.error(
        `[OpenAI] ${label} attempt ${attempt}/${maxAttempts} failed:`,
        error instanceof Error ? error.message : error
      );

      if (attempt === maxAttempts) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 3s...
      const delay = 1000 * attempt;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // TypeScript requires this, but it's unreachable
  throw new Error("Unreachable");
}
