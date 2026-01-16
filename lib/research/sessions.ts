/**
 * Research Sessions Management
 *
 * CRUD operations for research sessions with auto-save support.
 */

import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";
import type { KeywordResult } from "@/lib/dataforseo/types";
import type { ValidationSummary, ContentCluster, ContentGap } from "@/lib/openai";
import type { CompetitorDomain, CompetitorKeyword } from "@/lib/dataforseo/competitors";

// =============================================================================
// Types
// =============================================================================

/**
 * Research session status
 */
export type SessionStatus = "in_progress" | "completed";

/**
 * Input mode for research session
 */
export type InputMode = "ai" | "manual";

/**
 * Research session data
 */
export interface ResearchSession {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  locationCode: number;
  languageCode: string;
  status: SessionStatus;
  inputMode: InputMode;
  manualKeywords: string[] | null;

  // Tab 1: Validation data
  generatedKeywords: string[] | null;
  keywords: KeywordResult[] | null;
  validationSummary: ValidationSummary | null;

  // Tab 2: Competitor data
  competitors: CompetitorDomain[] | null;
  competitorKeywords: CompetitorKeyword[] | null;

  // Tab 3: Content plan data
  contentClusters: ContentCluster[] | null;
  contentGaps: ContentGap[] | null;

  // Metadata
  creditsUsed: number;
  currentTab: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create session input
 */
export interface CreateSessionInput {
  title: string;
  description?: string;
  locationCode?: number;
  languageCode?: string;
  inputMode?: InputMode;
  manualKeywords?: string[];
}

/**
 * Update session input (partial)
 */
export interface UpdateSessionInput {
  title?: string;
  description?: string;
  status?: SessionStatus;
  generatedKeywords?: string[];
  keywords?: KeywordResult[];
  validationSummary?: ValidationSummary;
  competitors?: CompetitorDomain[];
  competitorKeywords?: CompetitorKeyword[];
  contentClusters?: ContentCluster[];
  contentGaps?: ContentGap[];
  creditsUsed?: number;
  currentTab?: number;
}

// =============================================================================
// Database Row Type (matches Supabase schema)
// =============================================================================

interface ResearchSessionRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  location_code: number;
  language_code: string;
  status: string;
  input_mode: string;
  manual_keywords: string[] | null;
  generated_keywords: string[] | null;
  keywords: Json;
  validation_summary: Json;
  competitors: Json;
  competitor_keywords: Json;
  content_clusters: Json;
  content_gaps: Json;
  credits_used: number;
  current_tab: number;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Transform database row to ResearchSession
 */
function rowToSession(row: ResearchSessionRow): ResearchSession {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    locationCode: row.location_code,
    languageCode: row.language_code,
    status: row.status as SessionStatus,
    inputMode: (row.input_mode as InputMode) || "ai",
    manualKeywords: row.manual_keywords,
    generatedKeywords: row.generated_keywords,
    keywords: row.keywords as KeywordResult[] | null,
    validationSummary: row.validation_summary as ValidationSummary | null,
    competitors: row.competitors as CompetitorDomain[] | null,
    competitorKeywords: row.competitor_keywords as CompetitorKeyword[] | null,
    contentClusters: row.content_clusters as ContentCluster[] | null,
    contentGaps: row.content_gaps as ContentGap[] | null,
    creditsUsed: row.credits_used,
    currentTab: row.current_tab,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// =============================================================================
// CRUD Operations
// =============================================================================

/**
 * Create a new research session
 */
export async function createSession(
  userId: string,
  input: CreateSessionInput
): Promise<ResearchSession> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("research_sessions")
    .insert({
      user_id: userId,
      title: input.title,
      description: input.description ?? null,
      location_code: input.locationCode ?? 2840,
      language_code: input.languageCode ?? "en",
      input_mode: input.inputMode ?? "ai",
      manual_keywords: input.manualKeywords ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating session:", error);
    throw new Error(`Failed to create session: ${error.message}`);
  }

  return rowToSession(data as unknown as ResearchSessionRow);
}

/**
 * Get a session by ID
 */
export async function getSession(
  sessionId: string
): Promise<ResearchSession | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("research_sessions")
    .select()
    .eq("id", sessionId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    console.error("Error getting session:", error);
    throw new Error(`Failed to get session: ${error.message}`);
  }

  return rowToSession(data as unknown as ResearchSessionRow);
}

/**
 * List sessions for a user
 */
export async function listSessions(
  userId: string,
  options: {
    limit?: number;
    offset?: number;
    status?: SessionStatus;
  } = {}
): Promise<ResearchSession[]> {
  const { limit = 20, offset = 0, status } = options;

  const supabase = await createClient();

  let query = supabase
    .from("research_sessions")
    .select()
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error listing sessions:", error);
    throw new Error(`Failed to list sessions: ${error.message}`);
  }

  return (data as unknown as ResearchSessionRow[]).map(rowToSession);
}

/**
 * Update a session
 */
export async function updateSession(
  sessionId: string,
  input: UpdateSessionInput
): Promise<ResearchSession> {
  const supabase = await createClient();

  // Build update object, only including provided fields
  const updateData: Record<string, unknown> = {};

  if (input.title !== undefined) updateData.title = input.title;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.status !== undefined) updateData.status = input.status;
  if (input.generatedKeywords !== undefined) updateData.generated_keywords = input.generatedKeywords;
  if (input.keywords !== undefined) updateData.keywords = input.keywords as unknown as Json;
  if (input.validationSummary !== undefined) updateData.validation_summary = input.validationSummary as unknown as Json;
  if (input.competitors !== undefined) updateData.competitors = input.competitors as unknown as Json;
  if (input.competitorKeywords !== undefined) updateData.competitor_keywords = input.competitorKeywords as unknown as Json;
  if (input.contentClusters !== undefined) updateData.content_clusters = input.contentClusters as unknown as Json;
  if (input.contentGaps !== undefined) updateData.content_gaps = input.contentGaps as unknown as Json;
  if (input.creditsUsed !== undefined) updateData.credits_used = input.creditsUsed;
  if (input.currentTab !== undefined) updateData.current_tab = input.currentTab;

  const { data, error } = await supabase
    .from("research_sessions")
    .update(updateData)
    .eq("id", sessionId)
    .select()
    .single();

  if (error) {
    console.error("Error updating session:", error);
    throw new Error(`Failed to update session: ${error.message}`);
  }

  return rowToSession(data as unknown as ResearchSessionRow);
}

/**
 * Delete a session
 */
export async function deleteSession(sessionId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("research_sessions")
    .delete()
    .eq("id", sessionId);

  if (error) {
    console.error("Error deleting session:", error);
    throw new Error(`Failed to delete session: ${error.message}`);
  }
}

/**
 * Add credits used to a session (atomic increment via RPC)
 */
export async function addCreditsUsed(
  sessionId: string,
  credits: number
): Promise<number> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("add_session_credits_used", {
    p_session_id: sessionId,
    p_credits: credits,
  });

  if (error) {
    console.error("Error adding session credits:", error);
    throw new Error(`Failed to add credits: ${error.message}`);
  }

  return data ?? 0;
}

/**
 * Get recent sessions count for a user
 */
export async function getSessionsCount(
  userId: string,
  options: { status?: SessionStatus } = {}
): Promise<number> {
  const { status } = options;

  const supabase = await createClient();

  let query = supabase
    .from("research_sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (status) {
    query = query.eq("status", status);
  }

  const { count, error } = await query;

  if (error) {
    console.error("Error counting sessions:", error);
    return 0;
  }

  return count ?? 0;
}
