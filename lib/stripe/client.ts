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
 */
export const CREDIT_PACKAGES = {
  starter: {
    id: "starter",
    name: "Starter",
    credits: 1000,
    price: 900, // $9.00 in cents
    priceDisplay: "$9",
    perKeyword: "$0.009",
    popular: false,
  },
  growth: {
    id: "growth",
    name: "Growth",
    credits: 3000,
    price: 1900, // $19.00 in cents
    priceDisplay: "$19",
    perKeyword: "$0.006",
    popular: true,
  },
  pro: {
    id: "pro",
    name: "Pro",
    credits: 10000,
    price: 4900, // $49.00 in cents
    priceDisplay: "$49",
    perKeyword: "$0.005",
    popular: false,
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
