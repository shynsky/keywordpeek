/**
 * DataForSEO Keywords Module
 *
 * Handles keyword research API calls with caching to reduce costs.
 */

import { getClient, DataForSEOApiError } from "./client";
import { createServiceClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";
import type {
  KeywordSearchVolumeResult,
  KeywordsForKeywordsResult,
  GoogleSuggestResult,
  SerpResult,
  PeopleAlsoAskItem,
  KeywordResult,
  KeywordResultExtended,
  MonthlyTrend,
} from "./types";

// Default settings
const DEFAULT_LOCATION_CODE = 2840; // United States
const DEFAULT_LANGUAGE_CODE = "en";
const CACHE_TTL_HOURS = 24;

// =============================================================================
// Keyword Score Calculation
// =============================================================================

/**
 * Calculate a 0-100 keyword opportunity score
 *
 * Higher score = better opportunity
 * Factors:
 * - Search volume (logarithmic scale, more volume = higher)
 * - Competition (lower = higher score)
 * - CPC (higher CPC = more commercial value = higher score)
 *
 * Formula:
 * score = (volumeScore * 0.4) + (competitionScore * 0.4) + (cpcScore * 0.2)
 */
export function calculateKeywordScore(
  searchVolume: number,
  competition: number, // 0-1
  cpc: number
): number {
  // Volume score: log scale, capped at 100k
  // log10(100) = 2, log10(100000) = 5
  const volumeScore = Math.min(
    100,
    (Math.log10(Math.max(searchVolume, 1)) / 5) * 100
  );

  // Competition score: invert so lower competition = higher score
  const competitionScore = (1 - competition) * 100;

  // CPC score: higher CPC = more valuable, cap at $20
  const cpcScore = Math.min(100, (cpc / 20) * 100);

  // Weighted combination
  const score =
    volumeScore * 0.4 + competitionScore * 0.4 + cpcScore * 0.2;

  return Math.round(Math.max(0, Math.min(100, score)));
}

/**
 * Estimate keyword difficulty from competition and SERP data
 * Returns 0-100 score (higher = more difficult)
 */
export function estimateDifficulty(
  competition: number,
  searchVolume: number
): number {
  // Base difficulty from competition
  let difficulty = competition * 60;

  // Higher volume keywords tend to be more competitive
  if (searchVolume > 10000) {
    difficulty += 20;
  } else if (searchVolume > 1000) {
    difficulty += 10;
  }

  return Math.round(Math.max(0, Math.min(100, difficulty)));
}

// =============================================================================
// Cache Functions
// =============================================================================

/**
 * Check cache for keyword data
 */
async function getCachedKeyword(
  keyword: string,
  locationCode: number = DEFAULT_LOCATION_CODE,
  languageCode: string = DEFAULT_LANGUAGE_CODE
): Promise<KeywordResult | null> {
  try {
    const supabase = await createServiceClient();
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - CACHE_TTL_HOURS);

    const { data, error } = await supabase
      .from("keyword_cache")
      .select("data, fetched_at")
      .eq("keyword", keyword.toLowerCase())
      .eq("location_code", locationCode)
      .eq("language_code", languageCode)
      .gte("fetched_at", cutoff.toISOString())
      .single();

    if (error || !data) {
      return null;
    }

    return data.data as unknown as KeywordResult;
  } catch {
    return null;
  }
}

/**
 * Store keyword data in cache
 */
async function cacheKeyword(
  keyword: string,
  result: KeywordResult,
  locationCode: number = DEFAULT_LOCATION_CODE,
  languageCode: string = DEFAULT_LANGUAGE_CODE
): Promise<void> {
  try {
    const supabase = await createServiceClient();

    await supabase.from("keyword_cache").upsert(
      {
        keyword: keyword.toLowerCase(),
        location_code: locationCode,
        language_code: languageCode,
        data: result as unknown as Json,
        fetched_at: new Date().toISOString(),
      },
      {
        onConflict: "keyword,location_code,language_code",
      }
    );
  } catch (error) {
    console.error("Failed to cache keyword:", error);
  }
}

/**
 * Batch check cache for multiple keywords
 */
async function getCachedKeywords(
  keywords: string[],
  locationCode: number = DEFAULT_LOCATION_CODE,
  languageCode: string = DEFAULT_LANGUAGE_CODE
): Promise<Map<string, KeywordResult>> {
  const cached = new Map<string, KeywordResult>();

  try {
    const supabase = await createServiceClient();
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - CACHE_TTL_HOURS);

    const { data, error } = await supabase
      .from("keyword_cache")
      .select("keyword, data")
      .in(
        "keyword",
        keywords.map((k) => k.toLowerCase())
      )
      .eq("location_code", locationCode)
      .eq("language_code", languageCode)
      .gte("fetched_at", cutoff.toISOString());

    if (!error && data) {
      for (const row of data) {
        cached.set(row.keyword, row.data as unknown as KeywordResult);
      }
    }
  } catch {
    // Return empty map on error
  }

  return cached;
}

