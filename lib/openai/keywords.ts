/**
 * OpenAI Keyword Generation
 *
 * Uses GPT-5 nano to generate keyword ideas from natural language descriptions.
 */

import { getOpenAI, OPENAI_CONFIG } from "./client";
import { withRetry } from "./retry";
import {
  LOCATIONS_BY_CODE,
  DEFAULT_LOCATION_CODE,
} from "@/lib/constants/locations";

/**
 * Generated keywords response
 */
export interface GeneratedKeywords {
  keywords: string[];
  seedTopics: string[];
  marketAngle: string;
}

/**
 * Generate keyword ideas from a natural language description
 *
 * @param description - User's description of their niche/idea
 * @param locationCode - DataForSEO location code
 * @param languageCode - Language code (e.g., "en", "es")
 * @returns Generated keywords and market insights
 */
export async function generateKeywords(
  description: string,
  locationCode: number = DEFAULT_LOCATION_CODE,
  languageCode: string = "en"
): Promise<GeneratedKeywords> {
  const openai = getOpenAI();
  const location = LOCATIONS_BY_CODE.get(locationCode) ?? LOCATIONS_BY_CODE.get(DEFAULT_LOCATION_CODE)!;

  const systemPrompt = `You are a keyword research assistant specializing in SEO. Generate search keywords that real users would type into Google.

Your task: Generate 10-15 keyword ideas for market validation based on the user's description.

Rules:
1. Generate keywords in ${languageCode === "en" ? "English" : location.languageName} appropriate for ${location.name}
2. Mix different intents: informational (how to, what is), commercial (best, review), transactional (buy, price)
3. Include a mix of short-tail (1-2 words) and long-tail (3-5 words) keywords
4. Focus on keywords real people would search for
5. Consider local variations and terminology for ${location.name}

Output ONLY valid JSON in this exact format, no other text:
{
  "keywords": ["keyword1", "keyword2", ...],
  "seedTopics": ["topic1", "topic2", "topic3"],
  "marketAngle": "Brief 1-2 sentence description of the market opportunity"
}`;

  const userPrompt = `Generate keyword ideas for this niche:
"${description}"

Location: ${location.name}
Language: ${languageCode === "en" ? "English" : location.languageName}`;

  // Wrap entire flow in retry so empty responses trigger retry
  return withRetry(
    async () => {
      const response = await openai.chat.completions.create({
        model: OPENAI_CONFIG.model,
        max_completion_tokens: OPENAI_CONFIG.maxCompletionTokens,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content;

      if (!content) {
        console.error("[OpenAI] generateKeywords - empty response:", {
          choicesLength: response.choices?.length ?? 0,
          finishReason: response.choices[0]?.finish_reason,
          refusal: response.choices[0]?.message?.refusal,
          usage: response.usage,
          model: response.model,
        });
        throw new Error("No response from OpenAI");
      }

      try {
        const parsed = JSON.parse(content) as {
          keywords?: string[];
          seedTopics?: string[];
          marketAngle?: string;
        };

        return {
          keywords: parsed.keywords ?? [],
          seedTopics: parsed.seedTopics ?? [],
          marketAngle: parsed.marketAngle ?? "",
        };
      } catch {
        throw new Error("Failed to parse OpenAI response as JSON");
      }
    },
    { label: "generateKeywords" }
  );
}

/**
 * Generate a title from a description
 * Used for auto-naming research sessions
 */
export async function generateTitle(description: string): Promise<string> {
  const openai = getOpenAI();

  const response = await openai.chat.completions.create({
    model: OPENAI_CONFIG.model,
    max_completion_tokens: 50,
    messages: [
      {
        role: "system",
        content:
          "Generate a short title (2-4 words) for a keyword research session. Return ONLY the title, no quotes or extra text.",
      },
      {
        role: "user",
        content: description,
      },
    ],
  });

  const title = response.choices[0]?.message?.content?.trim() || "Research Session";

  // Clean up and truncate if needed
  return title.replace(/["']/g, "").slice(0, 50);
}

/**
 * Smart suggestion for additional analysis options
 */
export interface ContextualSuggestion {
  type: "trends" | "backlinks" | "local" | "competitor";
  label: string;
  description: string;
  reason: string;
  available: boolean;
}

/**
 * Detect contextual suggestions based on user's description
 * Returns relevant analysis suggestions based on detected patterns
 *
 * @param description - User's niche/idea description
 * @returns Array of contextual suggestions
 */
export function detectContextualSuggestions(description: string): ContextualSuggestion[] {
  const suggestions: ContextualSuggestion[] = [];
  const lowerDesc = description.toLowerCase();

  // Detect URL/domain patterns - suggest backlinks analysis
  const urlPattern = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})+)/;
  if (urlPattern.test(description)) {
    suggestions.push({
      type: "backlinks",
      label: "Analyze Backlinks",
      description: "View backlink profile and referring domains for this site",
      reason: "Domain detected in description",
      available: false, // Phase 2
    });
  }

  // Detect product/launch/seasonal keywords - suggest trends
  const trendKeywords = [
    "product", "launch", "new", "seasonal", "holiday", "christmas", "summer",
    "winter", "spring", "fall", "black friday", "prime day", "sale", "trend",
    "trending", "2024", "2025", "upcoming"
  ];
  if (trendKeywords.some(kw => lowerDesc.includes(kw))) {
    suggestions.push({
      type: "trends",
      label: "View Trends",
      description: "Check Google Trends for seasonality and interest over time",
      reason: "Product/launch/seasonal terms detected",
      available: false, // Phase 2
    });
  }

  // Detect local business terms - suggest local SEO
  const localKeywords = [
    "near me", "local", "city", "store", "shop", "restaurant", "clinic",
    "dentist", "lawyer", "plumber", "salon", "gym", "hotel", "cafe",
    "delivery", "service area"
  ];
  if (localKeywords.some(kw => lowerDesc.includes(kw))) {
    suggestions.push({
      type: "local",
      label: "Local SEO Analysis",
      description: "Analyze local search competition and map pack opportunities",
      reason: "Local business terms detected",
      available: false, // Phase 2
    });
  }

  // Detect competitor mentions - suggest competitor analysis
  const competitorKeywords = [
    "competitor", "vs", "versus", "alternative", "like", "similar to",
    "better than", "compare", "competing"
  ];
  if (competitorKeywords.some(kw => lowerDesc.includes(kw))) {
    suggestions.push({
      type: "competitor",
      label: "Competitor Analysis",
      description: "Find and analyze competitor keywords and content",
      reason: "Competitor-related terms detected",
      available: true, // Available in Tab 2
    });
  }

  return suggestions;
}

/**
 * Classify keyword intent
 */
export type KeywordIntent =
  | "informational"
  | "commercial"
  | "transactional"
  | "navigational";

/**
 * Classify keywords by search intent
 * Returns a map of keyword -> intent
 */
export async function classifyKeywordIntents(
  keywords: string[]
): Promise<Map<string, KeywordIntent>> {
  const openai = getOpenAI();

  const systemPrompt = `Classify each keyword by search intent:
- informational: user wants to learn (how to, what is, guide, tutorial)
- commercial: user is researching before buying (best, review, comparison, vs)
- transactional: user wants to buy/do something (buy, price, discount, near me)
- navigational: user is looking for a specific site/brand

Output ONLY valid JSON mapping keywords to intents:
{"keyword1": "informational", "keyword2": "commercial", ...}`;

  const response = await openai.chat.completions.create({
    model: OPENAI_CONFIG.model,
    max_completion_tokens: 1000,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Classify these keywords:\n${keywords.join("\n")}` },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    return new Map();
  }

  try {
    const parsed = JSON.parse(content) as Record<string, string>;
    const result = new Map<string, KeywordIntent>();

    for (const [keyword, intent] of Object.entries(parsed)) {
      if (
        intent === "informational" ||
        intent === "commercial" ||
        intent === "transactional" ||
        intent === "navigational"
      ) {
        result.set(keyword, intent);
      }
    }

    return result;
  } catch {
    return new Map();
  }
}
