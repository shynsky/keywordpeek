"use client";

import { useState } from "react";
import {
  Check,
  ChevronsUpDown,
  FolderPlus,
  FolderOpen,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface Project {
  id: string;
  name: string;
  domain?: string | null;
  keywordCount?: number;
}

interface ProjectSelectorProps {
  projects: Project[];
  selectedProjectId?: string | null;
  onSelect: (projectId: string | null) => void;
  onCreate?: (name: string, domain?: string) => Promise<Project>;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

export function ProjectSelector({
  projects,
  selectedProjectId,
  onSelect,
  onCreate,
  isLoading = false,
  placeholder = "Select project...",
  className,
}: ProjectSelectorProps) {
  const [open, setOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDomain, setNewProjectDomain] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const handleCreate = async () => {
    if (!onCreate || !newProjectName.trim()) return;

    setIsCreating(true);
    try {
      const project = await onCreate(newProjectName.trim(), newProjectDomain.trim() || undefined);
      onSelect(project.id);
      setCreateDialogOpen(false);
      setNewProjectName("");
      setNewProjectDomain("");
    } catch (error) {
      console.error("Failed to create project:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "justify-between min-w-[200px]",
              !selectedProject && "text-muted-foreground",
              className
            )}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : selectedProject ? (
              <div className="flex items-center gap-2 truncate">
                <FolderOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{selectedProject.name}</span>
                {selectedProject.keywordCount !== undefined && (
                  <span className="text-muted-foreground text-xs">
                    ({selectedProject.keywordCount})
                  </span>
                )}
              </div>
            ) : (
              <span>{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search projects..." />
            <CommandList>
              <CommandEmpty>No projects found.</CommandEmpty>
              <CommandGroup heading="Projects">
                {projects.map((project) => (
                  <CommandItem
                    key={project.id}
                    value={project.name}
                    onSelect={() => {
                      onSelect(project.id);
                      setOpen(false);
                    }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FolderOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="flex flex-col min-w-0">
                        <span className="truncate">{project.name}</span>
                        {project.domain && (
                          <span className="text-xs text-muted-foreground truncate">
                            {project.domain}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {project.keywordCount !== undefined && (
                        <span className="text-xs text-muted-foreground">
                          {project.keywordCount} keywords
                        </span>
                      )}
                      <Check
                        className={cn(
                          "h-4 w-4 shrink-0",
                          selectedProjectId === project.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              {onCreate && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        setOpen(false);
                        setCreateDialogOpen(true);
                      }}
                      className="text-primary"
                    >
                      <FolderPlus className="h-4 w-4 mr-2" />
                      Create new project
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Projects help you organize keywords for different websites or campaigns.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                placeholder="My Awesome Blog"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newProjectName.trim()) {
                    handleCreate();
                  }
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="domain">
                Domain <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="domain"
                placeholder="example.com"
                value={newProjectDomain}
                onChange={(e) => setNewProjectDomain(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Adding a domain helps with keyword suggestions.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!newProjectName.trim() || isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Create Project
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Compact project badge for displaying in headers
 */
interface ProjectBadgeProps {
  project: Project;
  onClick?: () => void;
  className?: string;
}

export function ProjectBadge({ project, onClick, className }: ProjectBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg",
        "bg-secondary text-secondary-foreground",
        onClick && "cursor-pointer hover:bg-secondary/80 transition-colors",
        className
      )}
      onClick={onClick}
    >
      <FolderOpen className="h-4 w-4 text-muted-foreground" />
      <span className="font-medium">{project.name}</span>
      {project.keywordCount !== undefined && (
        <span className="text-xs text-muted-foreground bg-background/50 px-1.5 py-0.5 rounded">
          {project.keywordCount}
        </span>
      )}
    </div>
  );
}

/**
 * Project list for sidebars
 */
interface ProjectListProps {
  projects: Project[];
  selectedProjectId?: string | null;
  onSelect: (projectId: string) => void;
  className?: string;
}

export function ProjectList({
  projects,
  selectedProjectId,
  onSelect,
  className,
}: ProjectListProps) {
  return (
    <div className={cn("space-y-1", className)}>
      {projects.map((project) => (
        <button
          key={project.id}
          onClick={() => onSelect(project.id)}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-left",
            "transition-colors",
            selectedProjectId === project.id
              ? "bg-primary/10 text-primary"
              : "hover:bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <FolderOpen className="h-4 w-4 shrink-0" />
            <span className="truncate font-medium">{project.name}</span>
          </div>
          {project.keywordCount !== undefined && (
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                selectedProjectId === project.id
                  ? "bg-primary/20"
                  : "bg-muted"
              )}
            >
              {project.keywordCount}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
