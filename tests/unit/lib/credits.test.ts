import { describe, it, expect } from "vitest";
import {
  calculateSearchCredits,
  calculateBulkCredits,
  calculateSerpCredits,
  calculateCompetitorCredits,
  estimateResearchCredits,
  CREDIT_COSTS,
} from "@/lib/credits";

describe("lib/credits", () => {
  describe("CREDIT_COSTS", () => {
    it("has expected cost constants", () => {
      expect(CREDIT_COSTS.KEYWORD_SEARCH_BASE).toBe(1);
      expect(CREDIT_COSTS.KEYWORD_SEARCH_EXTRA).toBe(0.1);
      expect(CREDIT_COSTS.BULK_CHECK).toBe(1);
      expect(CREDIT_COSTS.SUGGESTIONS).toBe(1);
      expect(CREDIT_COSTS.QUESTIONS).toBe(1);
      expect(CREDIT_COSTS.LLM_KEYWORD_GENERATION).toBe(1);
      expect(CREDIT_COSTS.SERP_CHECK).toBe(0.5);
      expect(CREDIT_COSTS.KEYWORDS_FOR_SITE).toBe(2);
      expect(CREDIT_COSTS.LLM_CONTENT_CLUSTERING).toBe(1);
      expect(CREDIT_COSTS.LLM_VALIDATION_SUMMARY).toBe(1);
    });
  });

  describe("calculateSearchCredits", () => {
    it("returns 1 credit for 1-10 keywords", () => {
      expect(calculateSearchCredits(1)).toBe(1);
      expect(calculateSearchCredits(5)).toBe(1);
      expect(calculateSearchCredits(10)).toBe(1);
    });

    it("adds 0.1 credit per keyword above 10", () => {
      expect(calculateSearchCredits(11)).toBe(1.1);
      expect(calculateSearchCredits(15)).toBe(1.5);
      expect(calculateSearchCredits(20)).toBe(2);
      expect(calculateSearchCredits(30)).toBe(3);
    });

    it("handles edge cases", () => {
      expect(calculateSearchCredits(0)).toBe(1); // Minimum is base cost
      expect(calculateSearchCredits(100)).toBe(10);
    });
  });

  describe("calculateBulkCredits", () => {
    it("returns 1 credit per 25 keywords (rounded up)", () => {
      expect(calculateBulkCredits(1)).toBe(1);
      expect(calculateBulkCredits(25)).toBe(1);
      expect(calculateBulkCredits(26)).toBe(2);
      expect(calculateBulkCredits(50)).toBe(2);
      expect(calculateBulkCredits(51)).toBe(3);
      expect(calculateBulkCredits(100)).toBe(4);
    });

    it("handles large batches", () => {
      expect(calculateBulkCredits(500)).toBe(20);
      expect(calculateBulkCredits(1000)).toBe(40);
    });
  });

  describe("calculateSerpCredits", () => {
    it("returns 0.5 credits per keyword", () => {
      expect(calculateSerpCredits(1)).toBe(0.5);
      expect(calculateSerpCredits(2)).toBe(1);
      expect(calculateSerpCredits(5)).toBe(2.5);
      expect(calculateSerpCredits(10)).toBe(5);
    });
  });

  describe("calculateCompetitorCredits", () => {
    it("returns 2 credits per competitor domain", () => {
      expect(calculateCompetitorCredits(1)).toBe(2);
      expect(calculateCompetitorCredits(3)).toBe(6);
      expect(calculateCompetitorCredits(5)).toBe(10);
    });
  });

  describe("estimateResearchCredits", () => {
    it("calculates total credits for full research session", () => {
      // Default: 15 keywords, 5 SERP checks, 3 competitors
      const estimate = estimateResearchCredits(15);

      // Tab 1 (Validation): LLM (1) + search (1.5) + summary (1) = 3.5
      // Tab 2 (Competitors): SERP (5 * 0.5 = 2.5) + keywords (3 * 2 = 6) = 8.5
      // Tab 3 (Content): clustering (1) = 1
      // Total = 3.5 + 8.5 + 1 = 13
      expect(estimate).toBe(13);
    });

    it("scales with keyword count", () => {
      // 10 keywords: search = 1, total validation = 3
      const small = estimateResearchCredits(10, 5, 3);
      // 30 keywords: search = 3, total validation = 5
      const large = estimateResearchCredits(30, 5, 3);

      expect(small).toBeLessThan(large);
    });

    it("scales with SERP check count", () => {
      const fewSerps = estimateResearchCredits(15, 2, 3);
      const manySerps = estimateResearchCredits(15, 10, 3);

      expect(fewSerps).toBeLessThan(manySerps);
    });

    it("scales with competitor count", () => {
      const fewCompetitors = estimateResearchCredits(15, 5, 1);
      const manyCompetitors = estimateResearchCredits(15, 5, 5);

      expect(fewCompetitors).toBeLessThan(manyCompetitors);
    });

    it("calculates correctly for custom parameters", () => {
      // 20 keywords, 3 SERP, 2 competitors
      const estimate = estimateResearchCredits(20, 3, 2);

      // Tab 1: LLM (1) + search (20 keywords = 2) + summary (1) = 4
      // Tab 2: SERP (3 * 0.5 = 1.5) + competitors (2 * 2 = 4) = 5.5
      // Tab 3: clustering (1) = 1
      // Total = 4 + 5.5 + 1 = 10.5
      expect(estimate).toBe(10.5);
    });
  });
});
