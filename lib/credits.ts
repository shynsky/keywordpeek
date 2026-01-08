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
 * Credit costs for different operations
 */
export const CREDIT_COSTS = {
  KEYWORD_SEARCH: 1, // Full keyword lookup
  BULK_CHECK: 0.2, // Volume-only check per keyword
  SUGGESTIONS: 0.5, // Autocomplete/related
  QUESTIONS: 0.5, // People Also Ask
} as const;

/**
 * Credit packages available for purchase
 */
export const CREDIT_PACKAGES = {
  starter: {
    id: "starter",
    name: "Starter",
    credits: 1000,
    price: 9,
    priceId: process.env.STRIPE_PRICE_STARTER,
  },
  growth: {
    id: "growth",
    name: "Growth",
    credits: 3000,
    price: 19,
    priceId: process.env.STRIPE_PRICE_GROWTH,
  },
  pro: {
    id: "pro",
    name: "Pro",
    credits: 10000,
    price: 49,
    priceId: process.env.STRIPE_PRICE_PRO,
  },
} as const;

export type CreditPackageId = keyof typeof CREDIT_PACKAGES;

/**
 * Get credit package by Stripe price ID
 */
export function getPackageByPriceId(priceId: string) {
  return Object.values(CREDIT_PACKAGES).find((pkg) => pkg.priceId === priceId);
}
