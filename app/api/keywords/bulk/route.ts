import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { searchKeywords } from "@/lib/dataforseo/keywords";
import { hasCredits, deductCredits, CREDIT_COSTS } from "@/lib/credits";
import type { KeywordBulkResult } from "@/lib/dataforseo/types";

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
    const { keywords, locationCode, languageCode } = body;

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

    // Calculate credits needed (bulk rate: 0.2 credits per keyword)
    const creditsNeeded = Math.ceil(keywords.length * CREDIT_COSTS.BULK_CHECK);

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

    // Perform search
    const results = await searchKeywords(keywords, {
      locationCode,
      languageCode,
    });

    // Transform to bulk result format (lighter weight)
    const bulkResults: KeywordBulkResult[] = results.map((r) => ({
      keyword: r.keyword,
      searchVolume: r.searchVolume,
      difficulty: r.difficulty,
      keywordScore: r.keywordScore,
    }));

    // Deduct credits
    await deductCredits(
      user.id,
      creditsNeeded,
      `Bulk keyword check: ${keywords.length} keywords`
    );

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
