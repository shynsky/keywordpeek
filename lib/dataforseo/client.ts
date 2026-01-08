/**
 * DataForSEO API Client
 *
 * Base HTTP client with authentication and error handling.
 * Uses Basic Auth with login:password encoded as base64.
 */

import type { DataForSEOResponse, DataForSEOError } from "./types";

const DATAFORSEO_API_URL = "https://api.dataforseo.com";

class DataForSEOClient {
  private authHeader: string;

  constructor() {
    const login = process.env.DATAFORSEO_LOGIN;
    const password = process.env.DATAFORSEO_PASSWORD;

    if (!login || !password) {
      throw new Error(
        "DataForSEO credentials not configured. Set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD."
      );
    }

    // Basic Auth: base64 encode "login:password"
    this.authHeader = `Basic ${Buffer.from(`${login}:${password}`).toString("base64")}`;
  }

  /**
   * Make a POST request to the DataForSEO API
   */
  async post<T>(
    endpoint: string,
    data: unknown[]
  ): Promise<DataForSEOResponse<T>> {
    const url = `${DATAFORSEO_API_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: this.authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await this.parseErrorResponse(response);
        throw new DataForSEOApiError(
          error.message,
          error.code,
          response.status
        );
      }

      const result = (await response.json()) as DataForSEOResponse<T>;

      // Check for API-level errors
      if (result.status_code !== 20000) {
        throw new DataForSEOApiError(
          result.status_message,
          result.status_code,
          response.status
        );
      }

      return result;
    } catch (error) {
      if (error instanceof DataForSEOApiError) {
        throw error;
      }

      // Network or parsing error
      throw new DataForSEOApiError(
        error instanceof Error ? error.message : "Unknown error occurred",
        0,
        0
      );
    }
  }

  /**
   * Parse error response from API
   */
  private async parseErrorResponse(
    response: Response
  ): Promise<DataForSEOError> {
    try {
      const data = await response.json();
      return {
        code: data.status_code || response.status,
        message: data.status_message || response.statusText,
        data: data,
      };
    } catch {
      return {
        code: response.status,
        message: response.statusText || "Request failed",
      };
    }
  }
}

/**
 * Custom error class for DataForSEO API errors
 */
export class DataForSEOApiError extends Error {
  public readonly code: number;
  public readonly httpStatus: number;

  constructor(message: string, code: number, httpStatus: number) {
    super(message);
    this.name = "DataForSEOApiError";
    this.code = code;
    this.httpStatus = httpStatus;
  }

  /**
   * Check if this is a rate limit error
   */
  isRateLimited(): boolean {
    return this.code === 40200 || this.httpStatus === 429;
  }

  /**
   * Check if this is an authentication error
   */
  isAuthError(): boolean {
    return this.code === 40100 || this.httpStatus === 401;
  }

  /**
   * Check if this is a quota/balance error
   */
  isQuotaError(): boolean {
    return this.code === 40201;
  }
}

// Singleton instance
let clientInstance: DataForSEOClient | null = null;

/**
 * Get the DataForSEO client instance
 */
export function getClient(): DataForSEOClient {
  if (!clientInstance) {
    clientInstance = new DataForSEOClient();
  }
  return clientInstance;
}

/**
 * Reset the client (useful for testing)
 */
export function resetClient(): void {
  clientInstance = null;
}
