/**
 * OpenAI Client
 *
 * Configured for GPT-5 nano - fast and cheap for keyword generation.
 * Includes 60-second timeout for AI requests (can be slow for complex prompts).
 */

import OpenAI from "openai";

// Default timeout of 60 seconds for OpenAI requests (AI can be slow)
const DEFAULT_TIMEOUT_MS = 60000;

// Singleton instance
let openaiInstance: OpenAI | null = null;

/**
 * Get the OpenAI client instance
 * Includes automatic timeout configuration
 */
export function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }

    openaiInstance = new OpenAI({
      apiKey,
      timeout: DEFAULT_TIMEOUT_MS,
      maxRetries: 2,
    });
  }

  return openaiInstance;
}

/**
 * Reset the client (useful for testing)
 */
export function resetOpenAI(): void {
  openaiInstance = null;
}

/**
 * Model configuration
 */
export const OPENAI_CONFIG = {
  // GPT-5 nano - fast, cheap, good for structured outputs
  model: "gpt-5-nano",
  // Max tokens for responses (includes reasoning + output tokens)
  maxCompletionTokens: 8000,
} as const;
