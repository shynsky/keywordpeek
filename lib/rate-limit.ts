/**
 * Simple in-memory rate limiter
 * Note: This resets on server restart. For production at scale,
 * consider using Redis-based rate limiting (e.g., @upstash/ratelimit)
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimits = new Map<string, RateLimitRecord>();

// Clean up old entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimits.entries()) {
    if (now > record.resetAt) {
      rateLimits.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

/**
 * Check rate limit for an identifier (typically user ID)
 * @param identifier - Unique identifier (user ID, IP, etc.)
 * @param limit - Maximum requests allowed in the window (default: 100)
 * @param windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000
): RateLimitResult {
  const now = Date.now();
  const record = rateLimits.get(identifier);

  // No record or expired - create new window
  if (!record || now > record.resetAt) {
    rateLimits.set(identifier, { count: 1, resetAt: now + windowMs });
    return {
      success: true,
      remaining: limit - 1,
      resetAt: now + windowMs,
    };
  }

  // Check if over limit
  if (record.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetAt: record.resetAt,
      retryAfter: Math.ceil((record.resetAt - now) / 1000),
    };
  }

  // Increment count
  record.count++;
  return {
    success: true,
    remaining: limit - record.count,
    resetAt: record.resetAt,
  };
}

/**
 * Rate limit response helper for API routes
 */
export function rateLimitResponse(result: RateLimitResult) {
  return new Response(
    JSON.stringify({
      error: "Rate limit exceeded",
      retryAfter: result.retryAfter,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
        "Retry-After": String(result.retryAfter || 60),
      },
    }
  );
}
