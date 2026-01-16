import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/supabase/server";
import {
  getSession,
  updateSession,
  deleteSession,
  type UpdateSessionInput,
} from "@/lib/research/sessions";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/research/sessions/[id]
 * Get a specific research session
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check rate limit
    const rateLimit = checkRateLimit(user.id, 100, 60000);
    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit);
    }

    const session = await getSession(id);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Verify ownership
    if (session.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ data: session });
  } catch (error) {
    console.error("Error getting session:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get session" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/research/sessions/[id]
 * Update a research session
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check rate limit
    const rateLimit = checkRateLimit(user.id, 100, 60000);
    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit);
    }

    // Get existing session to verify ownership
    const existing = await getSession(id);
    if (!existing) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    if (existing.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json()) as UpdateSessionInput;

    const session = await updateSession(id, body);

    return NextResponse.json({ data: session });
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update session" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/research/sessions/[id]
 * Delete a research session
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check rate limit
    const rateLimit = checkRateLimit(user.id, 100, 60000);
    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit);
    }

    // Get existing session to verify ownership
    const existing = await getSession(id);
    if (!existing) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    if (existing.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await deleteSession(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting session:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete session" },
      { status: 500 }
    );
  }
}
