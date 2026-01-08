import { describe, it, expect } from "vitest";
import { calculateKeywordScore, estimateDifficulty } from "@/lib/dataforseo/keywords";

describe("dataforseo/keywords", () => {
  describe("calculateKeywordScore", () => {
    it("returns high score for high volume, low competition", () => {
      // High volume (50000), low competition (0.1), moderate CPC (2)
      const score = calculateKeywordScore(50000, 0.1, 2);
      expect(score).toBeGreaterThanOrEqual(70);
      expect(score).toBeLessThanOrEqual(100);
    });

    it("returns low score for low volume, high competition", () => {
      // Low volume (100), high competition (0.9), low CPC (0.5)
      const score = calculateKeywordScore(100, 0.9, 0.5);
      expect(score).toBeGreaterThanOrEqual(10);
      expect(score).toBeLessThanOrEqual(40);
    });

    it("handles zero volume gracefully", () => {
      const score = calculateKeywordScore(0, 0.5, 1);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it("handles zero competition", () => {
      // Zero competition should max out the competition score component
      const score = calculateKeywordScore(1000, 0, 1);
      expect(score).toBeGreaterThanOrEqual(50);
    });

    it("handles extreme high CPC values", () => {
      // CPC above $20 should cap at max CPC contribution
      const scoreAt20 = calculateKeywordScore(1000, 0.5, 20);
      const scoreAt100 = calculateKeywordScore(1000, 0.5, 100);
      // Scores should be same since CPC is capped
      expect(scoreAt20).toBe(scoreAt100);
    });

    it("higher CPC increases score", () => {
      const lowCpcScore = calculateKeywordScore(5000, 0.5, 1);
      const highCpcScore = calculateKeywordScore(5000, 0.5, 10);
      expect(highCpcScore).toBeGreaterThan(lowCpcScore);
    });

    it("lower competition increases score", () => {
      const highCompScore = calculateKeywordScore(5000, 0.8, 2);
      const lowCompScore = calculateKeywordScore(5000, 0.2, 2);
      expect(lowCompScore).toBeGreaterThan(highCompScore);
    });

    it("higher volume increases score", () => {
      const lowVolumeScore = calculateKeywordScore(100, 0.5, 2);
      const highVolumeScore = calculateKeywordScore(10000, 0.5, 2);
      expect(highVolumeScore).toBeGreaterThan(lowVolumeScore);
    });

    it("returns integer value", () => {
      const score = calculateKeywordScore(1234, 0.45, 1.75);
      expect(Number.isInteger(score)).toBe(true);
    });

    it("score is always between 0 and 100", () => {
      // Test extreme values
      const testCases = [
        [0, 0, 0],
        [0, 1, 0],
        [1000000, 0, 100],
        [1000000, 1, 100],
        [1, 0.5, 0.5],
      ];

      for (const [volume, competition, cpc] of testCases) {
        const score = calculateKeywordScore(volume, competition, cpc);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      }
    });

    it("calculates expected score for medium keyword", () => {
      // Volume: 5000 (log10(5000) ≈ 3.7, volumeScore ≈ 74)
      // Competition: 0.5 (competitionScore = 50)
      // CPC: 2 (cpcScore = 10)
      // Score = 74*0.4 + 50*0.4 + 10*0.2 = 29.6 + 20 + 2 = 51.6 ≈ 52
      const score = calculateKeywordScore(5000, 0.5, 2);
      expect(score).toBeGreaterThanOrEqual(45);
      expect(score).toBeLessThanOrEqual(60);
    });
  });

  describe("estimateDifficulty", () => {
    it("returns low difficulty for low competition, low volume", () => {
      // Low competition (0.2), low volume (500)
      const difficulty = estimateDifficulty(0.2, 500);
      expect(difficulty).toBeLessThanOrEqual(30);
    });

    it("returns high difficulty for high competition, high volume", () => {
      // High competition (0.9), high volume (50000)
      const difficulty = estimateDifficulty(0.9, 50000);
      expect(difficulty).toBeGreaterThanOrEqual(70);
    });

    it("adds 10 points for volume > 1000", () => {
      const lowVolumeDiff = estimateDifficulty(0.5, 500);
      const medVolumeDiff = estimateDifficulty(0.5, 5000);
      expect(medVolumeDiff - lowVolumeDiff).toBe(10);
    });

    it("adds 20 points for volume > 10000", () => {
      const lowVolumeDiff = estimateDifficulty(0.5, 500);
      const highVolumeDiff = estimateDifficulty(0.5, 50000);
      expect(highVolumeDiff - lowVolumeDiff).toBe(20);
    });

    it("volume threshold at exactly 1000 does not add points", () => {
      const at1000 = estimateDifficulty(0.5, 1000);
      const below1000 = estimateDifficulty(0.5, 999);
      expect(at1000).toBe(below1000);
    });

    it("volume threshold at exactly 10000 does not add 20 points", () => {
      const at10000 = estimateDifficulty(0.5, 10000);
      const above10000 = estimateDifficulty(0.5, 10001);
      expect(above10000 - at10000).toBe(10);
    });

    it("returns integer value", () => {
      const difficulty = estimateDifficulty(0.45, 1234);
      expect(Number.isInteger(difficulty)).toBe(true);
    });

    it("difficulty is always between 0 and 100", () => {
      const testCases = [
        [0, 0],
        [1, 0],
        [0, 100000],
        [1, 100000],
        [0.5, 5000],
      ];

      for (const [competition, volume] of testCases) {
        const difficulty = estimateDifficulty(competition, volume);
        expect(difficulty).toBeGreaterThanOrEqual(0);
        expect(difficulty).toBeLessThanOrEqual(100);
      }
    });

    it("zero competition gives base difficulty of 0", () => {
      const difficulty = estimateDifficulty(0, 500);
      expect(difficulty).toBe(0);
    });

    it("max competition (1.0) gives base difficulty of 60", () => {
      // Without volume bonus
      const difficulty = estimateDifficulty(1, 500);
      expect(difficulty).toBe(60);
    });

    it("max competition with max volume bonus gives 80", () => {
      const difficulty = estimateDifficulty(1, 50000);
      expect(difficulty).toBe(80);
    });
  });
});
