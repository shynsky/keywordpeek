import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { searchKeywords, searchKeywordExtended } from "@/lib/dataforseo/keywords";
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
    const creditsNeeded = keywordList.length * CREDIT_COSTS.KEYWORD_SEARCH;

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
    let results;
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

    // Deduct credits
    await deductCredits(
      user.id,
      creditsNeeded,
      `Keyword search: ${keywordList.length} keyword(s)`
    );

    // Log API usage
    await supabase.from("api_usage").insert({
      user_id: user.id,
      endpoint: "/api/keywords/search",
      credits_used: creditsNeeded,
      keywords_count: keywordList.length,
      response_status: 200,
    });

    return NextResponse.json({
      data: results,
      creditsUsed: creditsNeeded,
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
