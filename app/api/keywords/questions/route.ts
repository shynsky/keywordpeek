import { NextResponse } from "next/server";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { getPeopleAlsoAsk } from "@/lib/dataforseo/keywords";
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
    const { keyword, locationCode, languageCode } = body;

    // Validate input
    if (!keyword || typeof keyword !== "string") {
      return NextResponse.json(
        { error: "Keyword is required" },
        { status: 400 }
      );
    }

    // Calculate credits needed
    const creditsNeeded = CREDIT_COSTS.QUESTIONS;

    // Reserve credits BEFORE API call (atomic with rollback capability)
    let transactionId: string;
    try {
      transactionId = await reserveCredits(
        user.id,
        creditsNeeded,
        `People Also Ask: "${keyword}"`
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

    // Fetch People Also Ask questions - rollback on failure
    let questions;
    try {
      questions = await getPeopleAlsoAsk(keyword, {
        locationCode,
        languageCode,
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
      endpoint: "/api/keywords/questions",
      credits_used: creditsNeeded,
      keywords_count: 1,
      response_status: 200,
    });

    return NextResponse.json({
      data: { questions },
      creditsUsed: creditsNeeded,
      creditsRemaining: newBalance,
    });
  } catch (error) {
    console.error("Questions error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Questions failed",
      },
      { status: 500 }
    );
  }
}
