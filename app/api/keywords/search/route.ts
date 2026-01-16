import { NextResponse } from "next/server";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { searchKeywords, searchKeywordExtended } from "@/lib/dataforseo/keywords";
import { reserveCredits, rollbackCredits, getBalance, calculateSearchCredits } from "@/lib/credits";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import type { Json } from "@/lib/supabase/types";

export async function POST(request: Request) {
  try {
    // Get authenticated user
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check rate limit (100 requests per minute per user)
    const rateLimit = checkRateLimit(user.id, 100, 60000);
    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit);
    }

    const supabase = await createClient();

    // Parse request body
    const body = await request.json();
    const { keywords, extended = false, locationCode, languageCode } = body;

    // Validate input
    if (!keywords) {
      return NextResponse.json(
        { error: "Keywords are required" },
        { status: 400 }
      );
    }

    // Normalize to array
    const keywordList = Array.isArray(keywords) ? keywords : [keywords];

    if (keywordList.length === 0) {
      return NextResponse.json(
        { error: "At least one keyword is required" },
        { status: 400 }
      );
    }

    if (keywordList.length > 100) {
      return NextResponse.json(
        { error: "Maximum 100 keywords per request" },
        { status: 400 }
      );
    }

    // Calculate credits needed
    // 1-10 keywords: 1 credit, 11+ keywords: 1 + 0.1 per extra
    const creditsNeeded = calculateSearchCredits(keywordList.length);

    // Reserve credits BEFORE API call (atomic with rollback capability)
    let transactionId: string;
    try {
      transactionId = await reserveCredits(
        user.id,
        creditsNeeded,
        `Keyword search: ${keywordList.length} keyword(s)`
      );
    } catch (err) {
      // Insufficient credits or user not found
      return NextResponse.json(
        {
          error: "Insufficient credits",
          creditsNeeded,
          code: "INSUFFICIENT_CREDITS",
        },
        { status: 402 }
      );
    }

    // Perform search - rollback credits if this fails
    let results;
    try {
      if (extended && keywordList.length === 1) {
        // Extended search for single keyword
        const result = await searchKeywordExtended(keywordList[0], {
          locationCode,
          languageCode,
          includeRelated: true,
          includeAutocomplete: true,
          includeQuestions: true,
        });
        results = result ? [result] : [];
      } else {
        // Basic search for multiple keywords
        results = await searchKeywords(keywordList, {
          locationCode,
          languageCode,
        });
      }
    } catch (apiError) {
      // Rollback credits on API failure
      await rollbackCredits(transactionId);
      throw apiError;
    }

    // Get current balance after successful deduction
    const newBalance = await getBalance(user.id);

    // Log API usage
    await supabase.from("api_usage").insert({
      user_id: user.id,
      endpoint: "/api/keywords/search",
      credits_used: creditsNeeded,
      keywords_count: keywordList.length,
      response_status: 200,
    });

    // Save to search history for user to view later
    await supabase.from("search_history").insert({
      user_id: user.id,
      query_keywords: keywordList,
      results_count: results.length,
      credits_used: creditsNeeded,
      results: results as unknown as Json,
      location_code: locationCode || 2840,
      language_code: languageCode || "en",
    });

    return NextResponse.json({
      data: results,
      creditsUsed: creditsNeeded,
      creditsRemaining: newBalance,
    });
  } catch (error) {
    console.error("Keyword search error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Search failed",
      },
      { status: 500 }
    );
  }
}
