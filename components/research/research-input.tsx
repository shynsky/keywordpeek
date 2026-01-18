"use client";

import { useState, useRef } from "react";
import { Lightbulb, Loader2, Globe, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocationSelector } from "@/components/ui/location-selector";
import { cn } from "@/lib/utils";
import { DEFAULT_LOCATION_CODE } from "@/lib/constants/locations";

export type InputMode = "ai" | "manual";

export interface ResearchSubmitParams {
  mode: InputMode;
  description?: string;
  keywords?: string[];
  locationCode: number;
  languageCode: string;
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
  const [mode, setMode] = useState<InputMode>(defaultMode);
  const [description, setDescription] = useState(defaultDescription);
  const [manualKeywords, setManualKeywords] = useState("");
  const [locationCode, setLocationCode] = useState(DEFAULT_LOCATION_CODE);
  const [languageCode, setLanguageCode] = useState("en");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (mode === "ai") {
      if (!isValidAI) return;
      onSubmit({
        mode: "ai",
        description: description.trim(),
        locationCode,
        languageCode,
      });
    } else {
      if (!isValidManual) return;
      onSubmit({
        mode: "manual",
        keywords: parsedKeywords,
        locationCode,
        languageCode,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("w-full", className)}>
      {/* Mode Toggle */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex rounded-xl bg-muted p-1">
          <button
            type="button"
            onClick={() => setMode("ai")}
            disabled={isLoading}
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
            disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
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

          {/* Footer with location selector and submit */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-border/50 bg-muted/30 rounded-b-2xl">
            <div className="flex items-center gap-2">
              {/* Location selector */}
              <LocationSelector
                value={locationCode}
                onValueChange={(code, lang) => {
                  setLocationCode(code);
                  setLanguageCode(lang);
                }}
                disabled={isLoading}
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
                  isLoading ||
                  (mode === "ai" && !isValidAI) ||
                  (mode === "manual" && !isValidManual)
                }
                className="h-10 px-5 gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {mode === "ai" ? "Generating..." : "Analyzing..."}
                  </>
                ) : mode === "ai" ? (
                  <>
                    <Lightbulb className="h-4 w-4" />
                    Generate Keywords
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Analyze Keywords
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
