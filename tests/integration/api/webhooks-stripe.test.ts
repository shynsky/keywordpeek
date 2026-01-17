import { describe, it, expect, vi, beforeEach } from "vitest";
import type Stripe from "stripe";

// Mock modules before importing route
vi.mock("@/lib/stripe/client", () => ({
  constructWebhookEvent: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServiceClient: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

import { POST } from "@/app/api/webhooks/stripe/route";
import { constructWebhookEvent } from "@/lib/stripe/client";
import { createServiceClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

describe("POST /api/webhooks/stripe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createMockRequest(body: string): Request {
    return {
      text: vi.fn().mockResolvedValue(body),
    } as unknown as Request;
  }

  function mockHeaders(signature: string | null) {
    vi.mocked(headers).mockResolvedValue({
      get: vi.fn().mockImplementation((name: string) => {
        if (name === "stripe-signature") return signature;
        return null;
      }),
    } as never);
  }

  function mockCheckoutSession(metadata: Record<string, string>): Stripe.Checkout.Session {
    return {
      id: "cs_test_123",
      object: "checkout.session",
      metadata,
      payment_status: "paid",
    } as unknown as Stripe.Checkout.Session;
  }

  function mockSupabaseClient(options: {
    existingTransaction?: boolean;
    creditError?: Error | null;
  } = {}) {
    const { existingTransaction = false, creditError = null } = options;

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: existingTransaction ? { id: "tx_123" } : null,
            error: null,
          }),
        }),
      }),
    });

    const mockRpc = vi.fn().mockResolvedValue({
      data: creditError ? null : 500,
      error: creditError,
    });

    vi.mocked(createServiceClient).mockResolvedValue({
      from: mockFrom,
      rpc: mockRpc,
    } as never);

    return { mockFrom, mockRpc };
  }

  it("returns 400 when stripe-signature header is missing", async () => {
    mockHeaders(null);

    const request = createMockRequest("{}");
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Missing stripe-signature header" });
  });

  it("returns 400 when webhook signature verification fails", async () => {
    mockHeaders("invalid_signature");
    vi.mocked(constructWebhookEvent).mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    const request = createMockRequest("{}");
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Invalid signature" });
  });

  it("handles checkout.session.completed event successfully", async () => {
    mockHeaders("valid_signature");
    const { mockRpc } = mockSupabaseClient();

    const session = mockCheckoutSession({
      userId: "user_123",
      packageId: "starter",
      credits: "200",
    });

    vi.mocked(constructWebhookEvent).mockReturnValue({
      type: "checkout.session.completed",
      data: { object: session },
    } as Stripe.Event);

    const request = createMockRequest("{}");
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ received: true });
    expect(mockRpc).toHaveBeenCalledWith("add_credits", {
      p_user_id: "user_123",
      p_amount: 200,
      p_type: "purchase",
      p_description: "Purchased starter package - 200 credits",
      p_stripe_session_id: "cs_test_123",
    });
  });

  it("skips duplicate webhook processing (idempotency)", async () => {
    mockHeaders("valid_signature");
    const { mockRpc } = mockSupabaseClient({ existingTransaction: true });

    const session = mockCheckoutSession({
      userId: "user_123",
      packageId: "starter",
      credits: "200",
    });

    vi.mocked(constructWebhookEvent).mockReturnValue({
      type: "checkout.session.completed",
      data: { object: session },
    } as Stripe.Event);

    const request = createMockRequest("{}");
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ received: true });
    // Should not call add_credits for duplicate
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("returns 500 when metadata is missing", async () => {
    mockHeaders("valid_signature");
    mockSupabaseClient();

    const session = mockCheckoutSession({});

    vi.mocked(constructWebhookEvent).mockReturnValue({
      type: "checkout.session.completed",
      data: { object: session },
    } as Stripe.Event);

    const request = createMockRequest("{}");
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "Webhook processing failed" });
  });

  it("returns 500 when credit add fails", async () => {
    mockHeaders("valid_signature");
    mockSupabaseClient({
      creditError: new Error("Database error"),
    });

    const session = mockCheckoutSession({
      userId: "user_123",
      packageId: "starter",
      credits: "200",
    });

    vi.mocked(constructWebhookEvent).mockReturnValue({
      type: "checkout.session.completed",
      data: { object: session },
    } as Stripe.Event);

    const request = createMockRequest("{}");
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "Webhook processing failed" });
  });

  it("handles payment_intent.succeeded event (logs only)", async () => {
    mockHeaders("valid_signature");

    vi.mocked(constructWebhookEvent).mockReturnValue({
      type: "payment_intent.succeeded",
      data: { object: { id: "pi_test_123" } },
    } as Stripe.Event);

    const request = createMockRequest("{}");
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ received: true });
  });

  it("handles unrecognized event types gracefully", async () => {
    mockHeaders("valid_signature");

    vi.mocked(constructWebhookEvent).mockReturnValue({
      type: "customer.created",
      data: { object: {} },
    } as unknown as Stripe.Event);

    const request = createMockRequest("{}");
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ received: true });
  });
});
