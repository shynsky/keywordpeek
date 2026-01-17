import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockUser } from "../helpers";

// Mock modules before importing route
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
  getAuthUser: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn(),
  rateLimitResponse: vi.fn().mockImplementation(() =>
    new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    })
  ),
}));

import { GET, DELETE } from "@/app/api/keywords/history/route";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

describe("/api/keywords/history", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function setupAuthenticatedUser(user = mockUser) {
    vi.mocked(getAuthUser).mockResolvedValue(user as never);
  }

  function setupRateLimitOk() {
    vi.mocked(checkRateLimit).mockReturnValue({
      success: true,
      remaining: 99,
      resetAt: Date.now() + 60000,
    });
  }

  function createMockQueryBuilder(data: unknown[], error: Error | null = null, count = data.length) {
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      then: (resolve: (v: { data: unknown[]; error: Error | null; count: number }) => void) =>
        Promise.resolve({ data, error, count }).then(resolve),
    };
  }

  describe("GET /api/keywords/history", () => {
    it("returns paginated search history", async () => {
      setupAuthenticatedUser();
      setupRateLimitOk();

      const mockHistory = [
        { id: "1", keyword: "test1", created_at: "2024-01-01" },
        { id: "2", keyword: "test2", created_at: "2024-01-02" },
      ];

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(createMockQueryBuilder(mockHistory)),
      } as never);

      const request = new Request("http://localhost/api/keywords/history");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("data", mockHistory);
      expect(data).toHaveProperty("pagination");
      expect(data.pagination).toHaveProperty("total", 2);
      expect(data.pagination).toHaveProperty("limit", 20);
      expect(data.pagination).toHaveProperty("offset", 0);
    });

    it("returns 401 when unauthenticated", async () => {
      vi.mocked(getAuthUser).mockResolvedValue(null);

      const request = new Request("http://localhost/api/keywords/history");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toHaveProperty("error", "Unauthorized");
    });

    it("respects limit and offset parameters", async () => {
      setupAuthenticatedUser();
      setupRateLimitOk();

      const mockRange = vi.fn().mockReturnThis();
      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          range: mockRange,
          then: (resolve: (v: { data: unknown[]; error: Error | null; count: number }) => void) =>
            Promise.resolve({ data: [], error: null, count: 50 }).then(resolve),
        }),
      } as never);

      const request = new Request("http://localhost/api/keywords/history?limit=10&offset=20");
      await GET(request);

      expect(mockRange).toHaveBeenCalledWith(20, 29); // offset to offset + limit - 1
    });

    it("clamps limit to max 100", async () => {
      setupAuthenticatedUser();
      setupRateLimitOk();

      const mockRange = vi.fn().mockReturnThis();
      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          range: mockRange,
          then: (resolve: (v: { data: unknown[]; error: Error | null; count: number }) => void) =>
            Promise.resolve({ data: [], error: null, count: 0 }).then(resolve),
        }),
      } as never);

      const request = new Request("http://localhost/api/keywords/history?limit=200");
      const response = await GET(request);
      const data = await response.json();

      expect(data.pagination.limit).toBe(100);
    });

    it("handles database errors", async () => {
      setupAuthenticatedUser();
      setupRateLimitOk();

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(
          createMockQueryBuilder([], new Error("Database error"))
        ),
      } as never);

      const request = new Request("http://localhost/api/keywords/history");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty("error", "Failed to fetch search history");
    });

    it("returns rate limit response when exceeded", async () => {
      setupAuthenticatedUser();
      vi.mocked(checkRateLimit).mockReturnValue({
        success: false,
        remaining: 0,
        resetAt: Date.now() + 60000,
        retryAfter: 60,
      });

      const request = new Request("http://localhost/api/keywords/history");
      const response = await GET(request);

      expect(response.status).toBe(429);
    });
  });

  describe("DELETE /api/keywords/history", () => {
    it("deletes single history entry by id", async () => {
      setupAuthenticatedUser();
      setupRateLimitOk();

      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            then: (resolve: (v: { error: null }) => void) =>
              Promise.resolve({ error: null }).then(resolve),
          }),
        }),
      });

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          delete: mockDelete,
        }),
      } as never);

      const request = new Request("http://localhost/api/keywords/history?id=entry_123");
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ success: true, deleted: "entry_123" });
    });

    it("clears all history when no id provided", async () => {
      setupAuthenticatedUser();
      setupRateLimitOk();

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              then: (resolve: (v: { error: null; count: number }) => void) =>
                Promise.resolve({ error: null, count: 15 }).then(resolve),
            }),
          }),
        }),
      } as never);

      const request = new Request("http://localhost/api/keywords/history");
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ success: true, deletedCount: 15 });
    });

    it("returns 401 when unauthenticated", async () => {
      vi.mocked(getAuthUser).mockResolvedValue(null);

      const request = new Request("http://localhost/api/keywords/history");
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toHaveProperty("error", "Unauthorized");
    });

    it("handles delete errors", async () => {
      setupAuthenticatedUser();
      setupRateLimitOk();

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                then: (resolve: (v: { error: Error }) => void) =>
                  Promise.resolve({ error: new Error("Delete failed") }).then(resolve),
              }),
            }),
          }),
        }),
      } as never);

      const request = new Request("http://localhost/api/keywords/history?id=entry_123");
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty("error", "Failed to delete history entry");
    });

    it("uses stricter rate limit for deletes (30/min)", async () => {
      setupAuthenticatedUser();

      vi.mocked(checkRateLimit).mockReturnValue({
        success: false,
        remaining: 0,
        resetAt: Date.now() + 60000,
        retryAfter: 60,
      });

      const request = new Request("http://localhost/api/keywords/history");
      const response = await DELETE(request);

      expect(checkRateLimit).toHaveBeenCalledWith(`${mockUser.id}:delete`, 30, 60000);
      expect(response.status).toBe(429);
    });
  });
});
