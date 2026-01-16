-- Add input_mode and manual_keywords columns to research_sessions table
-- This supports manual keyword entry alongside AI-assisted generation

-- Add input_mode column with default 'ai' for existing sessions
ALTER TABLE research_sessions
ADD COLUMN IF NOT EXISTS input_mode TEXT NOT NULL DEFAULT 'ai';

-- Add manual_keywords column for storing user-provided keywords
ALTER TABLE research_sessions
ADD COLUMN IF NOT EXISTS manual_keywords TEXT[] DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN research_sessions.input_mode IS 'Input mode: ai (LLM-generated) or manual (user-provided keywords)';
COMMENT ON COLUMN research_sessions.manual_keywords IS 'User-provided keywords when using manual mode';
