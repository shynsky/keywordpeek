import { NextResponse } from "next/server";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { generateKeywords, generateTitle } from "@/lib/openai/keywords";
import { searchKeywords } from "@/lib/dataforseo/keywords";
import { generateValidationSummary } from "@/lib/openai/clustering";
import {
  reserveCredits,
  rollbackCredits,
  getBalance,
  calculateSearchCredits,
  CREDIT_COSTS,
} from "@/lib/credits";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { createSession, updateSession } from "@/lib/research/sessions";

/**
 * POST /api/research/generate
 * Generate keywords from natural language and validate the niche
 *
 * This is the main endpoint for Tab 1 (Niche Validation)
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
    const { description, locationCode = 2840, languageCode = "en", sessionId } = body;

    // Validate input
    if (!description || typeof description !== "string") {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    if (description.length < 10) {
      return NextResponse.json(
        { error: "Description must be at least 10 characters" },
        { status: 400 }
      );
    }

    if (description.length > 500) {
      return NextResponse.json(
        { error: "Description must be less than 500 characters" },
        { status: 400 }
      );
    }

    // Estimate credits needed:
    // - LLM keyword generation: 1 credit
    // - Keyword search (assuming ~15 keywords): ~2 credits
    // - LLM validation summary: 1 credit
    // Total: ~4 credits minimum
    const estimatedCredits =
      CREDIT_COSTS.LLM_KEYWORD_GENERATION +
      calculateSearchCredits(15) +
      CREDIT_COSTS.LLM_VALIDATION_SUMMARY;

    // Reserve credits
    let transactionId: string;
    try {
      transactionId = await reserveCredits(
        user.id,
        estimatedCredits,
        `Research: Generate keywords for "${description.slice(0, 30)}..."`
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
      // Step 1: Generate keywords with LLM
      const generated = await generateKeywords(description, locationCode, languageCode);
      actualCreditsUsed += CREDIT_COSTS.LLM_KEYWORD_GENERATION;

      if (!generated.keywords || generated.keywords.length === 0) {
        throw new Error("No keywords generated. Please try a more specific description.");
      }

      // Step 2: Search keywords with DataForSEO
      const keywordResults = await searchKeywords(generated.keywords, {
        locationCode,
        languageCode,
      });
      actualCreditsUsed += calculateSearchCredits(generated.keywords.length);

      // Step 3: Generate validation summary with LLM
      const keywordsWithMetrics = keywordResults.map((k) => ({
        keyword: k.keyword,
        searchVolume: k.searchVolume,
        difficulty: k.difficulty,
        cpc: k.cpc,
      }));

      const validationSummary = await generateValidationSummary(
        keywordsWithMetrics,
        description
      );
      actualCreditsUsed += CREDIT_COSTS.LLM_VALIDATION_SUMMARY;

      // Handle session creation/update
      let currentSessionId = sessionId;

      if (!currentSessionId) {
        // Generate title and create new session
        const title = await generateTitle(description);

        const session = await createSession(user.id, {
          title,
          description,
          locationCode,
          languageCode,
        });
        currentSessionId = session.id;
      }

      // Update session with results
      await updateSession(currentSessionId, {
        generatedKeywords: generated.keywords,
        keywords: keywordResults,
        validationSummary,
        creditsUsed: actualCreditsUsed,
        currentTab: 1,
      });

      // Get updated balance
      const newBalance = await getBalance(user.id);

      // Log API usage
      const supabase = await createClient();
      await supabase.from("api_usage").insert({
        user_id: user.id,
        endpoint: "/api/research/generate",
        credits_used: actualCreditsUsed,
        keywords_count: generated.keywords.length,
        response_status: 200,
      });

      return NextResponse.json({
        data: {
          sessionId: currentSessionId,
          generatedKeywords: generated.keywords,
          seedTopics: generated.seedTopics,
          marketAngle: generated.marketAngle,
          keywords: keywordResults,
          validationSummary,
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
    console.error("Research generate error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate research" },
      { status: 500 }
    );
  }
}
