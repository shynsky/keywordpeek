import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRelatedKeywords } from "@/lib/dataforseo/keywords";
import { hasCredits, deductCredits, CREDIT_COSTS } from "@/lib/credits";

export async function POST(request: Request) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

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

    // Check if user has enough credits
    const hasEnough = await hasCredits(user.id, creditsNeeded);
    if (!hasEnough) {
      return NextResponse.json(
        {
          error: "Insufficient credits",
          creditsNeeded,
          code: "INSUFFICIENT_CREDITS",
        },
        { status: 402 }
      );
    }

    // Fetch related keywords using Labs API
    const related = await getRelatedKeywords(keyword, {
      locationCode,
      languageCode,
      limit,
    });

    // Deduct credits
    await deductCredits(
      user.id,
      creditsNeeded,
      `Keyword suggestions: "${keyword}"`
    );

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
