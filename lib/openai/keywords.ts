/**
 * OpenAI Keyword Generation
 *
 * Uses GPT-5 nano to generate keyword ideas from natural language descriptions.
 */

import { getOpenAI, OPENAI_CONFIG } from "./client";
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

  const response = await openai.chat.completions.create({
    model: OPENAI_CONFIG.model,
    temperature: OPENAI_CONFIG.temperature,
    max_tokens: OPENAI_CONFIG.maxTokens,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
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
}

/**
 * Generate a title from a description
 * Used for auto-naming research sessions
 */
export async function generateTitle(description: string): Promise<string> {
  const openai = getOpenAI();

  const response = await openai.chat.completions.create({
    model: OPENAI_CONFIG.model,
    temperature: 0.3, // Low temperature for consistent naming
    max_tokens: 50,
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
    temperature: 0.3,
    max_tokens: 1000,
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
