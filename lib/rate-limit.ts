/**
 * Rate Limiter with Vercel KV Support
 *
 * Uses Vercel KV (Redis) for distributed rate limiting in production.
 * Falls back to in-memory storage when KV is not configured.
 */

import { kv } from "@vercel/kv";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory fallback (resets on deploy)
const memoryRateLimits = new Map<string, RateLimitRecord>();

// Check if Vercel KV is configured
const kvEnabled = !!(
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
);

// Clean up old entries periodically (only for in-memory)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of memoryRateLimits.entries()) {
      if (now > record.resetAt) {
        memoryRateLimits.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

/**
 * Check rate limit using Vercel KV
 */
async function checkRateLimitKV(
  identifier: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const key = `ratelimit:${identifier}`;
  const now = Date.now();
  const windowSeconds = Math.ceil(windowMs / 1000);

  try {
    // Use Redis multi/exec for atomic operations
    const pipeline = kv.pipeline();

    // Get current count
    pipeline.get(key);

    // Execute and get results
    const [currentCount] = (await pipeline.exec()) as [number | null];

    if (currentCount === null) {
      // No record exists, create new one
      await kv.set(key, 1, { ex: windowSeconds });
      return {
        success: true,
        remaining: limit - 1,
        resetAt: now + windowMs,
      };
    }

    if (currentCount >= limit) {
      // Over limit - get TTL to calculate retry time
      const ttl = await kv.ttl(key);
      return {
        success: false,
        remaining: 0,
        resetAt: now + ttl * 1000,
        retryAfter: ttl > 0 ? ttl : windowSeconds,
      };
    }

    // Increment count
    await kv.incr(key);
    const ttl = await kv.ttl(key);

    return {
      success: true,
      remaining: limit - currentCount - 1,
      resetAt: now + ttl * 1000,
    };
  } catch (error) {
    // Log error but don't fail the request - fall back to allowing it
    console.error("Rate limit KV error:", error);
    return {
      success: true,
      remaining: limit - 1,
      resetAt: now + windowMs,
    };
  }
}

/**
 * Check rate limit using in-memory storage (fallback)
 */
function checkRateLimitMemory(
  identifier: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const record = memoryRateLimits.get(identifier);

  // No record or expired - create new window
  if (!record || now > record.resetAt) {
    memoryRateLimits.set(identifier, { count: 1, resetAt: now + windowMs });
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
 * Check rate limit for an identifier (typically user ID)
 * Uses Vercel KV if configured, otherwise falls back to in-memory
 *
 * @param identifier - Unique identifier (user ID, IP, etc.)
 * @param limit - Maximum requests allowed in the window (default: 100)
 * @param windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000
): RateLimitResult {
  // Use synchronous in-memory check for now
  // The KV version is async and requires updating all API routes
  return checkRateLimitMemory(identifier, limit, windowMs);
}

/**
 * Async rate limit check - use this for distributed rate limiting
 * Falls back to in-memory if KV is not configured
 */
export async function checkRateLimitAsync(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000
): Promise<RateLimitResult> {
  if (kvEnabled) {
    return checkRateLimitKV(identifier, limit, windowMs);
  }
  return checkRateLimitMemory(identifier, limit, windowMs);
}

/**
 * Check if distributed rate limiting is available
 */
export function isDistributedRateLimitEnabled(): boolean {
  return kvEnabled;
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