// =============================================================================
// API Functions
// =============================================================================

/**
 * Transform API response to normalized KeywordResult
 */
function transformSearchVolumeResult(
  result: KeywordSearchVolumeResult
): KeywordResult {
  const { keyword_info, search_intent_info } = result;

  const competition = keyword_info.competition ?? 0;
  const searchVolume = keyword_info.search_volume ?? 0;
  const cpc = keyword_info.cpc ?? 0;

  // Map competition level
  const competitionLevel =
    keyword_info.competition_level?.toLowerCase() as
      | "low"
      | "medium"
      | "high";

  // Map intent
  const intent = search_intent_info?.main_intent ?? null;

  // Transform monthly searches to trend
  const trend: MonthlyTrend[] = (keyword_info.monthly_searches ?? []).map(
    (m) => ({
      year: m.year,
      month: m.month,
      volume: m.search_volume,
    })
  );

  return {
    keyword: result.keyword,
    searchVolume,
    cpc,
    competition: competitionLevel ?? "medium",
    competitionScore: competition,
    difficulty: estimateDifficulty(competition, searchVolume),
    keywordScore: calculateKeywordScore(searchVolume, competition, cpc),
    intent,
    trend,
    locationCode: result.location_code,
    languageCode: result.language_code,
  };
}

/**
 * Search for keyword data (volume, CPC, competition)
 * Uses cache when available
 */
export async function searchKeywords(
  keywords: string[],
  options: {
    locationCode?: number;
    languageCode?: string;
    skipCache?: boolean;
  } = {}
): Promise<KeywordResult[]> {
  const {
    locationCode = DEFAULT_LOCATION_CODE,
    languageCode = DEFAULT_LANGUAGE_CODE,
    skipCache = false,
  } = options;

  const results: KeywordResult[] = [];
  let keywordsToFetch = keywords;

  // Check cache first
  if (!skipCache) {
    const cached = await getCachedKeywords(keywords, locationCode, languageCode);

    for (const keyword of keywords) {
      const cachedResult = cached.get(keyword.toLowerCase());
      if (cachedResult) {
        results.push(cachedResult);
      }
    }

    // Filter out cached keywords
    keywordsToFetch = keywords.filter(
      (k) => !cached.has(k.toLowerCase())
    );
  }

  // Fetch remaining keywords from API
  if (keywordsToFetch.length > 0) {
    const client = getClient();

    const response = await client.post<KeywordSearchVolumeResult>(
      "/v3/keywords_data/google_ads/search_volume/live",
      [
        {
          keywords: keywordsToFetch,
          location_code: locationCode,
          language_code: languageCode,
          include_serp_info: false,
          include_clickstream_data: false,
        },
      ]
    );

    // Process results
    for (const task of response.tasks) {
      if (task.result) {
        for (const item of task.result) {
          const transformed = transformSearchVolumeResult(item);
          results.push(transformed);

          // Cache the result
          if (!skipCache) {
            await cacheKeyword(
              item.keyword,
              transformed,
              locationCode,
              languageCode
            );
          }
        }
      }
    }
  }

  // Sort results to match input order
  const keywordOrder = new Map(
    keywords.map((k, i) => [k.toLowerCase(), i])
  );
  results.sort((a, b) => {
    const orderA = keywordOrder.get(a.keyword.toLowerCase()) ?? 999;
    const orderB = keywordOrder.get(b.keyword.toLowerCase()) ?? 999;
    return orderA - orderB;
  });

  return results;
}

/**
 * Get a single keyword with full data
 */
export async function searchKeyword(
  keyword: string,
  options: {
    locationCode?: number;
    languageCode?: string;
    skipCache?: boolean;
  } = {}
): Promise<KeywordResult | null> {
  const results = await searchKeywords([keyword], options);
  return results[0] ?? null;
}

/**
 * Get related keywords (keywords for keywords)
 */
