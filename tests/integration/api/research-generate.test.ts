import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockRequest, parseResponse, mockUser, mockKeywordResult } from "../helpers";

// Mock modules before importing route
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
  getAuthUser: vi.fn(),
}));

vi.mock("@/lib/openai/keywords", () => ({
  generateKeywords: vi.fn(),
  generateTitle: vi.fn(),
}));

vi.mock("@/lib/openai/clustering", () => ({
  generateValidationSummary: vi.fn(),
}));

vi.mock("@/lib/dataforseo/keywords", () => ({
  searchKeywords: vi.fn(),
}));

vi.mock("@/lib/credits", () => ({
  reserveCredits: vi.fn(),
  rollbackCredits: vi.fn(),
  getBalance: vi.fn(),
  calculateSearchCredits: vi.fn(),
  CREDIT_COSTS: {
    LLM_KEYWORD_GENERATION: 1,
    LLM_VALIDATION_SUMMARY: 1,
  },
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn(),
  rateLimitResponse: vi.fn(),
}));

vi.mock("@/lib/research/sessions", () => ({
  createSession: vi.fn(),
  updateSession: vi.fn(),
}));

vi.mock("@/lib/constants/locations", () => ({
  DEFAULT_LOCATION_CODE: 2840,
  DEFAULT_LANGUAGE_CODE: "en",
}));

import { POST } from "@/app/api/research/generate/route";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { generateKeywords, generateTitle } from "@/lib/openai/keywords";
import { generateValidationSummary } from "@/lib/openai/clustering";
import { searchKeywords } from "@/lib/dataforseo/keywords";
import { reserveCredits, rollbackCredits, getBalance, calculateSearchCredits } from "@/lib/credits";
import { checkRateLimit } from "@/lib/rate-limit";
import { createSession, updateSession } from "@/lib/research/sessions";

