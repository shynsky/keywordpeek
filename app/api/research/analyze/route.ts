import { NextResponse } from "next/server";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { generateTitle } from "@/lib/openai/keywords";
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
import {
  DEFAULT_LOCATION_CODE,
  DEFAULT_LANGUAGE_CODE,
} from "@/lib/constants/locations";

/**
 * POST /api/research/analyze
 * Analyze keywords with DataForSEO (COSTS CREDITS)
 *
 * This is step 2 of the two-step flow:
 * 1. Generate keywords (/api/research/generate-keywords) - FREE
 * 2. Analyze with DataForSEO (this endpoint) - COSTS CREDITS
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

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const {
      keywords,
      locationCode = DEFAULT_LOCATION_CODE,
      languageCode = DEFAULT_LANGUAGE_CODE,
      sessionId,
      title: providedTitle,
      description,
      inputMode = "ai",
    } = body;

    // Validate keywords
    if (!Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json(
        { error: "Keywords array is required" },
        { status: 400 }
      );
    }

    if (keywords.length > 20) {
      return NextResponse.json(
        { error: "Maximum 20 keywords allowed" },
        { status: 400 }
      );
    }

    if (keywords.some((kw: unknown) => typeof kw !== "string" || (kw as string).length > 80)) {
      return NextResponse.json(
        { error: "Invalid keywords format" },
        { status: 400 }
      );
    }

    // Validate locationCode and languageCode
    if (locationCode !== undefined && (typeof locationCode !== "number" || locationCode <= 0 || !Number.isInteger(locationCode))) {
      return NextResponse.json(
        { error: "locationCode must be a positive integer" },
        { status: 400 }
      );
    }
    if (languageCode !== undefined && (typeof languageCode !== "string" || languageCode.length !== 2)) {
      return NextResponse.json(
        { error: "languageCode must be a 2-character string" },
        { status: 400 }
      );
    }

    // Normalize keywords
    const normalizedKeywords = keywords.map((kw: string) => kw.trim().toLowerCase());

    // Calculate credits needed
    // DataForSEO search + LLM validation summary
    const estimatedCredits =
      calculateSearchCredits(normalizedKeywords.length) +
      CREDIT_COSTS.LLM_VALIDATION_SUMMARY;

    // Reserve credits
    let transactionId: string;
    const creditDescription = `Research: Analyze ${normalizedKeywords.length} keywords`;
    try {
      transactionId = await reserveCredits(
        user.id,
        estimatedCredits,
        creditDescription
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
      // Step 1: Search keywords with DataForSEO
      const keywordResults = await searchKeywords(normalizedKeywords, {
        locationCode,
        languageCode,
      });
      actualCreditsUsed += calculateSearchCredits(normalizedKeywords.length);

      // Step 2: Generate validation summary with LLM
      const keywordsWithMetrics = keywordResults.map((k) => ({
        keyword: k.keyword,
        searchVolume: k.searchVolume,
        difficulty: k.difficulty,
        cpc: k.cpc,
      }));

      // For the summary, use description if available, otherwise generate from keywords
      const summaryDescription = description ||
        `Keywords: ${normalizedKeywords.slice(0, 5).join(", ")}${normalizedKeywords.length > 5 ? "..." : ""}`;

      const validationSummary = await generateValidationSummary(
        keywordsWithMetrics,
        summaryDescription
      );
      actualCreditsUsed += CREDIT_COSTS.LLM_VALIDATION_SUMMARY;

      // Handle session creation/update
      let currentSessionId = sessionId;

      if (!currentSessionId) {
        // Generate title if not provided
        const title = providedTitle ||
          (description
            ? await generateTitle(description)
            : `${normalizedKeywords[0]}${normalizedKeywords.length > 1 ? ` (+${normalizedKeywords.length - 1})` : ""}`);

        const session = await createSession(user.id, {
          title,
          description: description || undefined,
          locationCode,
          languageCode,
          inputMode: inputMode as "ai" | "manual",
          manualKeywords: inputMode === "manual" ? normalizedKeywords : undefined,
        });
        currentSessionId = session.id;
      }

      // Update session with results
      await updateSession(currentSessionId, {
        generatedKeywords: normalizedKeywords,
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
        endpoint: "/api/research/analyze",
        credits_used: actualCreditsUsed,
        keywords_count: normalizedKeywords.length,
        response_status: 200,
      });

      return NextResponse.json({
        data: {
          sessionId: currentSessionId,
          mode: inputMode,
          generatedKeywords: normalizedKeywords,
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
    console.error("Research analyze error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to analyze keywords" },
      { status: 500 }
    );
  }
}
