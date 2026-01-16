import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/supabase/server";
import {
  createSession,
  listSessions,
  type CreateSessionInput,
} from "@/lib/research/sessions";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

/**
 * GET /api/research/sessions
 * List research sessions for the authenticated user
 */
export async function GET(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check rate limit
    const rateLimit = checkRateLimit(user.id, 100, 60000);
    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit);
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const status = searchParams.get("status") as "in_progress" | "completed" | null;

    const sessions = await listSessions(user.id, {
      limit,
      offset,
      status: status ?? undefined,
    });

    return NextResponse.json({ data: sessions });
  } catch (error) {
    console.error("Error listing sessions:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list sessions" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/research/sessions
 * Create a new research session
 */
export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check rate limit
    const rateLimit = checkRateLimit(user.id, 100, 60000);
    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit);
    }

    const body = await request.json();
    const { title, description, locationCode, languageCode } = body as CreateSessionInput & {
      locationCode?: number;
      languageCode?: string;
    };

    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const session = await createSession(user.id, {
      title,
      description,
      locationCode,
      languageCode,
    });

    return NextResponse.json({ data: session }, { status: 201 });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create session" },
      { status: 500 }
    );
  }
}
