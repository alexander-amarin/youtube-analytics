export default function Loading() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="h-7 w-40 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded-lg bg-muted" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-4 rounded-lg border bg-card p-6"
          >
            <div className="h-4 w-24 animate-pulse rounded-lg bg-muted" />
            <div className="h-8 w-32 animate-pulse rounded-lg bg-muted" />
          </div>
        ))}
      </div>

      {/* Main content: chart (left) + comments (right) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart */}
        <div className="flex flex-col gap-4 rounded-lg border bg-card p-6 lg:col-span-2">
          <div className="h-5 w-44 animate-pulse rounded-lg bg-muted" />
          <div className="h-72 w-full animate-pulse rounded-lg bg-muted" />
        </div>

        {/* Comments */}
        <div className="flex flex-col gap-4 rounded-lg border bg-card p-6">
          <div className="h-5 w-36 animate-pulse rounded-lg bg-muted" />
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="size-8 shrink-0 animate-pulse rounded-full bg-muted" />
                <div className="flex flex-1 flex-col gap-2">
                  <div className="h-3.5 w-24 animate-pulse rounded-lg bg-muted" />
                  <div className="h-3.5 w-full animate-pulse rounded-lg bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom: videos table */}
      <div className="flex flex-col gap-4 rounded-lg border bg-card p-6">
        <div className="h-5 w-32 animate-pulse rounded-lg bg-muted" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <div className="h-4 w-1/2 animate-pulse rounded-lg bg-muted" />
              <div className="h-4 w-16 animate-pulse rounded-lg bg-muted" />
              <div className="h-4 w-16 animate-pulse rounded-lg bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
