import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockRequest, parseResponse, mockUser, mockKeywordResult } from "../helpers";

// Mock modules before importing route
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
  getAuthUser: vi.fn(),
}));

vi.mock("@/lib/dataforseo/keywords", () => ({
  searchKeywords: vi.fn(),
  searchKeywordExtended: vi.fn(),
}));

vi.mock("@/lib/credits", () => ({
  hasCredits: vi.fn(),
  deductCredits: vi.fn(),
  reserveCredits: vi.fn(),
  rollbackCredits: vi.fn(),
  getBalance: vi.fn(),
  calculateSearchCredits: vi.fn(),
  CREDIT_COSTS: {
    KEYWORD_SEARCH: 1,
    BULK_CHECK: 0.2,
    SUGGESTIONS: 0.5,
    QUESTIONS: 0.5,
  },
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn(),
  rateLimitResponse: vi.fn(),
}));

import { POST } from "@/app/api/keywords/search/route";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { searchKeywords, searchKeywordExtended } from "@/lib/dataforseo/keywords";
import { reserveCredits, getBalance, calculateSearchCredits } from "@/lib/credits";
import { checkRateLimit } from "@/lib/rate-limit";

describe("POST /api/keywords/search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function setupAuthenticatedUser(user = mockUser) {
    const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
    vi.mocked(getAuthUser).mockResolvedValue(user as never);
    vi.mocked(checkRateLimit).mockReturnValue({ success: true, remaining: 99, resetAt: Date.now() + 60000 });
    vi.mocked(createClient).mockResolvedValue({
      from: vi.fn().mockReturnValue({
        insert: mockInsert,
      }),
    } as never);
    return { mockInsert };
  }

  function setupUnauthenticated() {
    vi.mocked(getAuthUser).mockResolvedValue(null as never);
  }

  it("returns keyword data for valid single keyword request", async () => {
    setupAuthenticatedUser();
    vi.mocked(calculateSearchCredits).mockReturnValue(1);
    vi.mocked(reserveCredits).mockResolvedValue("txn-123");
    vi.mocked(getBalance).mockResolvedValue(99);
    vi.mocked(searchKeywords).mockResolvedValue([mockKeywordResult]);

    const request = createMockRequest("POST", { keywords: "test keyword" });
    const response = await POST(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(200);
    expect(data).toHaveProperty("data");
    expect(data).toHaveProperty("creditsUsed", 1);
    expect((data as { data: unknown[] }).data).toHaveLength(1);
  });

  it("handles array of keywords", async () => {
    setupAuthenticatedUser();
    vi.mocked(calculateSearchCredits).mockReturnValue(3);
    vi.mocked(reserveCredits).mockResolvedValue("txn-123");
    vi.mocked(getBalance).mockResolvedValue(97);
    vi.mocked(searchKeywords).mockResolvedValue([
      mockKeywordResult,
      { ...mockKeywordResult, keyword: "keyword 2" },
      { ...mockKeywordResult, keyword: "keyword 3" },
    ]);

    const request = createMockRequest("POST", {
      keywords: ["keyword 1", "keyword 2", "keyword 3"],
    });
    const response = await POST(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(200);
    expect((data as { data: unknown[]; creditsUsed: number }).creditsUsed).toBe(3);
    expect((data as { data: unknown[] }).data).toHaveLength(3);
  });

  it("returns 401 when unauthenticated", async () => {
    setupUnauthenticated();

    const request = createMockRequest("POST", { keywords: "test" });
    const response = await POST(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(401);
    expect(data).toHaveProperty("error", "Unauthorized");
  });

  it("returns 402 when insufficient credits", async () => {
    setupAuthenticatedUser();
    vi.mocked(calculateSearchCredits).mockReturnValue(1);
    vi.mocked(reserveCredits).mockRejectedValue(new Error("Insufficient credits"));

    const request = createMockRequest("POST", { keywords: "test" });
    const response = await POST(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(402);
    expect(data).toHaveProperty("error", "Insufficient credits");
    expect(data).toHaveProperty("code", "INSUFFICIENT_CREDITS");
  });

  it("reserves correct credits (based on calculateSearchCredits)", async () => {
    setupAuthenticatedUser();
    vi.mocked(calculateSearchCredits).mockReturnValue(5);
    vi.mocked(reserveCredits).mockResolvedValue("txn-123");
    vi.mocked(getBalance).mockResolvedValue(95);
    vi.mocked(searchKeywords).mockResolvedValue([
      mockKeywordResult,
      mockKeywordResult,
      mockKeywordResult,
      mockKeywordResult,
      mockKeywordResult,
    ]);

    const request = createMockRequest("POST", {
      keywords: ["kw1", "kw2", "kw3", "kw4", "kw5"],
    });
    await POST(request);

    expect(calculateSearchCredits).toHaveBeenCalledWith(5);
    expect(reserveCredits).toHaveBeenCalledWith(
      mockUser.id,
      5,
      "Keyword search: 5 keyword(s)"
    );
  });

  it("validates keywords required", async () => {
    setupAuthenticatedUser();

    const request = createMockRequest("POST", {});
    const response = await POST(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(400);
    expect(data).toHaveProperty("error", "Keywords are required");
  });

  it("validates empty array", async () => {
    setupAuthenticatedUser();

    const request = createMockRequest("POST", { keywords: [] });
    const response = await POST(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(400);
    expect(data).toHaveProperty("error", "At least one keyword is required");
  });

  it("validates max 100 keywords", async () => {
    setupAuthenticatedUser();

    const keywords = Array.from({ length: 101 }, (_, i) => `keyword${i}`);
    const request = createMockRequest("POST", { keywords });
    const response = await POST(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(400);
    expect(data).toHaveProperty("error", "Maximum 100 keywords per request");
  });

  it("handles extended=true for single keyword", async () => {
    setupAuthenticatedUser();
    vi.mocked(calculateSearchCredits).mockReturnValue(1);
    vi.mocked(reserveCredits).mockResolvedValue("txn-123");
    vi.mocked(getBalance).mockResolvedValue(99);
    vi.mocked(searchKeywordExtended).mockResolvedValue({
      ...mockKeywordResult,
      suggestions: ["related1", "related2"],
      autocomplete: ["auto1"],
      questions: ["question1?"],
    });

    const request = createMockRequest("POST", {
      keywords: "test keyword",
      extended: true,
    });
    const response = await POST(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(200);
    expect(searchKeywordExtended).toHaveBeenCalled();
    expect(searchKeywords).not.toHaveBeenCalled();
  });

  it("logs to api_usage table", async () => {
    const { mockInsert } = setupAuthenticatedUser();
    vi.mocked(calculateSearchCredits).mockReturnValue(1);
    vi.mocked(reserveCredits).mockResolvedValue("txn-123");
    vi.mocked(getBalance).mockResolvedValue(99);
    vi.mocked(searchKeywords).mockResolvedValue([mockKeywordResult]);

    const request = createMockRequest("POST", { keywords: "test" });
    await POST(request);

    expect(mockInsert).toHaveBeenCalledWith({
      user_id: mockUser.id,
      endpoint: "/api/keywords/search",
      credits_used: 1,
      keywords_count: 1,
      response_status: 200,
    });
  });
});
