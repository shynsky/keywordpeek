import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockRequest, parseResponse, mockUser, mockProject } from "../helpers";

// Mock Supabase
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

import { GET, POST } from "@/app/api/projects/route";
import { createClient } from "@/lib/supabase/server";

describe("/api/projects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function setupAuthenticatedUser(user = mockUser) {
    return vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
      },
      from: vi.fn(),
    } as never);
  }

  function setupUnauthenticated() {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    } as never);
  }

  describe("GET /api/projects", () => {
    it("returns user's projects with keyword counts", async () => {
      const mockProjects = [
        { ...mockProject, keywords: [{ count: 5 }] },
        { ...mockProject, id: "project-456", name: "Project 2", keywords: [{ count: 10 }] },
      ];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockProjects, error: null }),
      });

      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
        from: mockFrom,
      } as never);

      const request = createMockRequest("GET");
      const response = await GET();
      const { status, data } = await parseResponse(response);

      expect(status).toBe(200);
      expect((data as { data: unknown[] }).data).toHaveLength(2);
      expect((data as { data: Array<{ keywordCount: number }> }).data[0].keywordCount).toBe(5);
      expect((data as { data: Array<{ keywordCount: number }> }).data[1].keywordCount).toBe(10);
    });

    it("returns 401 when unauthenticated", async () => {
      setupUnauthenticated();

      const response = await GET();
      const { status, data } = await parseResponse(response);

      expect(status).toBe(401);
      expect(data).toHaveProperty("error", "Unauthorized");
    });

    it("returns only user's own projects", async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [mockProject], error: null }),
      });

      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
        from: mockFrom,
      } as never);

      await GET();

      // Verify eq was called with user_id filter
      const fromCall = mockFrom.mock.results[0].value;
      expect(fromCall.eq).toHaveBeenCalledWith("user_id", mockUser.id);
    });
  });

  describe("POST /api/projects", () => {
    it("creates new project", async () => {
      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProject, error: null }),
      });

      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
        from: mockFrom,
      } as never);

      const request = createMockRequest("POST", { name: "New Project", domain: "example.com" });
      const response = await POST(request);
      const { status, data } = await parseResponse(response);

      expect(status).toBe(201);
      expect((data as { data: typeof mockProject }).data).toEqual(mockProject);
    });

    it("returns 401 when unauthenticated", async () => {
      setupUnauthenticated();

      const request = createMockRequest("POST", { name: "Test" });
      const response = await POST(request);
      const { status, data } = await parseResponse(response);

      expect(status).toBe(401);
      expect(data).toHaveProperty("error", "Unauthorized");
    });

    it("validates name is required", async () => {
      setupAuthenticatedUser();

      const request = createMockRequest("POST", {});
      const response = await POST(request);
      const { status, data } = await parseResponse(response);

      expect(status).toBe(400);
      expect(data).toHaveProperty("error", "Project name is required");
    });

    it("validates empty name", async () => {
      setupAuthenticatedUser();

      const request = createMockRequest("POST", { name: "   " });
      const response = await POST(request);
      const { status, data } = await parseResponse(response);

      expect(status).toBe(400);
      expect(data).toHaveProperty("error", "Project name is required");
    });

    it("validates name max length (100 chars)", async () => {
      setupAuthenticatedUser();

      const longName = "a".repeat(101);
      const request = createMockRequest("POST", { name: longName });
      const response = await POST(request);
      const { status, data } = await parseResponse(response);

      expect(status).toBe(400);
      expect(data).toHaveProperty("error", "Project name must be 100 characters or less");
    });

    it("trims name and domain", async () => {
      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProject, error: null }),
      });

      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
        from: mockFrom,
      } as never);

      const request = createMockRequest("POST", {
        name: "  Test Project  ",
        domain: "  example.com  ",
      });
      await POST(request);

      const insertCall = mockFrom.mock.results[0].value.insert;
      expect(insertCall).toHaveBeenCalledWith({
        user_id: mockUser.id,
        name: "Test Project",
        domain: "example.com",
      });
    });
  });
});
