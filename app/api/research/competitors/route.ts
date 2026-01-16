import { NextResponse } from "next/server";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { getSerpResultsBatch, extractCompetitorDomains } from "@/lib/dataforseo/serp";
import { analyzeCompetitors, getKeywordsForSite } from "@/lib/dataforseo/competitors";
import {
  reserveCredits,
  rollbackCredits,
  getBalance,
  calculateSerpCredits,
  CREDIT_COSTS,
} from "@/lib/credits";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getSession, updateSession, addCreditsUsed } from "@/lib/research/sessions";

/**
 * POST /api/research/competitors
 * Discover competitors from SERP analysis
 *
 * This is the main endpoint for Tab 2 (Competitor Discovery)
 */
export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check rate limit
    const rateLimit = checkRateLimit(user.id, 50, 60000);
    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit);
    }

    const body = await request.json();
    const {
      sessionId,
      keywords,
      locationCode = 2840,
      languageCode = "en",
      serpKeywordCount = 5,
      competitorLimit = 5,
      fetchCompetitorKeywords = true,
    } = body;

    // Validate session
    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    if (session.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get keywords to analyze (from request or session)
    let keywordsToAnalyze: string[] = keywords;

    if (!keywordsToAnalyze || keywordsToAnalyze.length === 0) {
      // Use top keywords from session by search volume
      const sessionKeywords = session.keywords ?? [];
      keywordsToAnalyze = sessionKeywords
        .sort((a, b) => b.searchVolume - a.searchVolume)
        .slice(0, serpKeywordCount)
        .map((k) => k.keyword);
    }

    if (keywordsToAnalyze.length === 0) {
      return NextResponse.json(
        { error: "No keywords available. Complete validation step first." },
        { status: 400 }
      );
    }

    // Limit keywords for SERP analysis
    const serpKeywords = keywordsToAnalyze.slice(0, Math.min(serpKeywordCount, 10));

    // Estimate credits:
    // - SERP checks: 0.5 per keyword
    // - Keywords for site: 2 per competitor (if fetching keywords)
    const serpCredits = calculateSerpCredits(serpKeywords.length);
    const competitorCredits = fetchCompetitorKeywords
      ? competitorLimit * CREDIT_COSTS.KEYWORDS_FOR_SITE
      : 0;
    const estimatedCredits = serpCredits + competitorCredits;

    // Reserve credits
    let transactionId: string;
    try {
      transactionId = await reserveCredits(
        user.id,
        estimatedCredits,
        `Research: Competitor discovery for session`
      );
    } catch {
      return NextResponse.json(
        {
          error: "Insufficient credits",
          creditsNeeded: estimatedCredits,
          code: "INSUFFICIENT_CREDITS",
        },
        { status: 402 }
      );
    }

    let actualCreditsUsed = 0;

    try {
      // Step 1: Get SERP results for keywords
      const serpResults = await getSerpResultsBatch(serpKeywords, {
        locationCode,
        languageCode,
        depth: 10,
      });
      actualCreditsUsed += serpCredits;

      // Step 2: Extract competitor domains from SERP results
      const domainStats = extractCompetitorDomains(serpResults);

      // Step 3: Analyze top competitors with metrics
      const topDomains = domainStats.slice(0, competitorLimit);
      const competitors = await analyzeCompetitors(topDomains, {
        locationCode,
        languageCode,
        limit: competitorLimit,
      });

      // Step 4: Optionally fetch competitor keywords
      let competitorKeywords: Array<{
        domain: string;
        keywords: Awaited<ReturnType<typeof getKeywordsForSite>>;
      }> = [];

      if (fetchCompetitorKeywords && competitors.length > 0) {
        // Fetch keywords for top 3 competitors
        const topCompetitors = competitors.slice(0, 3);

        const keywordPromises = topCompetitors.map(async (comp) => {
          const kws = await getKeywordsForSite(comp.domain, {
            locationCode,
            languageCode,
            limit: 50,
          });
          return { domain: comp.domain, keywords: kws };
        });

        competitorKeywords = await Promise.all(keywordPromises);
        actualCreditsUsed += topCompetitors.length * CREDIT_COSTS.KEYWORDS_FOR_SITE;
      }

      // Flatten competitor keywords for storage
      const allCompetitorKeywords = competitorKeywords.flatMap((ck) =>
        ck.keywords.map((k) => ({ ...k, sourceDomain: ck.domain }))
      );

      // Update session with results
      await updateSession(sessionId, {
        competitors,
        competitorKeywords: allCompetitorKeywords,
        currentTab: 2,
      });

      // Add credits used to session
      await addCreditsUsed(sessionId, actualCreditsUsed);

      // Get updated balance
      const newBalance = await getBalance(user.id);

      // Log API usage (fire-and-forget, don't fail request if logging fails)
      createClient().then((supabase) => {
        supabase
          .from("api_usage")
          .insert({
            user_id: user.id,
            endpoint: "/api/research/competitors",
            credits_used: actualCreditsUsed,
            keywords_count: serpKeywords.length,
            response_status: 200,
          })
          .then(({ error }) => {
            if (error) console.error("Failed to log API usage:", error);
          });
      });

      return NextResponse.json({
        data: {
          serpResults,
          competitors,
          competitorKeywords: competitorKeywords.map((ck) => ({
            domain: ck.domain,
            keywordsCount: ck.keywords.length,
            topKeywords: ck.keywords.slice(0, 10),
          })),
        },
        creditsUsed: actualCreditsUsed,
        creditsRemaining: newBalance,
      });
    } catch (error) {
      // Rollback credits on failure
      await rollbackCredits(transactionId);
      throw error;
    }
  } catch (error) {
    console.error("Research competitors error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to discover competitors" },
      { status: 500 }
    );
  }
}
