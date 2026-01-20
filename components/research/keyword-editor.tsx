"use client";

import { useState, useRef, useCallback } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const MAX_KEYWORDS = 20;
const MAX_KEYWORD_LENGTH = 80;

interface KeywordEditorProps {
  keywords: string[];
  onChange: (keywords: string[]) => void;
  disabled?: boolean;
  className?: string;
}

export function KeywordEditor({
  keywords,
  onChange,
  disabled = false,
  className,
}: KeywordEditorProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addKeyword = useCallback(
    (keyword: string) => {
      const trimmed = keyword.trim().toLowerCase();
      if (
        trimmed &&
        trimmed.length <= MAX_KEYWORD_LENGTH &&
        keywords.length < MAX_KEYWORDS &&
        !keywords.includes(trimmed)
      ) {
        onChange([...keywords, trimmed]);
        setInputValue("");
      }
    },
    [keywords, onChange]
  );

  const removeKeyword = useCallback(
    (index: number) => {
      onChange(keywords.filter((_, i) => i !== index));
    },
    [keywords, onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addKeyword(inputValue);
    } else if (e.key === "Backspace" && !inputValue && keywords.length > 0) {
      removeKeyword(keywords.length - 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    // Split by comma or newline and add each keyword
    const pastedKeywords = pastedText
      .split(/[,\n]+/)
      .map((kw) => kw.trim().toLowerCase())
      .filter((kw) => kw.length > 0 && kw.length <= MAX_KEYWORD_LENGTH);

    const newKeywords = [...keywords];
    for (const kw of pastedKeywords) {
      if (newKeywords.length >= MAX_KEYWORDS) break;
      if (!newKeywords.includes(kw)) {
        newKeywords.push(kw);
      }
    }
    onChange(newKeywords);
  };

  const canAddMore = keywords.length < MAX_KEYWORDS;
  const inputTooLong = inputValue.length > MAX_KEYWORD_LENGTH;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Keyword chips */}
      <div className="flex flex-wrap gap-2 min-h-[40px]">
        {keywords.map((keyword, index) => (
          <Badge
            key={`${keyword}-${index}`}
            variant="secondary"
            className="pl-3 pr-1.5 py-1.5 text-sm font-normal normal-case tracking-normal gap-1"
          >
            <span className="max-w-[200px] truncate">{keyword}</span>
            <button
              type="button"
              onClick={() => removeKeyword(index)}
              disabled={disabled}
              className="ml-1 p-0.5 rounded-sm hover:bg-foreground/10 disabled:opacity-50"
              aria-label={`Remove ${keyword}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </Badge>
        ))}
        {keywords.length === 0 && (
          <span className="text-sm text-muted-foreground py-1.5">
            No keywords yet. Add some below.
          </span>
        )}
      </div>

      {/* Add keyword input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={canAddMore ? "Add a keyword..." : "Maximum keywords reached"}
            disabled={disabled || !canAddMore}
            className={cn(
              "h-10 pr-16",
              inputTooLong && "border-destructive focus-visible:ring-destructive"
            )}
            aria-invalid={inputTooLong}
          />
          <span
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 text-xs",
              inputTooLong ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {inputValue.length}/{MAX_KEYWORD_LENGTH}
          </span>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={() => addKeyword(inputValue)}
          disabled={disabled || !canAddMore || !inputValue.trim() || inputTooLong}
          className="h-10 w-10 shrink-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Keyword count */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {keywords.length} of {MAX_KEYWORDS} keywords
        </span>
        <span className="text-muted-foreground/70">
          Press Enter to add, paste multiple with commas
        </span>
      </div>
    </div>
  );
}
