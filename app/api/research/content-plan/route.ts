import { NextResponse } from "next/server";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { clusterKeywords, identifyContentGaps } from "@/lib/openai/clustering";
import {
  reserveCredits,
  rollbackCredits,
  getBalance,
  CREDIT_COSTS,
} from "@/lib/credits";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getSession, updateSession, addCreditsUsed } from "@/lib/research/sessions";

/**
 * POST /api/research/content-plan
 * Generate content clusters and identify gaps
 *
 * This is the main endpoint for Tab 3 (Content Planning)
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
    const { sessionId, includeGaps = true } = body;

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

    // Check we have keywords to cluster
    if (!session.keywords || session.keywords.length === 0) {
      return NextResponse.json(
        { error: "No keywords available. Complete validation step first." },
        { status: 400 }
      );
    }

    // Estimate credits:
    // - LLM content clustering: 1 credit
    // - LLM gap identification: 1 credit (if includeGaps)
    const estimatedCredits =
      CREDIT_COSTS.LLM_CONTENT_CLUSTERING +
      (includeGaps ? CREDIT_COSTS.LLM_CONTENT_CLUSTERING : 0);

    // Reserve credits
    let transactionId: string;
    try {
      transactionId = await reserveCredits(
        user.id,
        estimatedCredits,
        `Research: Content planning for session`
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
      // Prepare keywords with metrics
      const keywordsWithMetrics = session.keywords.map((k) => ({
        keyword: k.keyword,
        searchVolume: k.searchVolume,
        difficulty: k.difficulty,
        cpc: k.cpc,
      }));

      // Step 1: Cluster keywords into content topics
      const nicheDescription = session.description ?? session.title;
      const clusters = await clusterKeywords(keywordsWithMetrics, nicheDescription);
      actualCreditsUsed += CREDIT_COSTS.LLM_CONTENT_CLUSTERING;

      // Step 2: Identify content gaps (keywords competitors have that you don't)
      let contentGaps: Awaited<ReturnType<typeof identifyContentGaps>> = [];

      if (includeGaps && session.competitorKeywords && session.competitorKeywords.length > 0) {
        const yourKeywords = session.keywords.map((k) => k.keyword);
        const competitorKws = session.competitorKeywords.map((k) => ({
          keyword: k.keyword,
          searchVolume: k.searchVolume,
          difficulty: k.difficulty,
        }));

        contentGaps = await identifyContentGaps(
          yourKeywords,
          competitorKws,
          nicheDescription
        );
        actualCreditsUsed += CREDIT_COSTS.LLM_CONTENT_CLUSTERING;

        // Add source domain info to gaps
        const competitorKeywordMap = new Map(
          session.competitorKeywords.map((k) => [
            k.keyword.toLowerCase(),
            (k as { sourceDomain?: string }).sourceDomain ?? "",
          ])
        );

        contentGaps = contentGaps.map((gap) => ({
          ...gap,
          competitorDomain: competitorKeywordMap.get(gap.keyword.toLowerCase()) ?? "",
        }));
      }

      // Update session with results
      await updateSession(sessionId, {
        contentClusters: clusters,
        contentGaps,
        currentTab: 3,
        status: "completed",
      });

      // Add credits used to session
      await addCreditsUsed(sessionId, actualCreditsUsed);

      // Get updated balance
      const newBalance = await getBalance(user.id);

      // Log API usage
      const supabase = await createClient();
      await supabase.from("api_usage").insert({
        user_id: user.id,
        endpoint: "/api/research/content-plan",
        credits_used: actualCreditsUsed,
        keywords_count: session.keywords.length,
        response_status: 200,
      });

      return NextResponse.json({
        data: {
          clusters,
          contentGaps,
          summary: {
            totalClusters: clusters.length,
            highPriority: clusters.filter((c) => c.priority === "high").length,
            mediumPriority: clusters.filter((c) => c.priority === "medium").length,
            lowPriority: clusters.filter((c) => c.priority === "low").length,
            totalGaps: contentGaps.length,
          },
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
    console.error("Research content-plan error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate content plan" },
      { status: 500 }
    );
  }
}
