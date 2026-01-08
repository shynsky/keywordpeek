import React from "react";
import { render, RenderOptions } from "@testing-library/react";

/**
 * Custom render function with providers
 */
function customRender(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  const AllProviders = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
  };

  return render(ui, { wrapper: AllProviders, ...options });
}

// Re-export everything
export * from "@testing-library/react";
export { customRender as render };

/**
 * Mock factory for keyword data
 */
export function createMockKeyword(overrides: Partial<{
  keyword: string;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  competition: "low" | "medium" | "high";
  keywordScore: number;
  trend: { year: number; month: number; volume: number }[];
}> = {}) {
  return {
    keyword: "test keyword",
    searchVolume: 5000,
    difficulty: 45,
    cpc: 1.5,
    competition: "medium" as const,
    keywordScore: 65,
    trend: [
      { year: 2024, month: 1, volume: 4800 },
      { year: 2024, month: 2, volume: 4900 },
      { year: 2024, month: 3, volume: 5000 },
      { year: 2024, month: 4, volume: 5100 },
      { year: 2024, month: 5, volume: 5200 },
      { year: 2024, month: 6, volume: 5300 },
    ],
    ...overrides,
  };
}

/**
 * Mock factory for trend data
 */
export function createMockTrendData(volumes: number[]) {
  return volumes.map((volume, i) => ({
    year: 2024,
    month: i + 1,
    volume,
  }));
}

/**
 * Create trend data with specific growth pattern
 */
export function createGrowingTrend(startVolume: number, growthPercent: number, months = 6) {
  const data = [];
  let volume = startVolume;
  const monthlyGrowth = growthPercent / months / 100;

  for (let i = 0; i < months; i++) {
    data.push({
      year: 2024,
      month: i + 1,
      volume: Math.round(volume),
    });
    volume *= 1 + monthlyGrowth;
  }

  return data;
}

/**
 * Create trend data with declining pattern
 */
export function createDecliningTrend(startVolume: number, declinePercent: number, months = 6) {
  const data = [];
  let volume = startVolume;
  const monthlyDecline = declinePercent / months / 100;

  for (let i = 0; i < months; i++) {
    data.push({
      year: 2024,
      month: i + 1,
      volume: Math.round(volume),
    });
    volume *= 1 - monthlyDecline;
  }

  return data;
}

/**
 * Create stable trend data
 */
export function createStableTrend(volume: number, months = 6) {
  return Array.from({ length: months }, (_, i) => ({
    year: 2024,
    month: i + 1,
    volume: volume + Math.round((Math.random() - 0.5) * volume * 0.05), // ±2.5% variance
  }));
}
