import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-12-15.clover",
  typescript: true,
});

/**
 * Credit packages available for purchase
 * 1 credit = 1 search (up to 10 keywords)
 * Optimized for 300-400% margins with DataForSEO Labs API
 */
export const CREDIT_PACKAGES = {
  starter: {
    id: "starter",
    name: "Starter",
    credits: 200,
    price: 900, // $9.00 in cents
    priceDisplay: "$9",
    perSearch: "$0.045",
    popular: false,
    tagline: "200 searches",
    savings: null,
  },
  growth: {
    id: "growth",
    name: "Growth",
    credits: 500,
    price: 2400, // $24.00 in cents
    priceDisplay: "$24",
    perSearch: "$0.048",
    popular: true,
    tagline: "Most popular",
    savings: "Best value",
  },
  pro: {
    id: "pro",
    name: "Pro",
    credits: 1600,
    price: 7900, // $79.00 in cents
    priceDisplay: "$79",
    perSearch: "$0.049",
    popular: false,
    tagline: "For power users",
    savings: null,
  },
} as const;

export type PackageId = keyof typeof CREDIT_PACKAGES;

/**
 * Get package by ID
 */
export function getPackage(packageId: string) {
  return CREDIT_PACKAGES[packageId as PackageId];
}

/**
 * Create a Stripe checkout session for credit purchase
 */
export async function createCheckoutSession({
  userId,
  userEmail,
  packageId,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  userEmail: string;
  packageId: PackageId;
  successUrl: string;
  cancelUrl: string;
}) {
  const pkg = CREDIT_PACKAGES[packageId];

  if (!pkg) {
    throw new Error(`Invalid package: ${packageId}`);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: userEmail,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${pkg.name} - ${pkg.credits.toLocaleString()} Credits`,
            description: `${pkg.credits.toLocaleString()} keyword research credits for KeywordPeek`,
          },
          unit_amount: pkg.price,
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      packageId,
      credits: pkg.credits.toString(),
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session;
}

/**
 * Verify Stripe webhook signature
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  }

  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
}
