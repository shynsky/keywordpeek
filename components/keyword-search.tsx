"use client";

import { useState, useCallback, useRef } from "react";
import { Search, Loader2, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface KeywordSearchProps {
  onSearch: (keywords: string[]) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  maxKeywords?: number;
}

export function KeywordSearch({
  onSearch,
  isLoading = false,
  placeholder = "Enter keywords to discover opportunities...",
  className,
  maxKeywords = 10,
}: KeywordSearchProps) {
  const [value, setValue] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Parse keywords from input (comma or newline separated)
  const parseKeywords = useCallback(
    (input: string): string[] => {
      return input
        .split(/[,\n]/)
        .map((k) => k.trim().toLowerCase())
        .filter((k) => k.length > 0)
        .slice(0, maxKeywords);
    },
    [maxKeywords]
  );

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    // Update keyword chips in real-time
    if (newValue.includes(",") || newValue.includes("\n")) {
      setKeywords(parseKeywords(newValue));
    } else {
      setKeywords(newValue.trim() ? [newValue.trim().toLowerCase()] : []);
    }
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keywords.length === 0 || isLoading) return;
    onSearch(keywords);
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Clear input
  const handleClear = () => {
    setValue("");
    setKeywords([]);
    inputRef.current?.focus();
  };

  // Remove a single keyword
  const removeKeyword = (index: number) => {
    const newKeywords = keywords.filter((_, i) => i !== index);
    setKeywords(newKeywords);
    setValue(newKeywords.join(", "));
  };

  // Chip colors for variety
  const chipColors = [
    "bg-primary/15 text-primary border-primary/30",
    "bg-accent-secondary/15 text-accent-secondary border-accent-secondary/30",
    "bg-accent/20 text-accent-foreground border-accent/40",
    "bg-score-easy/15 text-score-easy border-score-easy/30",
    "bg-score-medium/15 text-score-medium border-score-medium/30",
  ];

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

        <div className="relative bg-card rounded-2xl">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground">
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            ) : (
              <Search
                className={cn(
                  "h-6 w-6 transition-colors duration-200",
                  isFocused && "text-primary"
                )}
              />
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={isLoading}
            className={cn(
              "w-full h-16 pl-14 pr-36 text-lg bg-transparent rounded-2xl",
              "border-2 border-border transition-all duration-200 outline-none",
              "placeholder:text-muted-foreground/50",
              "focus:border-transparent",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          />

          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {value && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handleClear}
                disabled={isLoading}
                className="text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button
              type="submit"
              variant="gradient"
              disabled={keywords.length === 0 || isLoading}
              className="h-11 px-6 gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Keyword chips preview */}
      {keywords.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {keywords.map((keyword, index) => (
            <span
              key={`${keyword}-${index}`}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border-2",
                "animate-bounce-in transition-all duration-200 hover:scale-105",
                chipColors[index % chipColors.length]
              )}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {keyword}
              <button
                type="button"
                onClick={() => removeKeyword(index)}
                className="ml-0.5 hover:opacity-70 transition-opacity"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
          <span className="inline-flex items-center px-3 py-1.5 text-sm text-muted-foreground font-medium">
            {keywords.length} keyword{keywords.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Helper text */}
      <p className="mt-3 text-sm text-muted-foreground flex items-center gap-2">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        Tip: Separate multiple keywords with commas for bulk research
      </p>
    </form>
  );
}
