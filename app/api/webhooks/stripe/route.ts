import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { constructWebhookEvent } from "@/lib/stripe/client";
import { createServiceClient } from "@/lib/supabase/server";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = constructWebhookEvent(body, signature);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "payment_intent.succeeded": {
        // Log for debugging, but main logic is in checkout.session.completed
        console.log("Payment succeeded:", event.data.object);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    // Return 500 to trigger Stripe retry
    console.error("Webhook processing failed:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

/**
 * Handle successful checkout session
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const credits = parseInt(session.metadata?.credits || "0", 10);
  const packageId = session.metadata?.packageId;

  // Validate required metadata
  if (!userId || !credits) {
    console.error("WEBHOOK_ERROR: Missing metadata", {
      sessionId: session.id,
      userId,
      credits,
      packageId,
      timestamp: new Date().toISOString(),
    });
    // Throw to trigger Stripe retry - this is a configuration error
    throw new Error(`Missing metadata in checkout session: ${session.id}`);
  }

  const supabase = await createServiceClient();

  // Check for duplicate processing (idempotency)
  const { data: existingTx } = await supabase
    .from("transactions")
    .select("id")
    .eq("stripe_session_id", session.id)
    .single();

  if (existingTx) {
    // Already processed - this is fine, just acknowledge
    console.log(`Webhook already processed for session: ${session.id}`);
    return;
  }

  // Add credits to user
  const { data: newBalance, error: creditError } = await supabase.rpc(
    "add_credits",
    {
      p_user_id: userId,
      p_amount: credits,
      p_type: "purchase",
      p_description: `Purchased ${packageId} package - ${credits.toLocaleString()} credits`,
      p_stripe_session_id: session.id,
    }
  );

  if (creditError) {
    console.error("WEBHOOK_ERROR: Credit add failed", {
      sessionId: session.id,
      userId,
      credits,
      error: creditError,
      timestamp: new Date().toISOString(),
    });
    // Throw to trigger Stripe retry
    throw new Error(`Failed to add credits: ${creditError.message}`);
  }

  console.log("WEBHOOK_SUCCESS: Credits added", {
    sessionId: session.id,
    userId,
    credits,
    newBalance,
    timestamp: new Date().toISOString(),
  });
}
