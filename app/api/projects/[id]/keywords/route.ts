import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { KeywordStatus } from "@/lib/supabase/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/projects/[id]/keywords - List keywords in a project
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    // Verify project belongs to user
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Parse query params for filtering/sorting
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const sortBy = url.searchParams.get("sortBy") || "created_at";
    const sortOrder = url.searchParams.get("sortOrder") || "desc";
    const limit = parseInt(url.searchParams.get("limit") || "100");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    // Build query
    let query = supabase
      .from("keywords")
      .select("*", { count: "exact" })
      .eq("project_id", id);

    if (status) {
      query = query.eq("status", status);
    }

    // Validate sort field
    const validSortFields = [
      "created_at",
      "keyword",
      "search_volume",
      "difficulty",
      "keyword_score",
      "cpc",
    ];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "created_at";

    query = query
      .order(sortField, { ascending: sortOrder === "asc" })
      .range(offset, offset + limit - 1);

    const { data: keywords, error, count } = await query;

    if (error) {
      console.error("Failed to fetch keywords:", error);
      return NextResponse.json(
        { error: "Failed to fetch keywords" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: keywords,
      pagination: {
        total: count ?? 0,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error("Keywords list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch keywords" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects/[id]/keywords - Add keyword to project
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    // Verify project belongs to user
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      keyword,
      searchVolume,
      difficulty,
      cpc,
      keywordScore,
      data,
      status = "saved",
      notes,
    } = body;

    // Validate input
    if (!keyword || typeof keyword !== "string") {
      return NextResponse.json(
        { error: "Keyword is required" },
        { status: 400 }
      );
    }

    // Create keyword
    const { data: newKeyword, error } = await supabase
      .from("keywords")
      .insert({
        project_id: id,
        keyword: keyword.trim(),
        search_volume: searchVolume ?? null,
        difficulty: difficulty ?? null,
        cpc: cpc ?? null,
        keyword_score: keywordScore ?? null,
        data: data ?? null,
        status,
        notes: notes ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to save keyword:", error);
      return NextResponse.json(
        { error: "Failed to save keyword" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: newKeyword }, { status: 201 });
  } catch (error) {
    console.error("Keyword create error:", error);
    return NextResponse.json(
      { error: "Failed to save keyword" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/projects/[id]/keywords - Bulk update keywords
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    // Verify project belongs to user
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { keywordIds, status, notes } = body;

    if (!keywordIds || !Array.isArray(keywordIds) || keywordIds.length === 0) {
      return NextResponse.json(
        { error: "keywordIds array is required" },
        { status: 400 }
      );
    }

    // Build update object
    const updates: Record<string, string | null> = {};
    if (status !== undefined) {
      const validStatuses: KeywordStatus[] = ["saved", "targeting", "published"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: "Invalid status" },
          { status: 400 }
        );
      }
      updates.status = status;
    }
    if (notes !== undefined) {
      updates.notes = notes;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const { data: updatedKeywords, error } = await supabase
      .from("keywords")
      .update(updates)
      .eq("project_id", id)
      .in("id", keywordIds)
      .select();

    if (error) {
      console.error("Failed to update keywords:", error);
      return NextResponse.json(
        { error: "Failed to update keywords" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: updatedKeywords,
      updated: updatedKeywords?.length ?? 0,
    });
  } catch (error) {
    console.error("Keywords update error:", error);
    return NextResponse.json(
      { error: "Failed to update keywords" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[id]/keywords - Delete keywords from project
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    // Verify project belongs to user
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { keywordIds } = body;

    if (!keywordIds || !Array.isArray(keywordIds) || keywordIds.length === 0) {
      return NextResponse.json(
        { error: "keywordIds array is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("keywords")
      .delete()
      .eq("project_id", id)
      .in("id", keywordIds);

    if (error) {
      console.error("Failed to delete keywords:", error);
      return NextResponse.json(
        { error: "Failed to delete keywords" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, deleted: keywordIds.length });
  } catch (error) {
    console.error("Keywords delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete keywords" },
      { status: 500 }
    );
  }
}
