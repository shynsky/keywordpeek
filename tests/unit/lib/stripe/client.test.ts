import { describe, it, expect } from "vitest";
import { CREDIT_PACKAGES, getPackage } from "@/lib/stripe/client";

describe("stripe/client", () => {
  describe("CREDIT_PACKAGES", () => {
    it("has 3 packages", () => {
      expect(Object.keys(CREDIT_PACKAGES)).toHaveLength(3);
    });

    it("starter package has correct config", () => {
      expect(CREDIT_PACKAGES.starter).toEqual({
        id: "starter",
        name: "Starter",
        credits: 1000,
        price: 900, // cents
        priceDisplay: "$9",
        perKeyword: "$0.009",
        popular: false,
      });
    });

    it("growth package has correct config", () => {
      expect(CREDIT_PACKAGES.growth).toEqual({
        id: "growth",
        name: "Growth",
        credits: 3000,
        price: 1900, // cents
        priceDisplay: "$19",
        perKeyword: "$0.006",
        popular: true,
      });
    });

    it("pro package has correct config", () => {
      expect(CREDIT_PACKAGES.pro).toEqual({
        id: "pro",
        name: "Pro",
        credits: 10000,
        price: 4900, // cents
        priceDisplay: "$49",
        perKeyword: "$0.005",
        popular: false,
      });
    });

    it("only growth package is marked as popular", () => {
      expect(CREDIT_PACKAGES.starter.popular).toBe(false);
      expect(CREDIT_PACKAGES.growth.popular).toBe(true);
      expect(CREDIT_PACKAGES.pro.popular).toBe(false);
    });

    it("prices are in cents (not dollars)", () => {
      expect(CREDIT_PACKAGES.starter.price).toBe(900);
      expect(CREDIT_PACKAGES.growth.price).toBe(1900);
      expect(CREDIT_PACKAGES.pro.price).toBe(4900);
    });

    it("perKeyword values are accurate", () => {
      // Starter: $9 / 1000 = $0.009
      const starterPerKeyword = 900 / 100 / CREDIT_PACKAGES.starter.credits;
      expect(starterPerKeyword.toFixed(3)).toBe("0.009");

      // Growth: $19 / 3000 ≈ $0.0063
      const growthPerKeyword = 1900 / 100 / CREDIT_PACKAGES.growth.credits;
      expect(growthPerKeyword.toFixed(3)).toBe("0.006");

      // Pro: $49 / 10000 = $0.0049
      const proPerKeyword = 4900 / 100 / CREDIT_PACKAGES.pro.credits;
      expect(proPerKeyword.toFixed(3)).toBe("0.005");
    });

    it("pro has best value per keyword", () => {
      const starterValue = CREDIT_PACKAGES.starter.price / CREDIT_PACKAGES.starter.credits;
      const growthValue = CREDIT_PACKAGES.growth.price / CREDIT_PACKAGES.growth.credits;
      const proValue = CREDIT_PACKAGES.pro.price / CREDIT_PACKAGES.pro.credits;

      expect(proValue).toBeLessThan(growthValue);
      expect(growthValue).toBeLessThan(starterValue);
    });
  });

  describe("getPackage", () => {
    it("returns starter package for 'starter' id", () => {
      const pkg = getPackage("starter");
      expect(pkg).toBeDefined();
      expect(pkg?.id).toBe("starter");
      expect(pkg?.credits).toBe(1000);
    });

    it("returns growth package for 'growth' id", () => {
      const pkg = getPackage("growth");
      expect(pkg).toBeDefined();
      expect(pkg?.id).toBe("growth");
      expect(pkg?.credits).toBe(3000);
    });

    it("returns pro package for 'pro' id", () => {
      const pkg = getPackage("pro");
      expect(pkg).toBeDefined();
      expect(pkg?.id).toBe("pro");
      expect(pkg?.credits).toBe(10000);
    });

    it("returns undefined for invalid package id", () => {
      const pkg = getPackage("invalid");
      expect(pkg).toBeUndefined();
    });

    it("returns undefined for empty string", () => {
      const pkg = getPackage("");
      expect(pkg).toBeUndefined();
    });

    it("returns undefined for numeric string", () => {
      const pkg = getPackage("123");
      expect(pkg).toBeUndefined();
    });
  });
});
