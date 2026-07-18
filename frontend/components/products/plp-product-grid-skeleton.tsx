'use client';

export function PlpProductGridSkeleton({
  count = 8,
  columns = 'default',
}: {
  count?: number;
  columns?: 'default' | 'comfortable' | 'list';
}) {
  if (columns === 'list') {
    return (
      <div className="flex flex-col gap-6 sm:gap-8" aria-busy="true" aria-label="Loading products">
        {Array.from({ length: Math.min(count, 4) }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col border-b border-border/40 pb-6 md:flex-row md:gap-4"
          >
            <div className="aspect-[4/5] w-full animate-pulse bg-muted/50 md:aspect-[3/4] md:w-40 md:shrink-0" />
            <div className="flex flex-1 flex-col justify-center space-y-2 py-3.5 md:py-2">
              <div className="h-3 w-[55%] max-w-full animate-pulse bg-muted/40" />
              <div className="h-3 w-[22%] max-w-full animate-pulse bg-muted/30" />
              <div className="hidden h-3 w-[70%] max-w-full animate-pulse bg-muted/25 md:block" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const gridClass =
    columns === 'comfortable'
      ? 'grid grid-cols-2 gap-x-2 gap-y-8 sm:gap-x-5 sm:gap-y-10 md:grid-cols-3 lg:grid-cols-3 [&>*]:min-w-0'
      : 'grid grid-cols-2 gap-x-2 gap-y-8 sm:gap-x-5 sm:gap-y-10 md:grid-cols-3 lg:grid-cols-4 [&>*]:min-w-0';

  return (
    <div className={gridClass} aria-busy="true" aria-label="Loading products">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex min-w-0 flex-col bg-transparent">
          <div className="aspect-[3/4] w-full animate-pulse bg-muted/50" />
          <div className="mt-3 space-y-2">
            <div className="h-3 w-[70%] max-w-full animate-pulse bg-muted/40" />
            <div className="h-3 w-[32%] max-w-full animate-pulse bg-muted/30" />
          </div>
        </div>
      ))}
    </div>
  );
}
