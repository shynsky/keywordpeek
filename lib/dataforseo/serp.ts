/**
 * DataForSEO SERP API
 *
 * Fetches Google SERP results for competitor discovery.
 */

import { getClient } from "./client";
import type { SerpResult, OrganicSerpItem } from "./types";

// Default settings
const DEFAULT_LOCATION_CODE = 2840; // United States
const DEFAULT_LANGUAGE_CODE = "en";

/**
 * SERP organic result for competitor analysis
 */
export interface SerpOrganicResult {
  position: number;
  domain: string;
  url: string;
  title: string;
  description: string;
}

/**
 * SERP results for a keyword
 */
export interface SerpKeywordResult {
  keyword: string;
  totalResults: number;
  organicResults: SerpOrganicResult[];
  featuredSnippetDomain: string | null;
}

/**
 * Get SERP organic results for a keyword
 * Returns top ranking domains for competitor discovery
 *
 * @param keyword - Keyword to search
 * @param options - Location, language, and depth options
 * @returns Top organic results
 */
export async function getSerpResults(
  keyword: string,
  options: {
    locationCode?: number;
    languageCode?: string;
    depth?: number; // Number of results (default 10)
  } = {}
): Promise<SerpKeywordResult> {
  const {
    locationCode = DEFAULT_LOCATION_CODE,
    languageCode = DEFAULT_LANGUAGE_CODE,
    depth = 10,
  } = options;

  const client = getClient();

  const response = await client.post<SerpResult>(
    "/v3/serp/google/organic/live/regular",
    [
      {
        keyword,
        location_code: locationCode,
        language_code: languageCode,
        device: "desktop",
        depth,
      },
    ]
  );

  const organicResults: SerpOrganicResult[] = [];
  let totalResults = 0;
  let featuredSnippetDomain: string | null = null;

  for (const task of response.tasks) {
    if (task.result) {
      for (const result of task.result) {
        totalResults = result.se_results_count;

        for (const item of result.items ?? []) {
          if (item.type === "organic") {
            const organic = item as OrganicSerpItem;
            organicResults.push({
              position: organic.rank_group,
              domain: organic.domain,
              url: organic.url,
              title: organic.title,
              description: organic.description,
            });
          }

          if (item.type === "featured_snippet") {
            featuredSnippetDomain = (item as { domain: string }).domain;
          }
        }
      }
    }
  }

  return {
    keyword,
    totalResults,
    organicResults,
    featuredSnippetDomain,
  };
}

/**
 * Get SERP results for multiple keywords
 * Used for batch competitor discovery
 *
 * @param keywords - Keywords to search (max 100 per request)
 * @param options - Location, language options
 * @returns Array of SERP results
 */
export async function getSerpResultsBatch(
  keywords: string[],
  options: {
    locationCode?: number;
    languageCode?: string;
    depth?: number;
  } = {}
): Promise<SerpKeywordResult[]> {
  const {
    locationCode = DEFAULT_LOCATION_CODE,
    languageCode = DEFAULT_LANGUAGE_CODE,
    depth = 10,
  } = options;

  const client = getClient();

  // Build batch request
  const requestData = keywords.map((keyword) => ({
    keyword,
    location_code: locationCode,
    language_code: languageCode,
    device: "desktop",
    depth,
  }));

  const response = await client.post<SerpResult>(
    "/v3/serp/google/organic/live/regular",
    requestData
  );

  const results: SerpKeywordResult[] = [];

  for (const task of response.tasks) {
    if (task.result) {
      for (const result of task.result) {
        const organicResults: SerpOrganicResult[] = [];
        let featuredSnippetDomain: string | null = null;

        for (const item of result.items ?? []) {
          if (item.type === "organic") {
            const organic = item as OrganicSerpItem;
            organicResults.push({
              position: organic.rank_group,
              domain: organic.domain,
              url: organic.url,
              title: organic.title,
              description: organic.description,
            });
          }

          if (item.type === "featured_snippet") {
            featuredSnippetDomain = (item as { domain: string }).domain;
          }
        }

        results.push({
          keyword: result.keyword,
          totalResults: result.se_results_count,
          organicResults,
          featuredSnippetDomain,
        });
      }
    }
  }

  return results;
}

/**
 * Extract unique competitor domains from SERP results
 * Returns domains sorted by frequency (most common first)
 *
 * @param serpResults - Array of SERP results
 * @param excludeDomains - Domains to exclude (e.g., social sites)
 * @returns Array of domains with frequency count
 */
export function extractCompetitorDomains(
  serpResults: SerpKeywordResult[],
  excludeDomains: string[] = [
    "facebook.com",
    "twitter.com",
    "instagram.com",
    "youtube.com",
    "linkedin.com",
    "pinterest.com",
    "reddit.com",
    "tiktok.com",
    "wikipedia.org",
    "amazon.com",
  ]
): Array<{ domain: string; count: number; avgPosition: number }> {
  const domainStats = new Map<string, { count: number; positions: number[] }>();
  const excludeSet = new Set(excludeDomains.map((d) => d.toLowerCase()));

  for (const result of serpResults) {
    for (const organic of result.organicResults) {
      const domain = organic.domain.toLowerCase();

      // Skip excluded domains
      if (excludeSet.has(domain)) continue;

      const existing = domainStats.get(domain);
      if (existing) {
        existing.count++;
        existing.positions.push(organic.position);
      } else {
        domainStats.set(domain, {
          count: 1,
          positions: [organic.position],
        });
      }
    }
  }

  // Convert to array and sort by count (then by avg position)
  return Array.from(domainStats.entries())
    .map(([domain, stats]) => ({
      domain,
      count: stats.count,
      avgPosition:
        stats.positions.reduce((a, b) => a + b, 0) / stats.positions.length,
    }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.avgPosition - b.avgPosition;
    });
}
