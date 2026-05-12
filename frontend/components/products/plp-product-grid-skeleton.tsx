'use client';

export function PlpProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-lg border border-border bg-card"
        >
          <div className="aspect-square animate-pulse bg-muted" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-[80%] max-w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-[35%] max-w-full animate-pulse rounded bg-muted" />
            <div className="h-9 w-full animate-pulse rounded-md bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
