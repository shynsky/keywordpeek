"use client";

import { useState } from "react";
import {
  Bookmark,
  BookmarkCheck,
  FolderOpen,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Project } from "./project-selector";
import type { KeywordData } from "./keyword-table";

interface SaveKeywordButtonProps {
  keyword: KeywordData;
  projects: Project[];
  savedInProjectIds?: string[];
  onSave: (keyword: KeywordData, projectId: string) => Promise<void>;
  variant?: "icon" | "button";
  className?: string;
}

export function SaveKeywordButton({
  keyword,
  projects,
  savedInProjectIds = [],
  onSave,
  variant = "icon",
  className,
}: SaveKeywordButtonProps) {
  const [open, setOpen] = useState(false);
  const [savingToProjectId, setSavingToProjectId] = useState<string | null>(null);

  const isSaved = savedInProjectIds.length > 0;

  const handleSave = async (projectId: string) => {
    if (savedInProjectIds.includes(projectId)) return;

    setSavingToProjectId(projectId);
    try {
      await onSave(keyword, projectId);
    } catch (error) {
      console.error("Failed to save keyword:", error);
    } finally {
      setSavingToProjectId(null);
    }
  };

  if (projects.length === 0) {
    return (
      <Button
        variant="ghost"
        size={variant === "icon" ? "icon" : "sm"}
        disabled
        className={className}
        title="Create a project first"
      >
        <Bookmark className="h-4 w-4" />
        {variant === "button" && <span className="ml-2">Save</span>}
      </Button>
    );
  }

  // If there's only one project, save directly
  if (projects.length === 1) {
    const project = projects[0];
    const isAlreadySaved = savedInProjectIds.includes(project.id);
    const isSaving = savingToProjectId === project.id;

    return (
      <Button
        variant={isAlreadySaved ? "secondary" : "ghost"}
        size={variant === "icon" ? "icon" : "sm"}
        onClick={() => handleSave(project.id)}
        disabled={isAlreadySaved || isSaving}
        className={cn(
          isAlreadySaved && "text-score-easy",
          className
        )}
        title={isAlreadySaved ? `Saved to ${project.name}` : `Save to ${project.name}`}
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isAlreadySaved ? (
          <BookmarkCheck className="h-4 w-4" />
        ) : (
          <Bookmark className="h-4 w-4" />
        )}
        {variant === "button" && (
          <span className="ml-2">
            {isSaving ? "Saving..." : isAlreadySaved ? "Saved" : "Save"}
          </span>
        )}
      </Button>
    );
  }

  // Multiple projects - show popover
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={isSaved ? "secondary" : "ghost"}
          size={variant === "icon" ? "icon" : "sm"}
          className={cn(
            isSaved && "text-score-easy",
            className
          )}
          title="Save to project"
        >
          {isSaved ? (
            <BookmarkCheck className="h-4 w-4" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
          {variant === "button" && (
            <span className="ml-2">
              {isSaved ? `Saved (${savedInProjectIds.length})` : "Save"}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-2" align="end">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground px-2 py-1">
            Save to project
          </p>
          {projects.map((project) => {
            const isAlreadySaved = savedInProjectIds.includes(project.id);
            const isSaving = savingToProjectId === project.id;

            return (
              <button
                key={project.id}
                onClick={() => handleSave(project.id)}
                disabled={isAlreadySaved || isSaving}
                className={cn(
                  "w-full flex items-center justify-between px-2 py-2 rounded-md text-sm",
                  "transition-colors",
                  isAlreadySaved
                    ? "bg-score-easy/10 text-score-easy cursor-default"
                    : "hover:bg-muted"
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FolderOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{project.name}</span>
                </div>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : isAlreadySaved ? (
                  <Check className="h-4 w-4" />
                ) : null}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Bulk save keywords button
 */
interface BulkSaveButtonProps {
  keywords: KeywordData[];
  projects: Project[];
  onSave: (keywords: KeywordData[], projectId: string) => Promise<void>;
  className?: string;
}

export function BulkSaveButton({
  keywords,
  projects,
  onSave,
  className,
}: BulkSaveButtonProps) {
  const [open, setOpen] = useState(false);
  const [savingToProjectId, setSavingToProjectId] = useState<string | null>(null);

  const handleSave = async (projectId: string) => {
    setSavingToProjectId(projectId);
    try {
      await onSave(keywords, projectId);
      setOpen(false);
    } catch (error) {
      console.error("Failed to save keywords:", error);
    } finally {
      setSavingToProjectId(null);
    }
  };

  if (keywords.length === 0 || projects.length === 0) {
    return (
      <Button variant="outline" size="sm" disabled className={className}>
        <Bookmark className="h-4 w-4 mr-2" />
        Save All
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Bookmark className="h-4 w-4 mr-2" />
          Save All ({keywords.length})
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-2" align="end">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground px-2 py-1">
            Save {keywords.length} keywords to
          </p>
          {projects.map((project) => {
            const isSaving = savingToProjectId === project.id;

            return (
              <button
                key={project.id}
                onClick={() => handleSave(project.id)}
                disabled={isSaving}
                className={cn(
                  "w-full flex items-center justify-between px-2 py-2 rounded-md text-sm",
                  "transition-colors hover:bg-muted"
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FolderOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{project.name}</span>
                </div>
                {isSaving && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
