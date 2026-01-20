/**
 * OpenAI Content Clustering
 *
 * Uses GPT-5 nano to group keywords into content clusters for content planning.
 */

import { getOpenAI, OPENAI_CONFIG } from "./client";
import { withRetry } from "./retry";

/**
 * Content cluster with grouped keywords
 */
export interface ContentCluster {
  name: string;
  mainKeyword: string;
  supportingKeywords: string[];
  contentType: "Guide" | "Review" | "List" | "Comparison" | "Tutorial" | "News";
  suggestedTitle: string;
  priority: "high" | "medium" | "low";
  estimatedVolume?: number;
  avgDifficulty?: number;
}

/**
 * Keyword with metrics for clustering
 */
export interface KeywordWithMetrics {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  cpc?: number;
}

/**
 * Group keywords into content clusters
 *
 * @param keywords - Keywords with metrics to cluster
 * @param nicheDescription - Original niche description for context
 * @returns Array of content clusters
 */
export async function clusterKeywords(
  keywords: KeywordWithMetrics[],
  nicheDescription: string
): Promise<ContentCluster[]> {
  const openai = getOpenAI();

  // Prepare keyword list with metrics
  const keywordList = keywords
    .map((k) => `${k.keyword} (vol: ${k.searchVolume}, diff: ${k.difficulty})`)
    .join("\n");

  const systemPrompt = `You are a content strategist. Group keywords into content clusters for a blog/website.

Rules:
1. Group semantically related keywords together
2. Each cluster should target 1 main keyword (highest volume, reasonable difficulty)
3. Include 2-5 supporting keywords per cluster
4. Suggest a compelling title for each cluster
5. Prioritize: high = high volume + low difficulty, medium = moderate both, low = low volume or high difficulty
6. Choose content type based on intent:
   - Guide: educational, how-to
   - Review: product/service evaluation
   - List: collections, roundups
   - Comparison: vs, alternatives
   - Tutorial: step-by-step instructions
   - News: current events, updates

Output ONLY valid JSON:
{
  "clusters": [
    {
      "name": "Cluster name",
      "mainKeyword": "primary target keyword",
      "supportingKeywords": ["kw1", "kw2"],
      "contentType": "Guide",
      "suggestedTitle": "Compelling article title",
      "priority": "high"
    }
  ]
}`;

  const userPrompt = `Group these keywords into content clusters for a ${nicheDescription} website:

${keywordList}

Create 3-8 clusters based on the keywords provided.`;

  // Wrap entire flow in retry so empty responses trigger retry
  return withRetry(
    async () => {
      const response = await openai.chat.completions.create({
        model: OPENAI_CONFIG.model,
        max_completion_tokens: 2000,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content;

      if (!content) {
        console.error("[OpenAI] clusterKeywords - empty response:", {
          choicesLength: response.choices?.length ?? 0,
          finishReason: response.choices[0]?.finish_reason,
          refusal: response.choices[0]?.message?.refusal,
          usage: response.usage,
          model: response.model,
        });
        throw new Error("No response from OpenAI");
      }

      try {
        const parsed = JSON.parse(content) as { clusters?: ContentCluster[] };
        const clusters = parsed.clusters ?? [];

        // Enrich clusters with metrics
        const keywordMap = new Map(keywords.map((k) => [k.keyword.toLowerCase(), k]));

        return clusters.map((cluster) => {
          const mainKw = keywordMap.get(cluster.mainKeyword.toLowerCase());
          const supportingKws = cluster.supportingKeywords
            .map((kw) => keywordMap.get(kw.toLowerCase()))
            .filter((k): k is KeywordWithMetrics => k !== undefined);

          const allKws = mainKw ? [mainKw, ...supportingKws] : supportingKws;

          return {
            ...cluster,
            estimatedVolume: allKws.reduce((sum, k) => sum + k.searchVolume, 0),
            avgDifficulty:
              allKws.length > 0
                ? Math.round(allKws.reduce((sum, k) => sum + k.difficulty, 0) / allKws.length)
                : 0,
          };
        });
      } catch {
        throw new Error("Failed to parse OpenAI response as JSON");
      }
    },
    { label: "clusterKeywords" }
  );
}

/**
 * Content gap item
 */
export interface ContentGap {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  competitorDomain: string;
  opportunity: "high" | "medium" | "low";
  suggestedAction: string;
}

/**
 * Identify content gaps - keywords competitors rank for that you don't target
 *
 * @param yourKeywords - Keywords you're targeting
 * @param competitorKeywords - Keywords competitors rank for
 * @param nicheDescription - Context for prioritization
 * @returns Content gap opportunities
 */
export async function identifyContentGaps(
  yourKeywords: string[],
  competitorKeywords: KeywordWithMetrics[],
  nicheDescription: string
): Promise<ContentGap[]> {
  const openai = getOpenAI();

  // Find keywords competitors have that you don't
  const yourSet = new Set(yourKeywords.map((k) => k.toLowerCase()));
  const gaps = competitorKeywords.filter(
    (k) => !yourSet.has(k.keyword.toLowerCase())
  );

  if (gaps.length === 0) {
    return [];
  }

  // Limit to top 20 gaps by volume for LLM analysis
  const topGaps = gaps.sort((a, b) => b.searchVolume - a.searchVolume).slice(0, 20);

  const gapList = topGaps
    .map((k) => `${k.keyword} (vol: ${k.searchVolume}, diff: ${k.difficulty})`)
    .join("\n");

  const systemPrompt = `You are a competitive SEO analyst. Analyze content gaps and suggest actions.

For each gap keyword, determine:
1. Opportunity level: high (volume >1000, diff <40), medium (volume >100 or diff <60), low (other)
2. Suggested action: brief recommendation for how to target this keyword

Output ONLY valid JSON:
{
  "gaps": [
    {
      "keyword": "keyword",
      "opportunity": "high",
      "suggestedAction": "Create a comprehensive guide covering..."
    }
  ]
}`;

  const userPrompt = `Analyze these content gap keywords for a ${nicheDescription} website:

${gapList}

Prioritize and suggest actions for each.`;

  const response = await openai.chat.completions.create({
    model: OPENAI_CONFIG.model,
    max_completion_tokens: 1500,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    return [];
  }

  try {
    const parsed = JSON.parse(content) as {
      gaps?: Array<{
        keyword: string;
        opportunity: "high" | "medium" | "low";
        suggestedAction: string;
      }>;
    };

    // Merge LLM analysis with metrics
    const gapMap = new Map(topGaps.map((g) => [g.keyword.toLowerCase(), g]));

    return (parsed.gaps ?? []).map((g) => {
      const metrics = gapMap.get(g.keyword.toLowerCase());
      return {
        keyword: g.keyword,
        searchVolume: metrics?.searchVolume ?? 0,
        difficulty: metrics?.difficulty ?? 0,
        competitorDomain: "", // Will be filled by caller
        opportunity: g.opportunity,
        suggestedAction: g.suggestedAction,
      };
    });
  } catch {
    return [];
  }
}

/**
 * Generate market validation summary
 */
export interface ValidationSummary {
  demandLevel: "excellent" | "good" | "moderate" | "low";
  competitionLevel: "low" | "moderate" | "high" | "very_high";
  opportunityScore: number;
  insight: string;
  recommendation: string;
}

/**
 * Generate a validation summary from keyword metrics
 *
 * @param keywords - Keywords with metrics
 * @param nicheDescription - Context
 * @returns Validation summary with insights
 */
export async function generateValidationSummary(
  keywords: KeywordWithMetrics[],
  nicheDescription: string
): Promise<ValidationSummary> {
  const openai = getOpenAI();

  // Calculate aggregate metrics
  const totalVolume = keywords.reduce((sum, k) => sum + k.searchVolume, 0);
  const avgVolume = keywords.length > 0 ? totalVolume / keywords.length : 0;
  const avgDifficulty =
    keywords.length > 0
      ? keywords.reduce((sum, k) => sum + k.difficulty, 0) / keywords.length
      : 0;

  // Simple heuristics for demand/competition levels
  let demandLevel: ValidationSummary["demandLevel"];
  if (avgVolume >= 5000) demandLevel = "excellent";
  else if (avgVolume >= 1000) demandLevel = "good";
  else if (avgVolume >= 100) demandLevel = "moderate";
  else demandLevel = "low";

  let competitionLevel: ValidationSummary["competitionLevel"];
  if (avgDifficulty >= 70) competitionLevel = "very_high";
  else if (avgDifficulty >= 50) competitionLevel = "high";
  else if (avgDifficulty >= 30) competitionLevel = "moderate";
  else competitionLevel = "low";

  // Calculate opportunity score (0-100)
  // Higher volume + lower difficulty = higher opportunity
  const volumeScore = Math.min(100, (Math.log10(Math.max(avgVolume, 1)) / 4) * 100);
  const difficultyScore = 100 - avgDifficulty;
  const opportunityScore = Math.round(volumeScore * 0.5 + difficultyScore * 0.5);

  // Get LLM insight
  const keywordSample = keywords.slice(0, 10).map((k) => k.keyword).join(", ");

  const response = await openai.chat.completions.create({
    model: OPENAI_CONFIG.model,
    max_completion_tokens: 300,
    messages: [
      {
        role: "system",
        content:
          "You are an SEO consultant. Provide a brief, actionable insight about a niche based on keyword data. Be direct and specific.",
      },
      {
        role: "user",
        content: `Niche: ${nicheDescription}
Total monthly searches: ${totalVolume.toLocaleString()}
Average difficulty: ${Math.round(avgDifficulty)}/100
Sample keywords: ${keywordSample}

Provide:
1. A 1-2 sentence insight about this market
2. A specific recommendation for the user

Output ONLY valid JSON:
{"insight": "...", "recommendation": "..."}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  let insight = "This niche shows potential for growth.";
  let recommendation = "Start by targeting the lowest difficulty keywords.";

  if (content) {
    try {
      const parsed = JSON.parse(content) as {
        insight?: string;
        recommendation?: string;
      };
      insight = parsed.insight ?? insight;
      recommendation = parsed.recommendation ?? recommendation;
    } catch {
      // Use defaults
    }
  }

  return {
    demandLevel,
    competitionLevel,
    opportunityScore,
    insight,
    recommendation,
  };
}
