import { vi } from "vitest";

/**
 * Create a mock Request object for testing API routes
 */
export function createMockRequest(
  method: string,
  body?: object,
  options?: {
    headers?: Record<string, string>;
    url?: string;
  }
): Request {
  const url = options?.url || "http://localhost:3000/api/test";
  const headers = new Headers(options?.headers || {});

  if (body) {
    headers.set("Content-Type", "application/json");
  }

  return new Request(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Create mock route params for dynamic routes
 */
export function createMockParams(params: Record<string, string>) {
  return { params: Promise.resolve(params) };
}

/**
 * Parse JSON response from NextResponse
 */
export async function parseResponse<T = unknown>(response: Response): Promise<{
  status: number;
  data: T;
}> {
  const data = await response.json();
  return {
    status: response.status,
    data,
  };
}

/**
 * Default mock user for tests
 */
export const mockUser = {
  id: "user-123",
  email: "test@example.com",
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  created_at: "2024-01-01T00:00:00Z",
};

/**
 * Mock keyword result
 */
export const mockKeywordResult = {
  keyword: "test keyword",
  searchVolume: 5000,
  cpc: 1.5,
  competition: "medium" as const,
  competitionScore: 0.5,
  difficulty: 45,
  keywordScore: 65,
  intent: "informational",
  trend: [
    { year: 2024, month: 1, volume: 4800 },
    { year: 2024, month: 2, volume: 5000 },
    { year: 2024, month: 3, volume: 5200 },
  ],
  locationCode: 2840,
  languageCode: "en",
};

/**
 * Mock project
 */
export const mockProject = {
  id: "project-123",
  user_id: "user-123",
  name: "Test Project",
  domain: "example.com",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

/**
 * Mock saved keyword
 */
export const mockSavedKeyword = {
  id: "keyword-123",
  project_id: "project-123",
  keyword: "test keyword",
  search_volume: 5000,
  difficulty: 45,
  cpc: 1.5,
  keyword_score: 65,
  status: "saved",
  created_at: "2024-01-01T00:00:00Z",
};

/**
 * Create a chainable mock query builder for Supabase
 */
export function createMockQueryBuilder(returnData: unknown = [], error: Error | null = null) {
  const builder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: returnData, error }),
    maybeSingle: vi.fn().mockResolvedValue({ data: returnData, error }),
    then: vi.fn((resolve) => resolve({ data: returnData, error })),
  };

  // Make it thenable for await
  Object.defineProperty(builder, "then", {
    value: (resolve: (value: { data: unknown; error: Error | null }) => void) => {
      return Promise.resolve({ data: returnData, error }).then(resolve);
    },
  });

  return builder;
}
