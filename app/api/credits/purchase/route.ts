import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/supabase/server";
import { createCheckoutSession, type PackageId, CREDIT_PACKAGES } from "@/lib/stripe/client";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: 10 checkout sessions per minute
    const rateLimit = checkRateLimit(user.id, 10, 60000);
    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit);
    }

    const body = await request.json();
    const { packageId } = body as { packageId: string };

    // Validate package
    if (!packageId || !CREDIT_PACKAGES[packageId as PackageId]) {
      return NextResponse.json(
        { error: "Invalid package selected" },
        { status: 400 }
      );
    }

    // Get the origin for redirect URLs
    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL;

    // Create checkout session
    const session = await createCheckoutSession({
      userId: user.id,
      userEmail: user.email || "",
      packageId: packageId as PackageId,
      successUrl: `${origin}/account?success=true`,
      cancelUrl: `${origin}/account?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
