export default function AccountLoading() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div>
        <div className="h-8 w-32 bg-muted rounded animate-pulse" />
        <div className="h-4 w-64 bg-muted rounded animate-pulse mt-2" />
      </div>

      {/* Credits display skeleton */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-3 px-6 py-4 rounded-xl bg-muted/30">
          <div className="h-8 w-8 bg-muted rounded animate-pulse" />
          <div>
            <div className="h-9 w-24 bg-muted rounded animate-pulse" />
            <div className="h-3 w-28 bg-muted rounded animate-pulse mt-1" />
          </div>
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-4 w-4 bg-muted rounded animate-pulse" />
              <div className="h-3 w-24 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-8 w-16 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Pricing skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-28 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-6 rounded-xl border bg-card">
              <div className="text-center mb-6">
                <div className="h-6 w-20 bg-muted rounded animate-pulse mx-auto" />
                <div className="h-12 w-16 bg-muted rounded animate-pulse mx-auto mt-2" />
              </div>
              <div className="space-y-3 mb-6">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-28 bg-muted rounded animate-pulse" />
                  </div>
                ))}
              </div>
              <div className="h-10 w-full bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
