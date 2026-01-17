import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockRequest, parseResponse, mockUser, mockKeywordResult } from "../helpers";

// Mock modules before importing route
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
  getAuthUser: vi.fn(),
}));

vi.mock("@/lib/dataforseo/keywords", () => ({
  searchKeywords: vi.fn(),
}));

vi.mock("@/lib/credits", () => ({
  reserveCredits: vi.fn(),
  rollbackCredits: vi.fn(),
  getBalance: vi.fn(),
  calculateBulkCredits: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn(),
  rateLimitResponse: vi.fn(),
}));

import { POST } from "@/app/api/keywords/bulk/route";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { searchKeywords } from "@/lib/dataforseo/keywords";
import { reserveCredits, rollbackCredits, getBalance, calculateBulkCredits } from "@/lib/credits";
import { checkRateLimit } from "@/lib/rate-limit";

describe("POST /api/keywords/bulk", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function setupAuthenticatedUser(user = mockUser) {
    vi.mocked(getAuthUser).mockResolvedValue(user as never);

    const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
    vi.mocked(createClient).mockResolvedValue({
      from: vi.fn().mockReturnValue({
        insert: mockInsert,
      }),
    } as never);

    return { mockInsert };
  }

  function setupRateLimitOk() {
    vi.mocked(checkRateLimit).mockReturnValue({
      success: true,
      remaining: 99,
      resetAt: Date.now() + 60000,
    });
  }

  it("returns bulk keyword data for valid request", async () => {
    setupAuthenticatedUser();
    setupRateLimitOk();

    vi.mocked(calculateBulkCredits).mockReturnValue(1);
    vi.mocked(reserveCredits).mockResolvedValue("tx_123");
    vi.mocked(getBalance).mockResolvedValue(99);
    vi.mocked(searchKeywords).mockResolvedValue([
      mockKeywordResult,
      { ...mockKeywordResult, keyword: "keyword 2" },
    ]);

    const request = createMockRequest("POST", {
      keywords: ["keyword 1", "keyword 2"],
    });
    const response = await POST(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(200);
    expect(data).toHaveProperty("data");
    expect(data).toHaveProperty("creditsUsed", 1);
    expect(data).toHaveProperty("keywordsProcessed", 2);
    expect((data as { data: unknown[] }).data).toHaveLength(2);
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);

    const request = createMockRequest("POST", { keywords: ["test"] });
    const response = await POST(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(401);
    expect(data).toHaveProperty("error", "Unauthorized");
  });

  it("returns 400 when keywords is not an array", async () => {
    setupAuthenticatedUser();
    setupRateLimitOk();

    const request = createMockRequest("POST", { keywords: "not an array" });
    const response = await POST(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(400);
    expect(data).toHaveProperty("error", "Keywords array is required");
  });

  it("returns 400 for empty keywords array", async () => {
    setupAuthenticatedUser();
    setupRateLimitOk();

    const request = createMockRequest("POST", { keywords: [] });
    const response = await POST(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(400);
    expect(data).toHaveProperty("error", "At least one keyword is required");
  });

  it("returns 400 when exceeding 500 keywords limit", async () => {
    setupAuthenticatedUser();
    setupRateLimitOk();

    const keywords = Array.from({ length: 501 }, (_, i) => `keyword${i}`);
    const request = createMockRequest("POST", { keywords });
    const response = await POST(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(400);
    expect(data).toHaveProperty("error", "Maximum 500 keywords per bulk request");
  });

  it("returns 402 when insufficient credits", async () => {
    setupAuthenticatedUser();
    setupRateLimitOk();

    vi.mocked(calculateBulkCredits).mockReturnValue(5);
    vi.mocked(reserveCredits).mockRejectedValue(new Error("Insufficient credits"));

    const request = createMockRequest("POST", { keywords: ["test1", "test2"] });
    const response = await POST(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(402);
    expect(data).toHaveProperty("error", "Insufficient credits");
    expect(data).toHaveProperty("code", "INSUFFICIENT_CREDITS");
  });

  it("rolls back credits on API failure", async () => {
    setupAuthenticatedUser();
    setupRateLimitOk();

    vi.mocked(calculateBulkCredits).mockReturnValue(1);
    vi.mocked(reserveCredits).mockResolvedValue("tx_123");
    vi.mocked(searchKeywords).mockRejectedValue(new Error("API Error"));

    const request = createMockRequest("POST", { keywords: ["test"] });
    const response = await POST(request);
    const { status } = await parseResponse(response);

    expect(status).toBe(500);
    expect(rollbackCredits).toHaveBeenCalledWith("tx_123");
  });

  it("calculates credits correctly (1 per 25 keywords)", async () => {
    setupAuthenticatedUser();
    setupRateLimitOk();

    vi.mocked(calculateBulkCredits).mockReturnValue(2);
    vi.mocked(reserveCredits).mockResolvedValue("tx_123");
    vi.mocked(getBalance).mockResolvedValue(98);
    vi.mocked(searchKeywords).mockResolvedValue(
      Array.from({ length: 30 }, (_, i) => ({
        ...mockKeywordResult,
        keyword: `keyword${i}`,
      }))
    );

    const keywords = Array.from({ length: 30 }, (_, i) => `keyword${i}`);
    const request = createMockRequest("POST", { keywords });
    const response = await POST(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(200);
    expect(calculateBulkCredits).toHaveBeenCalledWith(30);
    expect(reserveCredits).toHaveBeenCalledWith(
      mockUser.id,
      2,
      "Bulk keyword check: 30 keywords"
    );
  });

  it("returns bulk result format (lighter weight)", async () => {
    setupAuthenticatedUser();
    setupRateLimitOk();

    vi.mocked(calculateBulkCredits).mockReturnValue(1);
    vi.mocked(reserveCredits).mockResolvedValue("tx_123");
    vi.mocked(getBalance).mockResolvedValue(99);
    vi.mocked(searchKeywords).mockResolvedValue([mockKeywordResult]);

    const request = createMockRequest("POST", { keywords: ["test"] });
    const response = await POST(request);
    const { data } = await parseResponse(response);

    const results = (data as { data: unknown[] }).data;
    expect(results[0]).toHaveProperty("keyword");
    expect(results[0]).toHaveProperty("searchVolume");
    expect(results[0]).toHaveProperty("difficulty");
    expect(results[0]).toHaveProperty("keywordScore");
    // Should NOT have detailed fields
    expect(results[0]).not.toHaveProperty("trend");
    expect(results[0]).not.toHaveProperty("cpc");
  });

  it("validates locationCode parameter", async () => {
    setupAuthenticatedUser();
    setupRateLimitOk();

    const request = createMockRequest("POST", {
      keywords: ["test"],
      locationCode: "invalid",
    });
    const response = await POST(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(400);
    expect(data).toHaveProperty("error", "locationCode must be a positive integer");
  });

  it("validates languageCode parameter", async () => {
    setupAuthenticatedUser();
    setupRateLimitOk();

    const request = createMockRequest("POST", {
      keywords: ["test"],
      languageCode: "invalid",
    });
    const response = await POST(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(400);
    expect(data).toHaveProperty("error", "languageCode must be a 2-character string");
  });

  it("logs API usage on success", async () => {
    const { mockInsert } = setupAuthenticatedUser();
    setupRateLimitOk();

    vi.mocked(calculateBulkCredits).mockReturnValue(1);
    vi.mocked(reserveCredits).mockResolvedValue("tx_123");
    vi.mocked(getBalance).mockResolvedValue(99);
    vi.mocked(searchKeywords).mockResolvedValue([mockKeywordResult]);

    const request = createMockRequest("POST", { keywords: ["test"] });
    await POST(request);

    expect(mockInsert).toHaveBeenCalledWith({
      user_id: mockUser.id,
      endpoint: "/api/keywords/bulk",
      credits_used: 1,
      keywords_count: 1,
      response_status: 200,
    });
  });
});
