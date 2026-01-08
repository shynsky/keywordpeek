import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockRequest, parseResponse, mockUser } from "../helpers";

// Mock modules
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/stripe/client", () => ({
  createCheckoutSession: vi.fn(),
  CREDIT_PACKAGES: {
    starter: {
      id: "starter",
      name: "Starter",
      credits: 1000,
      price: 900,
      priceDisplay: "$9",
      perKeyword: "$0.009",
      popular: false,
    },
    growth: {
      id: "growth",
      name: "Growth",
      credits: 3000,
      price: 1900,
      priceDisplay: "$19",
      perKeyword: "$0.006",
      popular: true,
    },
    pro: {
      id: "pro",
      name: "Pro",
      credits: 10000,
      price: 4900,
      priceDisplay: "$49",
      perKeyword: "$0.005",
      popular: false,
    },
  },
}));

import { POST } from "@/app/api/credits/purchase/route";
import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession } from "@/lib/stripe/client";

describe("POST /api/credits/purchase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function setupAuthenticatedUser(user = mockUser) {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
      },
    } as never);
  }

  function setupUnauthenticated() {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    } as never);
  }

  it("creates checkout session for starter package", async () => {
    setupAuthenticatedUser();
    vi.mocked(createCheckoutSession).mockResolvedValue({
      url: "https://checkout.stripe.com/test-starter",
    } as never);

    const request = createMockRequest(
      "POST",
      { packageId: "starter" },
      { headers: { Origin: "http://localhost:3000" } }
    );
    const response = await POST(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(200);
    expect(data).toHaveProperty("url", "https://checkout.stripe.com/test-starter");
    expect(createCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: mockUser.id,
        userEmail: mockUser.email,
        packageId: "starter",
      })
    );
  });

  it("creates checkout session for growth package", async () => {
    setupAuthenticatedUser();
    vi.mocked(createCheckoutSession).mockResolvedValue({
      url: "https://checkout.stripe.com/test-growth",
    } as never);

    const request = createMockRequest(
      "POST",
      { packageId: "growth" },
      { headers: { origin: "http://localhost:3000" } }
    );
    const response = await POST(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(200);
    expect(createCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({ packageId: "growth" })
    );
  });

  it("creates checkout session for pro package", async () => {
    setupAuthenticatedUser();
    vi.mocked(createCheckoutSession).mockResolvedValue({
      url: "https://checkout.stripe.com/test-pro",
    } as never);

    const request = createMockRequest(
      "POST",
      { packageId: "pro" },
      { headers: { origin: "http://localhost:3000" } }
    );
    const response = await POST(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(200);
    expect(createCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({ packageId: "pro" })
    );
  });

  it("returns 400 for invalid package", async () => {
    setupAuthenticatedUser();

    const request = createMockRequest("POST", { packageId: "invalid" });
    const response = await POST(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(400);
    expect(data).toHaveProperty("error", "Invalid package selected");
    expect(createCheckoutSession).not.toHaveBeenCalled();
  });

  it("returns 400 for missing packageId", async () => {
    setupAuthenticatedUser();

    const request = createMockRequest("POST", {});
    const response = await POST(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(400);
    expect(data).toHaveProperty("error", "Invalid package selected");
  });

  it("returns 401 when unauthenticated", async () => {
    setupUnauthenticated();

    const request = createMockRequest("POST", { packageId: "starter" });
    const response = await POST(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(401);
    expect(data).toHaveProperty("error", "Unauthorized");
  });

  it("includes user data in checkout session", async () => {
    setupAuthenticatedUser();
    vi.mocked(createCheckoutSession).mockResolvedValue({
      url: "https://checkout.stripe.com/test",
    } as never);

    const request = createMockRequest("POST", { packageId: "growth" });
    await POST(request);

    expect(createCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: mockUser.id,
        userEmail: mockUser.email,
        packageId: "growth",
      })
    );
  });
});
