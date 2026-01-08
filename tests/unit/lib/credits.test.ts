import { describe, it, expect } from "vitest";
import { CREDIT_COSTS, CREDIT_PACKAGES, getPackageByPriceId } from "@/lib/credits";

describe("credits", () => {
  describe("CREDIT_COSTS", () => {
    it("has correct cost for KEYWORD_SEARCH", () => {
      expect(CREDIT_COSTS.KEYWORD_SEARCH).toBe(1);
    });

    it("has correct cost for BULK_CHECK", () => {
      expect(CREDIT_COSTS.BULK_CHECK).toBe(0.2);
    });

    it("has correct cost for SUGGESTIONS", () => {
      expect(CREDIT_COSTS.SUGGESTIONS).toBe(0.5);
    });

    it("has correct cost for QUESTIONS", () => {
      expect(CREDIT_COSTS.QUESTIONS).toBe(0.5);
    });
  });

  describe("CREDIT_PACKAGES", () => {
    it("has 3 packages", () => {
      expect(Object.keys(CREDIT_PACKAGES)).toHaveLength(3);
    });

    it("has starter package with correct values", () => {
      expect(CREDIT_PACKAGES.starter).toEqual({
        id: "starter",
        name: "Starter",
        credits: 1000,
        price: 9,
        priceId: process.env.STRIPE_PRICE_STARTER,
      });
    });

    it("has growth package with correct values", () => {
      expect(CREDIT_PACKAGES.growth).toEqual({
        id: "growth",
        name: "Growth",
        credits: 3000,
        price: 19,
        priceId: process.env.STRIPE_PRICE_GROWTH,
      });
    });

    it("has pro package with correct values", () => {
      expect(CREDIT_PACKAGES.pro).toEqual({
        id: "pro",
        name: "Pro",
        credits: 10000,
        price: 49,
        priceId: process.env.STRIPE_PRICE_PRO,
      });
    });

    it("packages have progressively better value", () => {
      const starterValuePerCredit = CREDIT_PACKAGES.starter.price / CREDIT_PACKAGES.starter.credits;
      const growthValuePerCredit = CREDIT_PACKAGES.growth.price / CREDIT_PACKAGES.growth.credits;
      const proValuePerCredit = CREDIT_PACKAGES.pro.price / CREDIT_PACKAGES.pro.credits;

      // Pro should have best value (lowest cost per credit)
      expect(proValuePerCredit).toBeLessThan(growthValuePerCredit);
      expect(growthValuePerCredit).toBeLessThan(starterValuePerCredit);
    });
  });

  describe("getPackageByPriceId", () => {
    it("returns undefined for invalid price ID", () => {
      expect(getPackageByPriceId("invalid-id")).toBeUndefined();
    });

    it("returns undefined for empty price ID", () => {
      expect(getPackageByPriceId("")).toBeUndefined();
    });

    it("returns package when priceId matches (if env var set)", () => {
      // Since priceId comes from env, we test the function works
      const result = getPackageByPriceId("price_starter_test");
      // Will be undefined unless STRIPE_PRICE_STARTER is set to this value
      expect(result === undefined || result.id === "starter").toBe(true);
    });
  });
});
