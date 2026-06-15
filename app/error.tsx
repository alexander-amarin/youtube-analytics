"use client"

import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex w-full max-w-md flex-col gap-4 rounded-lg border bg-card p-6 text-center">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold tracking-tight">
            Something went wrong
          </h2>
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t load your YouTube dashboard data.
          </p>
        </div>

        {process.env.NODE_ENV === "development" && error.message && (
          <p className="rounded-md bg-muted p-3 text-left text-xs text-muted-foreground">
            {error.message}
          </p>
        )}

        <div className="flex justify-center">
          <Button onClick={() => reset()}>Try again</Button>
        </div>
      </div>
    </div>
  )
}
