"use client";

import { Download, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { KeywordData } from "./keyword-table";

interface CsvExportButtonProps {
  keywords: KeywordData[];
  filename?: string;
  variant?: "default" | "dropdown";
  className?: string;
}

export function CsvExportButton({
  keywords,
  filename = "keywords",
  variant = "default",
  className,
}: CsvExportButtonProps) {
  const exportToCsv = (includeAll: boolean = true) => {
    if (keywords.length === 0) return;

    const headers = includeAll
      ? ["Keyword", "Score", "Search Volume", "Difficulty", "Competition", "CPC"]
      : ["Keyword", "Search Volume"];

    const rows = keywords.map((kw) =>
      includeAll
        ? [
            escapeCSV(kw.keyword),
            kw.keywordScore,
            kw.searchVolume,
            kw.difficulty,
            kw.competition,
            kw.cpc.toFixed(2),
          ]
        : [escapeCSV(kw.keyword), kw.searchVolume]
    );

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    downloadCSV(csvContent, `${filename}-${formatDate(new Date())}.csv`);
  };

  if (keywords.length === 0) {
    return (
      <Button variant="outline" size="sm" disabled className={className}>
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
    );
  }

  if (variant === "dropdown") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={className}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => exportToCsv(true)}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Full export (all columns)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => exportToCsv(false)}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Simple export (keyword + volume)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => exportToCsv(true)}
      className={cn("", className)}
    >
      <Download className="h-4 w-4 mr-2" />
      Export CSV
      <span className="ml-1 text-muted-foreground">({keywords.length})</span>
    </Button>
  );
}

/**
 * Escape CSV field value
 */
function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Download CSV content as file
 */
function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format date for filename
 */
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Copy keywords to clipboard
 */
interface CopyKeywordsButtonProps {
  keywords: string[];
  className?: string;
}

export function CopyKeywordsButton({
  keywords,
  className,
}: CopyKeywordsButtonProps) {
  const handleCopy = async () => {
    if (keywords.length === 0) return;

    try {
      await navigator.clipboard.writeText(keywords.join("\n"));
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      disabled={keywords.length === 0}
      className={className}
    >
      Copy {keywords.length} keyword{keywords.length !== 1 ? "s" : ""}
    </Button>
  );
}
