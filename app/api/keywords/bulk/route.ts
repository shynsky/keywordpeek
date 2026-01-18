import { NextResponse } from "next/server";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { searchKeywords } from "@/lib/dataforseo/keywords";
import { reserveCredits, rollbackCredits, getBalance, calculateBulkCredits } from "@/lib/credits";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import type { KeywordBulkResult } from "@/lib/dataforseo/types";

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
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { keywords, locationCode, languageCode } = body;

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

    // Validate input
    if (!keywords || !Array.isArray(keywords)) {
      return NextResponse.json(
        { error: "Keywords array is required" },
        { status: 400 }
      );
    }

    if (keywords.length === 0) {
      return NextResponse.json(
        { error: "At least one keyword is required" },
        { status: 400 }
      );
    }

    if (keywords.length > 500) {
      return NextResponse.json(
        { error: "Maximum 500 keywords per bulk request" },
        { status: 400 }
      );
    }

    // Calculate credits needed (1 credit per 25 keywords)
    const creditsNeeded = calculateBulkCredits(keywords.length);

    // Reserve credits BEFORE API call (atomic with rollback capability)
    let transactionId: string;
    try {
      transactionId = await reserveCredits(
        user.id,
        creditsNeeded,
        `Bulk keyword check: ${keywords.length} keywords`
      );
    } catch {
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
      results = await searchKeywords(keywords, {
        locationCode,
        languageCode,
      });
    } catch (apiError) {
      await rollbackCredits(transactionId);
      throw apiError;
    }

    // Transform to bulk result format (lighter weight)
    const bulkResults: KeywordBulkResult[] = results.map((r) => ({
      keyword: r.keyword,
      searchVolume: r.searchVolume,
      difficulty: r.difficulty,
      keywordScore: r.keywordScore,
    }));

    // Get current balance after successful deduction
    const newBalance = await getBalance(user.id);

    // Log API usage
    await supabase.from("api_usage").insert({
      user_id: user.id,
      endpoint: "/api/keywords/bulk",
      credits_used: creditsNeeded,
      keywords_count: keywords.length,
      response_status: 200,
    });

    return NextResponse.json({
      data: bulkResults,
      creditsUsed: creditsNeeded,
      creditsRemaining: newBalance,
      keywordsProcessed: results.length,
    });
  } catch (error) {
    console.error("Bulk check error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Bulk check failed",
      },
      { status: 500 }
    );
  }
}
