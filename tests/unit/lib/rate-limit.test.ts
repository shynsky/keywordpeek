import { describe, it, expect, beforeEach, vi } from "vitest";

// Reset the rate limit module between tests
beforeEach(() => {
  vi.resetModules();
});

describe("lib/rate-limit", () => {
  describe("checkRateLimit (in-memory)", () => {
    it("allows first request within limit", async () => {
      const { checkRateLimit } = await import("@/lib/rate-limit");

      const result = checkRateLimit("user-1", 10, 60000);

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(9);
      expect(result.resetAt).toBeGreaterThan(Date.now());
    });

    it("tracks requests per identifier", async () => {
      const { checkRateLimit } = await import("@/lib/rate-limit");

      // First request
      const result1 = checkRateLimit("user-unique-1", 10, 60000);
      expect(result1.remaining).toBe(9);

      // Second request
      const result2 = checkRateLimit("user-unique-1", 10, 60000);
      expect(result2.remaining).toBe(8);

      // Third request
      const result3 = checkRateLimit("user-unique-1", 10, 60000);
      expect(result3.remaining).toBe(7);
    });

    it("blocks requests when limit is reached", async () => {
      const { checkRateLimit } = await import("@/lib/rate-limit");

      // Use up the limit
      for (let i = 0; i < 5; i++) {
        checkRateLimit("user-limited", 5, 60000);
      }

      // Next request should be blocked
      const result = checkRateLimit("user-limited", 5, 60000);

      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it("isolates rate limits between identifiers", async () => {
      const { checkRateLimit } = await import("@/lib/rate-limit");

      // Use up limit for user A
      for (let i = 0; i < 3; i++) {
        checkRateLimit("user-a", 3, 60000);
      }

      // User B should still have full limit
      const resultB = checkRateLimit("user-b", 3, 60000);
      expect(resultB.success).toBe(true);
      expect(resultB.remaining).toBe(2);

      // User A should be blocked
      const resultA = checkRateLimit("user-a", 3, 60000);
      expect(resultA.success).toBe(false);
    });

    it("uses default values when not specified", async () => {
      const { checkRateLimit } = await import("@/lib/rate-limit");

      const result = checkRateLimit("user-defaults");

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(99); // Default limit is 100
    });

    it("returns retryAfter in seconds", async () => {
      const { checkRateLimit } = await import("@/lib/rate-limit");

      // Use up the limit
      for (let i = 0; i < 5; i++) {
        checkRateLimit("user-retry", 5, 60000);
      }

      const result = checkRateLimit("user-retry", 5, 60000);

      expect(result.success).toBe(false);
      expect(result.retryAfter).toBeGreaterThan(0);
      expect(result.retryAfter).toBeLessThanOrEqual(60);
    });
  });

  describe("rateLimitResponse", () => {
    it("creates a 429 response with correct headers", async () => {
      const { rateLimitResponse } = await import("@/lib/rate-limit");

      const result = {
        success: false,
        remaining: 0,
        resetAt: Date.now() + 30000,
        retryAfter: 30,
      };

      const response = rateLimitResponse(result);

      expect(response.status).toBe(429);
      expect(response.headers.get("Content-Type")).toBe("application/json");
      expect(response.headers.get("X-RateLimit-Remaining")).toBe("0");
      expect(response.headers.get("Retry-After")).toBe("30");

      const body = await response.json();
      expect(body.error).toBe("Rate limit exceeded");
      expect(body.retryAfter).toBe(30);
    });

    it("defaults Retry-After to 60 when not specified", async () => {
      const { rateLimitResponse } = await import("@/lib/rate-limit");

      const result = {
        success: false,
        remaining: 0,
        resetAt: Date.now() + 60000,
      };

      const response = rateLimitResponse(result);
      expect(response.headers.get("Retry-After")).toBe("60");
    });
  });

  describe("checkRateLimitAsync", () => {
    it("falls back to memory when KV not configured", async () => {
      // Ensure KV env vars are not set
      delete process.env.KV_REST_API_URL;
      delete process.env.KV_REST_API_TOKEN;

      const { checkRateLimitAsync } = await import("@/lib/rate-limit");

      const result = await checkRateLimitAsync("user-async-test", 10, 60000);

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(9);
    });
  });

  describe("isDistributedRateLimitEnabled", () => {
    it("returns false when KV not configured", async () => {
      delete process.env.KV_REST_API_URL;
      delete process.env.KV_REST_API_TOKEN;

      const { isDistributedRateLimitEnabled } = await import("@/lib/rate-limit");

      expect(isDistributedRateLimitEnabled()).toBe(false);
    });
  });
});
