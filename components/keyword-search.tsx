"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Search, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
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
  placeholder = "Enter a keyword to research...",
  className,
  maxKeywords = 10,
}: KeywordSearchProps) {
  const [value, setValue] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
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

  return (
    <form onSubmit={handleSubmit} className={cn("w-full", className)}>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Search className="h-5 w-5" />
          )}
        </div>

        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          className={cn(
            "h-14 pl-12 pr-24 text-base",
            "bg-card border-border",
            "focus-visible:ring-primary/20 focus-visible:ring-offset-0",
            "placeholder:text-muted-foreground/60"
          )}
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={isLoading}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            type="submit"
            disabled={keywords.length === 0 || isLoading}
            className="h-10"
          >
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>

      {/* Keyword chips preview */}
      {keywords.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {keywords.map((keyword, index) => (
            <span
              key={`${keyword}-${index}`}
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-sm",
                "bg-secondary text-secondary-foreground",
                "animate-fade-in-up",
                index === 0 && "stagger-1",
                index === 1 && "stagger-2",
                index === 2 && "stagger-3",
                index === 3 && "stagger-4",
                index === 4 && "stagger-5"
              )}
            >
              {keyword}
              <button
                type="button"
                onClick={() => removeKeyword(index)}
                className="ml-1 hover:text-destructive transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <span className="text-sm text-muted-foreground self-center">
            {keywords.length} keyword{keywords.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Helper text */}
      <p className="mt-2 text-xs text-muted-foreground">
        Tip: Separate multiple keywords with commas
      </p>
    </form>
  );
}
