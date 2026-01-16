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
 */
export const CREDIT_COSTS = {
  // Base cost for keyword search (covers up to 10 keywords)
  KEYWORD_SEARCH_BASE: 1,
  // Cost per additional keyword above 10
  KEYWORD_SEARCH_EXTRA: 0.1,
  // Bulk check (covers up to 25 keywords)
  BULK_CHECK: 1,
  // Related keywords / suggestions
  SUGGESTIONS: 1,
  // People Also Ask questions
  QUESTIONS: 1,
} as const;

/**
 * Calculate credits needed for keyword search
 * 1-10 keywords: 1 credit
 * 11+ keywords: 1 + 0.1 per extra keyword
 */
export function calculateSearchCredits(keywordCount: number): number {
  if (keywordCount <= 10) {
    return CREDIT_COSTS.KEYWORD_SEARCH_BASE;
  }
  const extraKeywords = keywordCount - 10;
  return CREDIT_COSTS.KEYWORD_SEARCH_BASE + extraKeywords * CREDIT_COSTS.KEYWORD_SEARCH_EXTRA;
}

/**
 * Calculate credits needed for bulk check
 * 1-25 keywords: 1 credit
 * 26+ keywords: 1 credit per 25 keywords (rounded up)
 */
export function calculateBulkCredits(keywordCount: number): number {
  return Math.ceil(keywordCount / 25) * CREDIT_COSTS.BULK_CHECK;
}