describe("POST /api/research/generate", () => {
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
      remaining: 49,
      resetAt: Date.now() + 60000,
    });
  }

  function setupCreditsOk() {
    vi.mocked(calculateSearchCredits).mockReturnValue(1);
    vi.mocked(reserveCredits).mockResolvedValue("tx_123");
    vi.mocked(getBalance).mockResolvedValue(96);
  }

  function setupAIGenerationOk() {
    vi.mocked(generateKeywords).mockResolvedValue({
      keywords: ["keyword 1", "keyword 2", "keyword 3"],
      seedTopics: ["topic 1", "topic 2"],
      marketAngle: "B2B SaaS",
    });
    vi.mocked(generateTitle).mockResolvedValue("Research Session Title");
    vi.mocked(generateValidationSummary).mockResolvedValue({
      demandLevel: "good",
      competitionLevel: "moderate",
      opportunityScore: 75,
      insight: "Good search volume with moderate competition",
      recommendation: "Target long-tail keywords",
    });
  }

  function setupDataForSEOOk() {
    vi.mocked(searchKeywords).mockResolvedValue([
      mockKeywordResult,
      { ...mockKeywordResult, keyword: "keyword 2" },
      { ...mockKeywordResult, keyword: "keyword 3" },
    ]);
  }

  function setupSessionOk() {
    vi.mocked(createSession).mockResolvedValue({ id: "session_123" } as never);
    vi.mocked(updateSession).mockResolvedValue({} as never);
  }

  describe("AI Mode (description input)", () => {
    it("generates keywords from description and validates niche", async () => {
      setupAuthenticatedUser();
      setupRateLimitOk();
      setupCreditsOk();
      setupAIGenerationOk();
      setupDataForSEOOk();
      setupSessionOk();

      const request = createMockRequest("POST", {
        description: "A SaaS tool for project management",
      });
      const response = await POST(request);
      const { status, data } = await parseResponse(response);

      expect(status).toBe(200);
      expect(data).toHaveProperty("data");

      const responseData = (data as { data: Record<string, unknown> }).data;
      expect(responseData).toHaveProperty("sessionId", "session_123");
      expect(responseData).toHaveProperty("mode", "ai");
      expect(responseData).toHaveProperty("generatedKeywords");
      expect(responseData).toHaveProperty("keywords");
      expect(responseData).toHaveProperty("validationSummary");
    });

    it("returns 401 when unauthenticated", async () => {
      vi.mocked(getAuthUser).mockResolvedValue(null);

      const request = createMockRequest("POST", {
        description: "Test description",
      });
      const response = await POST(request);
      const { status, data } = await parseResponse(response);

      expect(status).toBe(401);
      expect(data).toHaveProperty("error", "Unauthorized");
    });

    it("returns 400 when description is missing", async () => {
      setupAuthenticatedUser();
      setupRateLimitOk();

      const request = createMockRequest("POST", {});
      const response = await POST(request);
      const { status, data } = await parseResponse(response);

      expect(status).toBe(400);
      expect(data).toHaveProperty("error", "Description is required");
    });

    it("returns 400 when description is too short", async () => {
      setupAuthenticatedUser();
      setupRateLimitOk();

      const request = createMockRequest("POST", {
        description: "Short",
      });
      const response = await POST(request);
      const { status, data } = await parseResponse(response);

      expect(status).toBe(400);
      expect(data).toHaveProperty("error", "Description must be at least 10 characters");
    });

    it("returns 400 when description is too long", async () => {
      setupAuthenticatedUser();
      setupRateLimitOk();

      const request = createMockRequest("POST", {
        description: "x".repeat(501),
      });
      const response = await POST(request);
      const { status, data } = await parseResponse(response);

      expect(status).toBe(400);
      expect(data).toHaveProperty("error", "Description must be less than 500 characters");
    });

    it("returns 402 when insufficient credits", async () => {
      setupAuthenticatedUser();
      setupRateLimitOk();
      vi.mocked(calculateSearchCredits).mockReturnValue(2);
      vi.mocked(reserveCredits).mockRejectedValue(new Error("Insufficient credits"));

      const request = createMockRequest("POST", {
        description: "A SaaS tool for project management",
      });
      const response = await POST(request);
      const { status, data } = await parseResponse(response);

      expect(status).toBe(402);
      expect(data).toHaveProperty("error", "Insufficient credits");
      expect(data).toHaveProperty("code", "INSUFFICIENT_CREDITS");
    });

    it("rolls back credits on AI failure", async () => {
      setupAuthenticatedUser();
      setupRateLimitOk();
      setupCreditsOk();
      vi.mocked(generateKeywords).mockRejectedValue(new Error("OpenAI error"));

      const request = createMockRequest("POST", {
        description: "A SaaS tool for project management",
      });
      const response = await POST(request);
      const { status } = await parseResponse(response);

      expect(status).toBe(500);
      expect(rollbackCredits).toHaveBeenCalledWith("tx_123");
    });
  });

  describe("Manual Mode (keywords input)", () => {
    it("validates provided keywords directly", async () => {
      setupAuthenticatedUser();
      setupRateLimitOk();
      setupCreditsOk();
      setupAIGenerationOk();
      setupDataForSEOOk();
      setupSessionOk();

      const request = createMockRequest("POST", {
        keywords: ["project management", "task tracking", "team collaboration"],
      });
      const response = await POST(request);
      const { status, data } = await parseResponse(response);

      expect(status).toBe(200);
      const responseData = (data as { data: Record<string, unknown> }).data;
      expect(responseData).toHaveProperty("mode", "manual");

      // Should NOT call AI generation in manual mode
      expect(generateKeywords).not.toHaveBeenCalled();
    });

    it("returns 400 when too many manual keywords", async () => {
      setupAuthenticatedUser();
      setupRateLimitOk();

      const keywords = Array.from({ length: 21 }, (_, i) => `keyword${i}`);
      const request = createMockRequest("POST", { keywords });
      const response = await POST(request);
      const { status, data } = await parseResponse(response);

      expect(status).toBe(400);
      expect(data).toHaveProperty("error", "Maximum 20 keywords allowed");
    });

    it("returns 400 when keywords have invalid format", async () => {
      setupAuthenticatedUser();
      setupRateLimitOk();

      const request = createMockRequest("POST", {
        keywords: ["valid", "x".repeat(100)], // Too long
      });
      const response = await POST(request);
      const { status, data } = await parseResponse(response);

      expect(status).toBe(400);
      expect(data).toHaveProperty("error", "Invalid keywords format");
    });
  });

  describe("Location and Language", () => {
    it("uses default location and language", async () => {
      setupAuthenticatedUser();
      setupRateLimitOk();
      setupCreditsOk();
      setupAIGenerationOk();
      setupDataForSEOOk();
      setupSessionOk();

      const request = createMockRequest("POST", {
        description: "A SaaS tool for project management",
      });
      await POST(request);

      expect(searchKeywords).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({
          locationCode: 2840,
          languageCode: "en",
        })
      );
    });

    it("accepts custom location and language", async () => {
      setupAuthenticatedUser();
      setupRateLimitOk();
      setupCreditsOk();
      setupAIGenerationOk();
      setupDataForSEOOk();
      setupSessionOk();

      const request = createMockRequest("POST", {
        description: "A SaaS tool for project management",
        locationCode: 2826,
        languageCode: "de",
      });
      await POST(request);

      expect(searchKeywords).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({
          locationCode: 2826,
          languageCode: "de",
        })
      );
    });

    it("validates locationCode format", async () => {
      setupAuthenticatedUser();
      setupRateLimitOk();

      const request = createMockRequest("POST", {
        description: "A SaaS tool for project management",
        locationCode: "invalid",
      });
      const response = await POST(request);
      const { status, data } = await parseResponse(response);

      expect(status).toBe(400);
      expect(data).toHaveProperty("error", "locationCode must be a positive integer");
    });

    it("validates languageCode format", async () => {
      setupAuthenticatedUser();
      setupRateLimitOk();

      const request = createMockRequest("POST", {
        description: "A SaaS tool for project management",
        languageCode: "english",
      });
      const response = await POST(request);
      const { status, data } = await parseResponse(response);

      expect(status).toBe(400);
      expect(data).toHaveProperty("error", "languageCode must be a 2-character string");
    });
  });

  describe("Session Management", () => {
    it("creates new session when sessionId not provided", async () => {
      setupAuthenticatedUser();
      setupRateLimitOk();
      setupCreditsOk();
      setupAIGenerationOk();
      setupDataForSEOOk();
      setupSessionOk();

      const request = createMockRequest("POST", {
        description: "A SaaS tool for project management",
      });
      await POST(request);

      expect(createSession).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          title: "Research Session Title",
          description: "A SaaS tool for project management",
          inputMode: "ai",
        })
      );
    });

    it("uses existing session when sessionId provided", async () => {
      setupAuthenticatedUser();
      setupRateLimitOk();
      setupCreditsOk();
      setupAIGenerationOk();
      setupDataForSEOOk();
      setupSessionOk();

      const request = createMockRequest("POST", {
        description: "A SaaS tool for project management",
        sessionId: "existing_session_123",
      });
      const response = await POST(request);
      const { data } = await parseResponse(response);

      expect(createSession).not.toHaveBeenCalled();
      expect(updateSession).toHaveBeenCalledWith(
        "existing_session_123",
        expect.any(Object)
      );

      const responseData = (data as { data: Record<string, unknown> }).data;
      expect(responseData.sessionId).toBe("existing_session_123");
    });
  });

  describe("API Usage Logging", () => {
    it("logs API usage on success", async () => {
      const { mockInsert } = setupAuthenticatedUser();
      setupRateLimitOk();
      setupCreditsOk();
      setupAIGenerationOk();
      setupDataForSEOOk();
      setupSessionOk();

      const request = createMockRequest("POST", {
        description: "A SaaS tool for project management",
      });
      await POST(request);

      expect(mockInsert).toHaveBeenCalledWith({
        user_id: mockUser.id,
        endpoint: "/api/research/generate",
        credits_used: expect.any(Number),
        keywords_count: 3,
        response_status: 200,
      });
    });
  });
});
