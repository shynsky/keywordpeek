import { NextResponse } from "next/server";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { getRelatedKeywords } from "@/lib/dataforseo/keywords";
import { reserveCredits, rollbackCredits, getBalance, CREDIT_COSTS } from "@/lib/credits";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

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
    const {
      keyword,
      locationCode,
      languageCode,
      limit = 20,
    } = body;

    // Validate input
    if (!keyword || typeof keyword !== "string") {
      return NextResponse.json(
        { error: "Keyword is required" },
        { status: 400 }
      );
    }

    // 1 credit for suggestions (uses Labs Related Keywords - cheap)
    const creditsNeeded = CREDIT_COSTS.SUGGESTIONS;

    // Reserve credits BEFORE API call (atomic with rollback capability)
    let transactionId: string;
    try {
      transactionId = await reserveCredits(
        user.id,
        creditsNeeded,
        `Keyword suggestions: "${keyword}"`
      );
    } catch (err) {
      return NextResponse.json(
        {
          error: "Insufficient credits",
          creditsNeeded,
          code: "INSUFFICIENT_CREDITS",
        },
        { status: 402 }
      );
    }

    // Fetch related keywords using Labs API - rollback on failure
    let related;
    try {
      related = await getRelatedKeywords(keyword, {
        locationCode,
        languageCode,
        limit,
      });
    } catch (apiError) {
      await rollbackCredits(transactionId);
      throw apiError;
    }

    // Get current balance after successful deduction
    const newBalance = await getBalance(user.id);

    // Log API usage
    await supabase.from("api_usage").insert({
      user_id: user.id,
      endpoint: "/api/keywords/suggestions",
      credits_used: creditsNeeded,
      keywords_count: 1,
      response_status: 200,
    });

    return NextResponse.json({
      data: { related },
      creditsUsed: creditsNeeded,
      creditsRemaining: newBalance,
    });
  } catch (error) {
    console.error("Suggestions error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Suggestions failed",
      },
      { status: 500 }
    );
  }
}
