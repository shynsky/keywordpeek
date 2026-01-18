import { NextResponse } from "next/server";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

/**
 * GET /api/projects - List all projects for current user
 */
export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Rate limit: 100 requests per minute for reads
    const rateLimit = checkRateLimit(user.id, 100, 60000);
    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit);
    }

    const supabase = await createClient();

    const { data: projects, error } = await supabase
      .from("projects")
      .select("*, keywords(count)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch projects:", error);
      return NextResponse.json(
        { error: "Failed to fetch projects" },
        { status: 500 }
      );
    }

    // Transform to include keyword count
    const projectsWithCount = projects.map((p) => ({
      ...p,
      keywordCount: p.keywords?.[0]?.count ?? 0,
      keywords: undefined, // Remove the nested keywords object
    }));

    return NextResponse.json({ data: projectsWithCount });
  } catch (error) {
    console.error("Projects list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects - Create a new project
 */
export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Rate limit: 20 project creates per minute
    const rateLimit = checkRateLimit(`${user.id}:create`, 20, 60000);
    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit);
    }

    const supabase = await createClient();

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { name, domain } = body;

    // Validate input
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: "Project name must be 100 characters or less" },
        { status: 400 }
      );
    }

    // Create project
    const { data: project, error } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        name: name.trim(),
        domain: domain?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create project:", error);
      return NextResponse.json(
        { error: "Failed to create project" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: project }, { status: 201 });
  } catch (error) {
    console.error("Project create error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
