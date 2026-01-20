"use client";

import { useState, useRef, useEffect } from "react";
import { Clock, ChevronRight, FolderOpen, CheckCircle2, Loader2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ResearchSession } from "@/lib/research/sessions";

interface RecentSessionsProps {
  sessions: ResearchSession[];
  onSelectSession: (session: ResearchSession) => void;
  isLoading?: boolean;
  className?: string;
}

export function RecentSessions({
  sessions,
  onSelectSession,
  isLoading = false,
  className,
}: RecentSessionsProps) {
  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-8", className)}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (sessions.length === 0) {
    return null;
  }

  // Format relative time
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  // Get tab progress text
  const getProgressText = (session: ResearchSession): string => {
    if (session.status === "completed") return "Completed";
    if (session.contentClusters) return "Content planning";
    if (session.competitors) return "Competitor analysis";
    if (session.keywords) return "Validation done";
    return "Just started";
  };

  return (
    <div className={cn("", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-bold text-lg">Recent Research</h2>
        </div>
        {sessions.length > 3 && (
          <button className="text-sm text-primary hover:underline flex items-center gap-1">
            View all
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sessions.slice(0, 6).map((session) => (
          <button
            key={session.id}
            onClick={() => onSelectSession(session)}
            className={cn(
              "p-4 rounded-xl border-2 border-border bg-card text-left",
              "hover:border-primary/30 hover:shadow-playful transition-all duration-200",
              "group"
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-primary" />
                <span className="font-medium truncate max-w-[150px]">
                  {session.title}
                </span>
              </div>
              {session.status === "completed" ? (
                <CheckCircle2 className="h-4 w-4 text-score-easy flex-shrink-0" />
              ) : (
                <div className="h-2 w-2 rounded-full bg-score-medium flex-shrink-0 mt-1" />
              )}
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{getProgressText(session)}</span>
              <span>{formatRelativeTime(session.updatedAt)}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

interface SessionHeaderProps {
  session: ResearchSession;
  onClose?: () => void;
  onUpdateTitle?: (title: string) => void;
  className?: string;
}

export function SessionHeader({ session, onClose, onUpdateTitle, className }: SessionHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const startEditing = () => {
    setEditedTitle(session.title);
    setIsEditing(true);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSave = () => {
    const trimmed = editedTitle.trim();
    if (trimmed && trimmed !== session.title) {
      onUpdateTitle?.(trimmed);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 rounded-xl bg-muted/50 border-2 border-border",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/15">
          <FolderOpen className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2 group">
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className="font-bold text-lg bg-transparent border-b-2 border-primary outline-none px-0 py-0"
              />
            ) : (
              <>
                <h2 className="font-bold text-lg">{session.title}</h2>
                {onUpdateTitle && (
                  <button
                    onClick={startEditing}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
                    aria-label="Edit title"
                  >
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                )}
              </>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Started {formatDate(session.createdAt)}
            {session.creditsUsed > 0 && ` · ${session.creditsUsed} credits used`}
          </p>
          {session.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {session.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {session.status === "completed" ? (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-score-easy/15 text-score-easy text-sm font-medium">
            <CheckCircle2 className="h-4 w-4" />
            Completed
          </span>
        ) : (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-score-medium/15 text-score-medium text-sm font-medium">
            <div className="h-2 w-2 rounded-full bg-score-medium animate-pulse" />
            In Progress
          </span>
        )}

        {onClose && (
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            New Research
          </button>
        )}
      </div>
    </div>
  );
}
