"use client";

import { useState, useRef } from "react";
import { Lightbulb, Loader2, MapPin, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ResearchInputProps {
  onSubmit: (description: string, locationCode: number, languageCode: string) => void;
  isLoading?: boolean;
  className?: string;
  defaultDescription?: string;
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
}: ResearchInputProps) {
  const [description, setDescription] = useState(defaultDescription);
  const [locationCode, setLocationCode] = useState(2840);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedLocation = LOCATIONS.find((l) => l.code === locationCode) || LOCATIONS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || isLoading) return;
    onSubmit(description.trim(), locationCode, selectedLocation.language);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("w-full", className)}>
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
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <span className="font-medium text-foreground">
              Describe your idea in plain English
            </span>
          </div>

          {/* Textarea */}
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
              <span className="text-xs text-muted-foreground">
                {description.length}/500
              </span>
              <Button
                type="submit"
                variant="primary"
                disabled={!description.trim() || description.length < 10 || isLoading}
                className="h-10 px-5 gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Lightbulb className="h-4 w-4" />
                    Generate Keywords
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
        Tip: Be specific about your niche, location, and target audience
      </p>
    </form>
  );
}
