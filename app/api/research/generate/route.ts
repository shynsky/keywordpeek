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
    const {
      description,
      keywords: manualKeywords,
      locationCode = 2840,
      languageCode = "en",
      sessionId,
    } = body;

    // Determine mode based on input
    const isManualMode = Array.isArray(manualKeywords) && manualKeywords.length > 0;

    // Validate input based on mode
    if (isManualMode) {
      // Manual mode validation
      if (manualKeywords.length > 20) {
        return NextResponse.json(
          { error: "Maximum 20 keywords allowed" },
          { status: 400 }
        );
      }
      if (manualKeywords.some((kw: string) => typeof kw !== "string" || kw.length > 80)) {
        return NextResponse.json(
          { error: "Invalid keywords format" },
          { status: 400 }
        );
      }
    } else {
      // AI mode validation
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
    }

    // Estimate credits needed based on mode:
    // AI mode: LLM (1) + search (~2) + summary (1) = ~4 credits
    // Manual mode: search (~2) + summary (1) = ~3 credits
    const keywordCount = isManualMode ? manualKeywords.length : 15;
    const estimatedCredits = isManualMode
      ? calculateSearchCredits(keywordCount) + CREDIT_COSTS.LLM_VALIDATION_SUMMARY
      : CREDIT_COSTS.LLM_KEYWORD_GENERATION +
        calculateSearchCredits(keywordCount) +
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
      let keywordsToSearch: string[];
      let generatedData: { keywords: string[]; seedTopics: string[]; marketAngle: string } | null =
        null;

      if (isManualMode) {
        // Manual mode: Use provided keywords directly
        keywordsToSearch = manualKeywords.map((kw: string) => kw.trim().toLowerCase());
      } else {
        // AI mode: Generate keywords with LLM
        const generated = await generateKeywords(description, locationCode, languageCode);
        actualCreditsUsed += CREDIT_COSTS.LLM_KEYWORD_GENERATION;

        if (!generated.keywords || generated.keywords.length === 0) {
          throw new Error("No keywords generated. Please try a more specific description.");
        }

        keywordsToSearch = generated.keywords;
        generatedData = generated;
      }

      // Step 2: Search keywords with DataForSEO (same for both modes)
      const keywordResults = await searchKeywords(keywordsToSearch, {
        locationCode,
        languageCode,
      });
      actualCreditsUsed += calculateSearchCredits(keywordsToSearch.length);

      // Step 3: Generate validation summary with LLM
      const keywordsWithMetrics = keywordResults.map((k) => ({
        keyword: k.keyword,
        searchVolume: k.searchVolume,
        difficulty: k.difficulty,
        cpc: k.cpc,
      }));

      // For manual mode, create a simple description for the summary
      const summaryDescription = isManualMode
        ? `Keywords: ${keywordsToSearch.slice(0, 5).join(", ")}${keywordsToSearch.length > 5 ? "..." : ""}`
        : description;

      const validationSummary = await generateValidationSummary(
        keywordsWithMetrics,
        summaryDescription
      );
      actualCreditsUsed += CREDIT_COSTS.LLM_VALIDATION_SUMMARY;

      // Handle session creation/update
      let currentSessionId = sessionId;

      if (!currentSessionId) {
        // Generate title
        const title = isManualMode
          ? `${keywordsToSearch[0]}${keywordsToSearch.length > 1 ? ` (+${keywordsToSearch.length - 1})` : ""}`
          : await generateTitle(description);

        const session = await createSession(user.id, {
          title,
          description: isManualMode ? undefined : description,
          locationCode,
          languageCode,
          inputMode: isManualMode ? "manual" : "ai",
          manualKeywords: isManualMode ? keywordsToSearch : undefined,
        });
        currentSessionId = session.id;
      }

      // Update session with results
      await updateSession(currentSessionId, {
        generatedKeywords: keywordsToSearch,
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
        keywords_count: keywordsToSearch.length,
        response_status: 200,
      });

      return NextResponse.json({
        data: {
          sessionId: currentSessionId,
          mode: isManualMode ? "manual" : "ai",
          generatedKeywords: keywordsToSearch,
          seedTopics: generatedData?.seedTopics || [],
          marketAngle: generatedData?.marketAngle || null,
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
