"use client";

import { useState, useRef } from "react";
import { Lightbulb, Loader2, MapPin, Globe, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

// Common locations with their DataForSEO codes
const LOCATIONS = [
  { code: 2840, name: "United States", language: "en", flag: "US" },
  { code: 2826, name: "United Kingdom", language: "en", flag: "GB" },
  { code: 2124, name: "Canada", language: "en", flag: "CA" },
  { code: 2036, name: "Australia", language: "en", flag: "AU" },
  { code: 2276, name: "Germany", language: "de", flag: "DE" },
  { code: 2250, name: "France", language: "fr", flag: "FR" },
  { code: 2724, name: "Spain", language: "es", flag: "ES" },
  { code: 2484, name: "Mexico", language: "es", flag: "MX" },
  { code: 2076, name: "Brazil", language: "pt", flag: "BR" },
  { code: 2356, name: "India", language: "en", flag: "IN" },
  { code: 2320, name: "Guatemala", language: "es", flag: "GT" },
];

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
  const [locationCode, setLocationCode] = useState(2840);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedLocation = LOCATIONS.find((l) => l.code === locationCode) || LOCATIONS[0];

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
        languageCode: selectedLocation.language,
      });
    } else {
      if (!isValidManual) return;
      onSubmit({
        mode: "manual",
        keywords: parsedKeywords,
        locationCode,
        languageCode: selectedLocation.language,
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
            <div className="flex items-center gap-4">
              {/* Location selector */}
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <select
                  value={locationCode}
                  onChange={(e) => setLocationCode(Number(e.target.value))}
                  disabled={isLoading}
                  className={cn(
                    "bg-transparent text-sm font-medium cursor-pointer",
                    "outline-none border-none",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {LOCATIONS.map((loc) => (
                    <option key={loc.code} value={loc.code}>
                      {loc.flag} {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Language indicator */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="h-4 w-4" />
                <span className="uppercase">{selectedLocation.language}</span>
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
