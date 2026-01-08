import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div>
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-4 w-72 bg-muted rounded animate-pulse mt-2" />
      </div>

      {/* Search skeleton */}
      <div className="h-14 w-full bg-muted rounded-lg animate-pulse" />

      {/* Table skeleton */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="h-12 bg-muted/30 border-b" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 border-b last:border-0 flex items-center px-4">
            <div className="flex-1 flex items-center gap-4">
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              <div className="h-6 w-10 bg-muted rounded animate-pulse" />
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
