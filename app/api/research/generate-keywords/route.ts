import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/supabase/server";
import { generateKeywords, generateTitle, detectContextualSuggestions } from "@/lib/openai/keywords";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { estimateAnalysisCost } from "@/lib/credits";
import {
  DEFAULT_LOCATION_CODE,
  DEFAULT_LANGUAGE_CODE,
} from "@/lib/constants/locations";

/**
 * POST /api/research/generate-keywords
 * Generate keywords from natural language using OpenAI (FREE step)
 *
 * This is step 1 of the two-step flow:
 * 1. Generate keywords (this endpoint) - FREE
 * 2. Analyze with DataForSEO (/api/research/analyze) - COSTS CREDITS
 */
export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check rate limit (more lenient since this is the free step)
    const rateLimit = checkRateLimit(user.id, 100, 60000);
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
      description,
      locationCode = DEFAULT_LOCATION_CODE,
      languageCode = DEFAULT_LANGUAGE_CODE,
    } = body;

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

    // Step 1: Generate keywords with OpenAI (FREE)
    const generated = await generateKeywords(description, locationCode, languageCode);

    if (!generated.keywords || generated.keywords.length === 0) {
      return NextResponse.json(
        { error: "No keywords generated. Please try a more specific description." },
        { status: 400 }
      );
    }

    // Step 2: Generate title for the session
    const title = await generateTitle(description);

    // Step 3: Detect contextual suggestions based on description
    const suggestions = detectContextualSuggestions(description);

    // Step 4: Estimate credits for the analysis step
    const estimatedCredits = estimateAnalysisCost(generated.keywords.length);

    return NextResponse.json({
      keywords: generated.keywords,
      seedTopics: generated.seedTopics,
      marketAngle: generated.marketAngle,
      title,
      suggestions,
      estimatedCredits,
    });
  } catch (error) {
    console.error("Generate keywords error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate keywords" },
      { status: 500 }
    );
  }
}
