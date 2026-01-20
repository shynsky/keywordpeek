"use client";

import { useState, useRef, useCallback } from "react";
import {
  Lightbulb,
  Loader2,
  Globe,
  Search,
  ArrowLeft,
  Coins,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocationSelector } from "@/components/ui/location-selector";
import { cn } from "@/lib/utils";
import { useLocationPreference } from "@/lib/hooks/use-location-preference";
import { KeywordEditor } from "./keyword-editor";
import { SmartSuggestions } from "./smart-suggestions";
import type { ContextualSuggestion } from "@/lib/openai/keywords";

export type InputMode = "ai" | "manual";
export type FlowState = "input" | "review" | "analyzing";

export interface ResearchSubmitParams {
  mode: InputMode;
  description?: string;
  keywords: string[];
  locationCode: number;
  languageCode: string;
  title?: string;
}

export interface GeneratedData {
  keywords: string[];
  seedTopics: string[];
  marketAngle: string;
  title: string;
  suggestions: ContextualSuggestion[];
  estimatedCredits: number;
}

interface ResearchInputProps {
  onSubmit: (params: ResearchSubmitParams) => void;
  isLoading?: boolean;
  className?: string;
  defaultDescription?: string;
  defaultMode?: InputMode;
}

export function ResearchInput({
  onSubmit,
  isLoading = false,
  className,
  defaultDescription = "",
  defaultMode = "ai",
}: ResearchInputProps) {
  // Input state
  const [mode, setMode] = useState<InputMode>(defaultMode);
  const [description, setDescription] = useState(defaultDescription);
  const [manualKeywords, setManualKeywords] = useState("");
  const [locationCode, languageCode, setLocation] = useLocationPreference();
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Flow state
  const [flowState, setFlowState] = useState<FlowState>("input");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Review state data
  const [generatedData, setGeneratedData] = useState<GeneratedData | null>(null);
  const [editedKeywords, setEditedKeywords] = useState<string[]>([]);

  // Parse manual keywords from textarea (comma or newline separated)
  const parseKeywords = (input: string): string[] => {
    return input
      .split(/[,\n]+/)
      .map((kw) => kw.trim().toLowerCase())
      .filter((kw) => kw.length > 0 && kw.length <= 80);
  };

  const parsedKeywords = parseKeywords(manualKeywords);
  const isValidManual = parsedKeywords.length >= 1 && parsedKeywords.length <= 20;
  const isValidAI = description.trim().length >= 10;

  // Calculate credit estimate based on current keywords
  const calculateCredits = (keywordCount: number): number => {
    // Base cost: 1 credit per 10 keywords + 1 for validation summary
    const searchCredits = keywordCount <= 10 ? 1 : 1 + Math.ceil((keywordCount - 10) / 10);
    return searchCredits + 1; // +1 for LLM validation summary
  };

  // Credit estimate is calculated dynamically in the UI using calculateCredits()

  // Handle AI keyword generation (step 1)
  const handleGenerateKeywords = useCallback(async () => {
    if (!isValidAI || isGenerating) return;

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const response = await fetch("/api/research/generate-keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim(),
          locationCode,
          languageCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setGenerationError(data.error || "Failed to generate keywords");
        return;
      }

      setGeneratedData(data);
      setEditedKeywords(data.keywords);
      setFlowState("review");
    } catch (err) {
      setGenerationError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }, [description, locationCode, languageCode, isValidAI, isGenerating]);

  // Handle manual mode transition to review
  const handleManualReview = useCallback(() => {
    if (!isValidManual) return;

    // For manual mode, we don't have AI-generated data, but we still show review
    setEditedKeywords(parsedKeywords);
    setGeneratedData({
      keywords: parsedKeywords,
      seedTopics: [],
      marketAngle: "",
      title: `${parsedKeywords[0]}${parsedKeywords.length > 1 ? ` (+${parsedKeywords.length - 1})` : ""}`,
      suggestions: [],
      estimatedCredits: calculateCredits(parsedKeywords.length),
    });
    setFlowState("review");
  }, [parsedKeywords, isValidManual]);

  // Handle going back to input
  const handleBack = useCallback(() => {
    setFlowState("input");
    setGenerationError(null);
  }, []);

  // Handle confirm and submit for analysis
  const handleConfirm = useCallback(() => {
    if (editedKeywords.length === 0 || isLoading) return;

    onSubmit({
      mode,
      description: mode === "ai" ? description.trim() : undefined,
      keywords: editedKeywords,
      locationCode,
      languageCode,
      title: generatedData?.title,
    });
  }, [mode, description, editedKeywords, locationCode, languageCode, generatedData, isLoading, onSubmit]);

  // Handle form submit (input phase)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "ai") {
      handleGenerateKeywords();
    } else {
      handleManualReview();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Review state UI
  if (flowState === "review") {
    return (
      <div className={cn("w-full", className)}>
        <div className="rounded-2xl border-2 border-border bg-card overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 bg-muted/30">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleBack}
                disabled={isLoading}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h3 className="font-semibold">Review Keywords</h3>
                <p className="text-sm text-muted-foreground">
                  {editedKeywords.length} keyword{editedKeywords.length !== 1 ? "s" : ""} ready for analysis
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Coins className="h-4 w-4 text-credit" />
              <span className="font-medium">
                ~{calculateCredits(editedKeywords.length)} credits
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 space-y-6">
            {/* AI-generated insights (only for AI mode) */}
            {mode === "ai" && generatedData?.marketAngle && (
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-sm text-foreground/80">
                  <span className="font-medium text-primary">Market insight:</span>{" "}
                  {generatedData.marketAngle}
                </p>
                {generatedData.seedTopics.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Topics: {generatedData.seedTopics.join(", ")}
                  </p>
                )}
              </div>
            )}

            {/* Keyword editor */}
            <KeywordEditor
              keywords={editedKeywords}
              onChange={setEditedKeywords}
              disabled={isLoading}
            />

            {/* Smart suggestions */}
            {generatedData && generatedData.suggestions.length > 0 && (
              <SmartSuggestions suggestions={generatedData.suggestions} />
            )}

            {/* Location indicator */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4" />
              <span>
                Results will be based on search data from your selected location
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-border/50 bg-muted/30">
            <Button
              type="button"
              variant="ghost"
              onClick={handleBack}
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Edit
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleConfirm}
              disabled={isLoading || editedKeywords.length === 0}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Run Analysis ({calculateCredits(editedKeywords.length)} credits)
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Input state UI
  return (
    <form onSubmit={handleSubmit} className={cn("w-full", className)}>
      {/* Mode Toggle */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex rounded-xl bg-muted p-1">
          <button
            type="button"
            onClick={() => setMode("ai")}
            disabled={isGenerating}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              mode === "ai"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Lightbulb className="h-4 w-4" />
            AI Suggest
          </button>
          <button
            type="button"
            onClick={() => setMode("manual")}
            disabled={isGenerating}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              mode === "manual"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Search className="h-4 w-4" />
            Enter Keywords
          </button>
        </div>
      </div>

      <div
        className={cn(
          "relative rounded-2xl transition-all duration-300",
          isFocused && "shadow-playful-lg"
        )}
      >
        {/* Gradient border effect */}
        <div
          className={cn(
            "absolute -inset-[2px] rounded-2xl bg-gradient-primary opacity-0 transition-opacity duration-300",
            isFocused && "opacity-100"
          )}
        />

        <div className="relative bg-card rounded-2xl border-2 border-border">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-border/50">
            <div className="p-2 rounded-xl bg-primary/15">
              {mode === "ai" ? (
                <Lightbulb className="h-5 w-5 text-primary" />
              ) : (
                <Search className="h-5 w-5 text-primary" />
              )}
            </div>
            <span className="font-medium text-foreground">
              {mode === "ai"
                ? "Describe your idea in plain English"
                : "Enter your keywords"}
            </span>
          </div>

          {/* Textarea - AI mode */}
          {mode === "ai" && (
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="I want to create a website about motorcycles in Guatemala - reviews, tours, gear recommendations..."
                disabled={isGenerating}
                rows={3}
                aria-label="Describe your niche idea"
                className={cn(
                  "w-full px-5 py-4 text-lg bg-transparent resize-none",
                  "outline-none placeholder:text-muted-foreground/50",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              />
            </div>
          )}

          {/* Textarea - Manual mode */}
          {mode === "manual" && (
            <div className="relative">
              <textarea
                value={manualKeywords}
                onChange={(e) => setManualKeywords(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="motos guatemala, comprar moto, mejores motos 2025&#10;&#10;Enter one keyword per line or separate with commas (max 20)"
                disabled={isGenerating}
                rows={4}
                aria-label="Enter keywords to analyze"
                className={cn(
                  "w-full px-5 py-4 text-base bg-transparent resize-none font-mono",
                  "outline-none placeholder:text-muted-foreground/50",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              />
            </div>
          )}

          {/* Error display */}
          {generationError && (
            <div className="px-5 pb-3">
              <p className="text-sm text-destructive">{generationError}</p>
            </div>
          )}

          {/* Footer with location selector and submit */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-border/50 bg-muted/30 rounded-b-2xl">
            <div className="flex items-center gap-2">
              {/* Location selector */}
              <LocationSelector
                value={locationCode}
                onValueChange={(code, lang) => {
                  setLocation(code, lang);
                }}
                disabled={isGenerating}
              />
              {/* Language indicator */}
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Globe className="h-4 w-4" />
                <span className="uppercase">{languageCode}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {mode === "ai" ? (
                <span className="text-xs text-muted-foreground">
                  {description.length}/500
                </span>
              ) : (
                <span
                  className={cn(
                    "text-xs",
                    parsedKeywords.length > 20
                      ? "text-destructive"
                      : "text-muted-foreground"
                  )}
                >
                  {parsedKeywords.length}/20 keywords
                </span>
              )}
              <Button
                type="submit"
                variant="primary"
                disabled={
                  isGenerating ||
                  (mode === "ai" && !isValidAI) ||
                  (mode === "manual" && !isValidManual)
                }
                className="h-10 px-5 gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : mode === "ai" ? (
                  <>
                    <Lightbulb className="h-4 w-4" />
                    Generate Keywords
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Review Keywords
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Helper text */}
      <p className="mt-3 text-sm text-muted-foreground flex items-center gap-2">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        {mode === "ai"
          ? "Tip: Be specific about your niche, location, and target audience"
          : "Tip: Enter 1-20 keywords, separated by commas or new lines"}
      </p>
    </form>
  );
}
