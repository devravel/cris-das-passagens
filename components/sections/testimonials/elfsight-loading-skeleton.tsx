import { cn } from "@/lib/utils";

type ElfsightLoadingSkeletonProps = {
  className?: string;
};

export function ElfsightLoadingSkeleton({ className }: ElfsightLoadingSkeletonProps) {
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-2xl border border-border/50 bg-background/80 p-4 ring-1 ring-border/40 sm:p-6",
        className,
      )}
      aria-hidden
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 animate-pulse rounded-full bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-28 animate-pulse rounded-md bg-muted" />
            <div className="h-3 w-20 animate-pulse rounded-md bg-muted/80" />
          </div>
        </div>
        <div className="h-10 w-full animate-pulse rounded-lg bg-muted sm:w-44" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="rounded-xl border border-border/40 bg-muted/20 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="size-9 animate-pulse rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 animate-pulse rounded-md bg-muted" />
                <div className="h-3 w-16 animate-pulse rounded-md bg-muted/80" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-3 w-full animate-pulse rounded-md bg-muted/70" />
              <div className="h-3 w-5/6 animate-pulse rounded-md bg-muted/70" />
              <div className="h-3 w-2/3 animate-pulse rounded-md bg-muted/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
