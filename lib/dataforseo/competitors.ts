/**
 * DataForSEO Competitor Analysis APIs
 *
 * Uses Labs API endpoints for competitor keyword analysis.
 */

import { getClient } from "./client";
import type { DataForSEOResponse, DataForSEOTask } from "./types";

// Default settings
const DEFAULT_LOCATION_CODE = 2840; // United States
const DEFAULT_LANGUAGE_CODE = "en";

// =============================================================================
// Types
// =============================================================================

/**
 * Keywords for Site API result container
 */
interface KeywordsForSiteResultContainer {
  se_type: string;
  target: string;
  location_code: number;
  language_code: string;
  total_count: number;
  items_count: number;
  items: KeywordsForSiteItem[] | null;
}

/**
 * Individual keyword item from Keywords for Site
 */
interface KeywordsForSiteItem {
  keyword_data: {
    keyword: string;
    keyword_info: {
      search_volume: number;
      competition: number;
      competition_level: "LOW" | "MEDIUM" | "HIGH";
      cpc: number;
    };
    keyword_properties?: {
      keyword_difficulty: number;
    };
    serp_info?: {
      se_results_count: number;
    };
  };
  ranked_serp_element: {
    serp_item: {
      rank_group: number;
      rank_absolute: number;
      position: string;
      url: string;
      title: string;
    };
  };
}

/**
 * Domain Competitors API result container
 */
interface DomainCompetitorsResultContainer {
  se_type: string;
  target: string;
  location_code: number;
  language_code: string;
  total_count: number;
  items_count: number;
  items: DomainCompetitorItem[] | null;
}

/**
 * Individual competitor domain item
 */
interface DomainCompetitorItem {
  se_type: string;
  domain: string;
  avg_position: number;
  sum_position: number;
  intersections: number;
  full_domain_metrics: {
    organic: {
      pos_1: number;
      pos_2_3: number;
      pos_4_10: number;
      pos_11_20: number;
      pos_21_30: number;
      pos_31_40: number;
      pos_41_50: number;
      pos_51_60: number;
      pos_61_70: number;
      pos_71_80: number;
      pos_81_90: number;
      pos_91_100: number;
      etv: number;
      impressions_etv: number;
      count: number;
      estimated_paid_traffic_cost: number;
      is_new: number;
      is_up: number;
      is_down: number;
      is_lost: number;
    };
  };
}

// =============================================================================
// API Types for frontend
// =============================================================================

/**
 * Competitor keyword with ranking info
 */
export interface CompetitorKeyword {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  competition: "low" | "medium" | "high";
  rankPosition: number;
  rankUrl: string;
}

/**
 * Competitor domain with metrics
 */
export interface CompetitorDomain {
  domain: string;
  avgPosition: number;
  intersections: number; // Number of shared keywords
  estimatedTraffic: number;
  keywordsCount: number;
  topKeywords?: CompetitorKeyword[];
}

// =============================================================================
// API Functions
// =============================================================================

/**
 * Get keywords that a domain ranks for
 * Uses DataForSEO Labs "Keywords for Site" endpoint
 *
 * @param domain - Domain to analyze (e.g., "example.com")
 * @param options - Location, language, and limit options
 * @returns Array of keywords the domain ranks for
 */
export async function getKeywordsForSite(
  domain: string,
  options: {
    locationCode?: number;
    languageCode?: string;
    limit?: number;
    minSearchVolume?: number;
    maxPosition?: number;
  } = {}
): Promise<CompetitorKeyword[]> {
  const {
    locationCode = DEFAULT_LOCATION_CODE,
    languageCode = DEFAULT_LANGUAGE_CODE,
    limit = 100,
    minSearchVolume = 10,
    maxPosition = 30,
  } = options;

  const client = getClient();

  // Clean domain (remove protocol and trailing slash)
  const cleanDomain = domain
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
    .toLowerCase();

  const response = await client.post<KeywordsForSiteResultContainer>(
    "/v3/dataforseo_labs/google/keywords_for_site/live",
    [
      {
        target: cleanDomain,
        location_code: locationCode,
        language_code: languageCode,
        include_serp_info: true,
        include_subdomains: true,
        limit,
        filters: [
          ["keyword_data.keyword_info.search_volume", ">=", minSearchVolume],
          "and",
          ["ranked_serp_element.serp_item.rank_group", "<=", maxPosition],
        ],
        order_by: ["keyword_data.keyword_info.search_volume,desc"],
      },
    ]
  );

  const keywords: CompetitorKeyword[] = [];

  for (const task of response.tasks) {
    if (task.result) {
      for (const result of task.result) {
        if (result.items) {
          for (const item of result.items) {
            const kd = item.keyword_data;
            const ki = kd.keyword_info;
            const rs = item.ranked_serp_element?.serp_item;

            keywords.push({
              keyword: kd.keyword,
              searchVolume: ki.search_volume,
              difficulty: kd.keyword_properties?.keyword_difficulty ?? 0,
              cpc: ki.cpc,
              competition: ki.competition_level.toLowerCase() as "low" | "medium" | "high",
              rankPosition: rs?.rank_group ?? 0,
              rankUrl: rs?.url ?? "",
            });
          }
        }
      }
    }
  }

  return keywords;
}