export async function getRelatedKeywords(
  keyword: string,
  options: {
    locationCode?: number;
    languageCode?: string;
    limit?: number;
  } = {}
): Promise<string[]> {
  const {
    locationCode = DEFAULT_LOCATION_CODE,
    languageCode = DEFAULT_LANGUAGE_CODE,
    limit = 20,
  } = options;

  try {
    const client = getClient();

    const response = await client.post<KeywordsForKeywordsResult>(
      "/v3/keywords_data/google_ads/keywords_for_keywords/live",
      [
        {
          keyword,
          location_code: locationCode,
          language_code: languageCode,
          include_seed_keyword: false,
          limit,
        },
      ]
    );

    const suggestions: string[] = [];

    for (const task of response.tasks) {
      if (task.result) {
        for (const item of task.result) {
          suggestions.push(item.keyword);
        }
      }
    }

    return suggestions;
  } catch (error) {
    console.error("Failed to get related keywords:", error);
    return [];
  }
}

/**
 * Get Google autocomplete suggestions
 */
export async function getAutocompleteSuggestions(
  keyword: string,
  options: {
    locationCode?: number;
    languageCode?: string;
  } = {}
): Promise<string[]> {
  const {
    locationCode = DEFAULT_LOCATION_CODE,
    languageCode = DEFAULT_LANGUAGE_CODE,
  } = options;

  try {
    const client = getClient();

    const response = await client.post<GoogleSuggestResult>(
      "/v3/keywords_data/google/suggest/live",
      [
        {
          keyword,
          location_code: locationCode,
          language_code: languageCode,
        },
      ]
    );

    const suggestions: string[] = [];

    for (const task of response.tasks) {
      if (task.result) {
        for (const result of task.result) {
          for (const item of result.items ?? []) {
            suggestions.push(item.suggestion);
          }
        }
      }
    }

    return suggestions;
  } catch (error) {
    console.error("Failed to get autocomplete suggestions:", error);
    return [];
  }
}

/**
 * Get People Also Ask questions from SERP
 */
export async function getPeopleAlsoAsk(
  keyword: string,
  options: {
    locationCode?: number;
    languageCode?: string;
  } = {}
): Promise<string[]> {
  const {
    locationCode = DEFAULT_LOCATION_CODE,
    languageCode = DEFAULT_LANGUAGE_CODE,
  } = options;

  try {
    const client = getClient();

    const response = await client.post<SerpResult>(
      "/v3/serp/google/organic/live/regular",
      [
        {
          keyword,
          location_code: locationCode,
          language_code: languageCode,
          device: "desktop",
          depth: 10,
        },
      ]
    );

    const questions: string[] = [];

    for (const task of response.tasks) {
      if (task.result) {
        for (const result of task.result) {
          for (const item of result.items ?? []) {
            if (item.type === "people_also_ask") {
              const paaItem = item as PeopleAlsoAskItem;
              questions.push(paaItem.title);

              // Also get expanded questions if available
              if (paaItem.items) {
                for (const expanded of paaItem.items) {
                  questions.push(expanded.title);
                }
              }
            }
          }
        }
      }
    }

    return [...new Set(questions)]; // Dedupe
  } catch (error) {
    console.error("Failed to get People Also Ask:", error);
    return [];
  }
}

/**
 * Get full keyword data including suggestions and questions
 */
export async function searchKeywordExtended(
  keyword: string,
  options: {
    locationCode?: number;
    languageCode?: string;
    includeRelated?: boolean;
    includeAutocomplete?: boolean;
    includeQuestions?: boolean;
  } = {}
): Promise<KeywordResultExtended | null> {
  const {
    locationCode = DEFAULT_LOCATION_CODE,
    languageCode = DEFAULT_LANGUAGE_CODE,
    includeRelated = true,
    includeAutocomplete = true,
    includeQuestions = true,
  } = options;

  // Get base keyword data
  const baseResult = await searchKeyword(keyword, {
    locationCode,
    languageCode,
  });

  if (!baseResult) {
    return null;
  }

  const result: KeywordResultExtended = { ...baseResult };

  // Fetch additional data in parallel
  const promises: Promise<void>[] = [];

  if (includeRelated) {
    promises.push(
      getRelatedKeywords(keyword, { locationCode, languageCode }).then(
        (suggestions) => {
          result.suggestions = suggestions;
        }
      )
    );
  }

  if (includeAutocomplete) {
    promises.push(
      getAutocompleteSuggestions(keyword, { locationCode, languageCode }).then(
        (autocomplete) => {
          result.autocomplete = autocomplete;
        }
      )
    );
  }

  if (includeQuestions) {
    promises.push(
      getPeopleAlsoAsk(keyword, { locationCode, languageCode }).then(
        (questions) => {
          result.questions = questions;
        }
      )
    );
  }

  await Promise.allSettled(promises);

  return result;
}

// Re-export error type
export { DataForSEOApiError };
