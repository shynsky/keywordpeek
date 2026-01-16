/**
 * OpenAI Client
 *
 * Configured for GPT-5 nano - fast and cheap for keyword generation.
 * $0.05/1M input, $0.40/1M output
 */

import OpenAI from "openai";

// Singleton instance
let openaiInstance: OpenAI | null = null;

/**
 * Get the OpenAI client instance
 */
export function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }

    openaiInstance = new OpenAI({ apiKey });
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
  // Temperature for keyword generation (some creativity, but structured)
  temperature: 0.7,
  // Max tokens for responses
  maxTokens: 2000,
} as const;