/**
 * Get competitor domains for a domain
 * Uses DataForSEO Labs "Competitors Domain" endpoint
 *
 * @param domain - Domain to find competitors for
 * @param options - Location, language, and limit options
 * @returns Array of competitor domains with metrics
 */
export async function getCompetitorDomains(
  domain: string,
  options: {
    locationCode?: number;
    languageCode?: string;
    limit?: number;
    minIntersections?: number;
  } = {}
): Promise<CompetitorDomain[]> {
  const {
    locationCode = DEFAULT_LOCATION_CODE,
    languageCode = DEFAULT_LANGUAGE_CODE,
    limit = 20,
    minIntersections = 5,
  } = options;

  const client = getClient();

  // Clean domain
  const cleanDomain = domain
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
    .toLowerCase();

  const response = await client.post<DomainCompetitorsResultContainer>(
    "/v3/dataforseo_labs/google/competitors_domain/live",
    [
      {
        target: cleanDomain,
        location_code: locationCode,
        language_code: languageCode,
        limit,
        filters: [["intersections", ">=", minIntersections]],
        order_by: ["intersections,desc"],
      },
    ]
  );

  const competitors: CompetitorDomain[] = [];

  for (const task of response.tasks) {
    if (task.result) {
      for (const result of task.result) {
        if (result.items) {
          for (const item of result.items) {
            const organic = item.full_domain_metrics?.organic;

            competitors.push({
              domain: item.domain,
              avgPosition: item.avg_position,
              intersections: item.intersections,
              estimatedTraffic: organic?.etv ?? 0,
              keywordsCount: organic?.count ?? 0,
            });
          }
        }
      }
    }
  }

  return competitors;
}

/**
 * Get domain metrics overview
 * Returns basic stats about a domain's organic presence
 */
export interface DomainMetrics {
  domain: string;
  totalKeywords: number;
  estimatedTraffic: number;
  avgPosition: number;
  topPositions: number; // Keywords in positions 1-10
}

/**
 * Get metrics for a domain
 * Uses DataForSEO Labs "Domain Rank Overview" endpoint
 */
export async function getDomainMetrics(
  domain: string,
  options: {
    locationCode?: number;
    languageCode?: string;
  } = {}
): Promise<DomainMetrics | null> {
  const {
    locationCode = DEFAULT_LOCATION_CODE,
    languageCode = DEFAULT_LANGUAGE_CODE,
  } = options;

  const client = getClient();

  // Clean domain
  const cleanDomain = domain
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
    .toLowerCase();

  interface DomainRankResult {
    target: string;
    location_code: number;
    language_code: string;
    total_count: number;
    items_count: number;
    items: Array<{
      se_type: string;
      target: string;
      metrics: {
        organic: {
          pos_1: number;
          pos_2_3: number;
          pos_4_10: number;
          count: number;
          etv: number;
          avg_position?: number;
        };
      };
    }> | null;
  }

  try {
    const response = await client.post<DomainRankResult>(
      "/v3/dataforseo_labs/google/domain_rank_overview/live",
      [
        {
          target: cleanDomain,
          location_code: locationCode,
          language_code: languageCode,
        },
      ]
    );

    for (const task of response.tasks) {
      if (task.result) {
        for (const result of task.result) {
          if (result.items?.[0]) {
            const item = result.items[0];
            const organic = item.metrics?.organic;

            if (organic) {
              const topPositions =
                (organic.pos_1 ?? 0) +
                (organic.pos_2_3 ?? 0) +
                (organic.pos_4_10 ?? 0);

              return {
                domain: cleanDomain,
                totalKeywords: organic.count ?? 0,
                estimatedTraffic: organic.etv ?? 0,
                avgPosition: organic.avg_position ?? 0,
                topPositions,
              };
            }
          }
        }
      }
    }

    return null;
  } catch {
    console.error("Failed to get domain metrics:", domain);
    return null;
  }
}

/**
 * Analyze competitors for a set of keywords
 * Combines SERP analysis with domain metrics
 *
 * @param serpDomains - Domains found from SERP analysis with counts
 * @param options - Location and language options
 * @returns Enriched competitor data with metrics
 */
export async function analyzeCompetitors(
  serpDomains: Array<{ domain: string; count: number; avgPosition: number }>,
  options: {
    locationCode?: number;
    languageCode?: string;
    limit?: number;
  } = {}
): Promise<CompetitorDomain[]> {
  const { locationCode, languageCode, limit = 10 } = options;

  // Take top N competitors
  const topDomains = serpDomains.slice(0, limit);

  // Fetch metrics for each domain in parallel
  const metricsPromises = topDomains.map((d) =>
    getDomainMetrics(d.domain, { locationCode, languageCode })
  );

  const metricsResults = await Promise.allSettled(metricsPromises);

  const competitors: CompetitorDomain[] = topDomains.map((d, i) => {
    const metricsResult = metricsResults[i];
    const metrics =
      metricsResult.status === "fulfilled" ? metricsResult.value : null;

    return {
      domain: d.domain,
      avgPosition: d.avgPosition,
      intersections: d.count,
      estimatedTraffic: metrics?.estimatedTraffic ?? 0,
      keywordsCount: metrics?.totalKeywords ?? 0,
    };
  });

  return competitors;
}
