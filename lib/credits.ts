import { createClient } from "@/lib/supabase/server";

/**
 * Check if user has sufficient credits
 */
export async function hasCredits(
  userId: string,
  amount: number
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("has_credits", {
    p_user_id: userId,
    p_amount: amount,
  });

  if (error) {
    console.error("Error checking credits:", error);
    return false;
  }

  return data ?? false;
}

/**
 * Get current credit balance for user
 */
export async function getBalance(userId: string): Promise<number> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_credit_balance", {
    p_user_id: userId,
  });

  if (error) {
    console.error("Error getting balance:", error);
    return 0;
  }

  return data ?? 0;
}

/**
 * Deduct credits from user account
 * Throws if insufficient credits
 */
export async function deductCredits(
  userId: string,
  amount: number,
  description?: string
): Promise<number> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("deduct_credits", {
    p_user_id: userId,
    p_amount: amount,
    p_description: description ?? null,
  });

  if (error) {
    console.error("Error deducting credits:", error);
    throw new Error(error.message);
  }

  return data ?? 0;
}

/**
 * Add credits to user account
 */
export async function addCredits(
  userId: string,
  amount: number,
  type: "purchase" | "bonus" | "refund" = "purchase",
  description?: string,
  stripeSessionId?: string
): Promise<number> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("add_credits", {
    p_user_id: userId,
    p_amount: amount,
    p_type: type,
    p_description: description ?? null,
    p_stripe_session_id: stripeSessionId ?? null,
  });

  if (error) {
    console.error("Error adding credits:", error);
    throw new Error(error.message);
  }

  return data ?? 0;
}

/**
 * Reserve credits atomically before an API call
 * Returns transaction ID for potential rollback on failure
 */
export async function reserveCredits(
  userId: string,
  amount: number,
  description?: string
): Promise<string> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("reserve_credits", {
    p_user_id: userId,
    p_amount: amount,
    p_description: description ?? null,
  });

  if (error) {
    console.error("Error reserving credits:", error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Rollback reserved credits on API failure
 * Returns new balance after refund
 */
export async function rollbackCredits(transactionId: string): Promise<number> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("rollback_credits", {
    p_transaction_id: transactionId,
  });

  if (error) {
    console.error("Error rolling back credits:", error);
    throw new Error(error.message);
  }

  return data ?? 0;
}

/**
 * Credit costs for different operations
 * Simplified: 1 credit = 1 search (up to 10 keywords)
 * Designed for 300-400% margins with DataForSEO Labs API
 *
 * NOTE: All costs must be integers because Supabase RPC expects int parameters
 */
export const CREDIT_COSTS = {
  // Base cost for keyword search (covers up to 10 keywords)
  KEYWORD_SEARCH_BASE: 1,
  // Cost per additional keyword above 10 (1 credit per 10 extra keywords)
  KEYWORD_SEARCH_EXTRA_PER_10: 1,
  // Bulk check (covers up to 25 keywords)
  BULK_CHECK: 1,
  // Related keywords / suggestions
  SUGGESTIONS: 1,
  // People Also Ask questions
  QUESTIONS: 1,

  // === Research Hub Features ===
  // LLM keyword generation from natural language
  LLM_KEYWORD_GENERATION: 1,
  // SERP check per keyword for competitor discovery (1 credit per 2 keywords)
  SERP_CHECK_PER_2: 1,
  // Keywords for Site (competitor keyword profile)
  KEYWORDS_FOR_SITE: 2,
  // LLM content clustering
  LLM_CONTENT_CLUSTERING: 1,
  // LLM validation summary
  LLM_VALIDATION_SUMMARY: 1,
} as const;

/**
 * Calculate credits needed for keyword search
 * 1-10 keywords: 1 credit
 * 11-20 keywords: 2 credits
 * 21-30 keywords: 3 credits, etc.
 */
export function calculateSearchCredits(keywordCount: number): number {
  if (keywordCount <= 10) {
    return CREDIT_COSTS.KEYWORD_SEARCH_BASE;
  }
  const extraKeywords = keywordCount - 10;
  const extraCredits = Math.ceil(extraKeywords / 10) * CREDIT_COSTS.KEYWORD_SEARCH_EXTRA_PER_10;
  return CREDIT_COSTS.KEYWORD_SEARCH_BASE + extraCredits;
}

/**
 * Calculate credits needed for bulk check
 * 1-25 keywords: 1 credit
 * 26+ keywords: 1 credit per 25 keywords (rounded up)
 */
export function calculateBulkCredits(keywordCount: number): number {
  return Math.ceil(keywordCount / 25) * CREDIT_COSTS.BULK_CHECK;
}

/**
 * Calculate credits needed for SERP competitor discovery
 * 1-2 keywords: 1 credit
 * 3-4 keywords: 2 credits, etc.
 * @param keywordCount - Number of keywords to check SERPs for
 */
export function calculateSerpCredits(keywordCount: number): number {
  return Math.ceil(keywordCount / 2) * CREDIT_COSTS.SERP_CHECK_PER_2;
}

/**
 * Calculate credits needed for competitor keyword analysis
 * @param competitorCount - Number of competitor domains to analyze
 */
export function calculateCompetitorCredits(competitorCount: number): number {
  return competitorCount * CREDIT_COSTS.KEYWORDS_FOR_SITE;
}

/**
 * Estimate total credits for a full research session
 * Validation + Competitors + Content Planning
 */
export function estimateResearchCredits(
  keywordCount: number,
  serpKeywordCount: number = 5,
  competitorCount: number = 3
): number {
  // Tab 1: Validation
  const validationCredits =
    CREDIT_COSTS.LLM_KEYWORD_GENERATION +
    calculateSearchCredits(keywordCount) +
    CREDIT_COSTS.LLM_VALIDATION_SUMMARY;

  // Tab 2: Competitors
  const competitorCredits =
    calculateSerpCredits(serpKeywordCount) +
    calculateCompetitorCredits(competitorCount);

  // Tab 3: Content Planning
  const contentCredits = CREDIT_COSTS.LLM_CONTENT_CLUSTERING;

  return validationCredits + competitorCredits + contentCredits;
}
