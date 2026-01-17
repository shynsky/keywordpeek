import { NextResponse } from "next/server";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

/**
 * GET /api/keywords/history
 * Fetch paginated search history for the current user
 */
export async function GET(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: 100 requests per minute for reads
    const rateLimit = checkRateLimit(user.id, 100, 60000);
    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit);
    }

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Pagination params (validated to prevent negative values)
    const limit = Math.max(1, Math.min(parseInt(searchParams.get("limit") || "20") || 20, 100));
    const offset = Math.max(0, parseInt(searchParams.get("offset") || "0") || 0);

    // Fetch search history
    const { data: history, error, count } = await supabase
      .from("search_history")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching search history:", error);
      return NextResponse.json(
        { error: "Failed to fetch search history" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: history,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    });
  } catch (error) {
    console.error("Search history error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch history" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/keywords/history
 * Delete a single history entry or clear all history
 */
export async function DELETE(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: 30 deletes per minute
    const rateLimit = checkRateLimit(`${user.id}:delete`, 30, 60000);
    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit);
    }

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const historyId = searchParams.get("id");

    if (historyId) {
      // Delete single entry
      const { error } = await supabase
        .from("search_history")
        .delete()
        .eq("id", historyId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error deleting history entry:", error);
        return NextResponse.json(
          { error: "Failed to delete history entry" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, deleted: historyId });
    } else {
      // Clear all history for user
      const { error, count } = await supabase
        .from("search_history")
        .delete({ count: "exact" })
        .eq("user_id", user.id);

      if (error) {
        console.error("Error clearing history:", error);
        return NextResponse.json(
          { error: "Failed to clear history" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, deletedCount: count });
    }
  } catch (error) {
    console.error("Delete history error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete history" },
      { status: 500 }
    );
  }
}
