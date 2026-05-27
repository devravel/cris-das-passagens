import { Section } from "@/components/layout/section";

function PackageCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={`flex h-full flex-col overflow-hidden rounded-2xl bg-card/80 ring-1 ring-border/60 ${className ?? ""}`}
    >
      <div className="aspect-[4/3] animate-pulse bg-muted/50" />
      <div className="flex flex-1 flex-col space-y-2 p-4">
        <div className="h-3 w-1/3 animate-pulse rounded bg-muted/60" />
        <div className="h-5 w-4/5 animate-pulse rounded bg-muted/70" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted/60" />
        <div className="mt-auto space-y-1.5 pt-2">
          <div className="h-3 w-1/4 animate-pulse rounded bg-muted/50" />
          <div className="h-7 w-2/5 animate-pulse rounded bg-muted/70" />
        </div>
      </div>
      <div className="space-y-2 border-t border-border/70 p-4">
        <div className="h-9 animate-pulse rounded-lg bg-muted/60" />
        <div className="h-9 animate-pulse rounded-lg bg-muted/50" />
      </div>
    </div>
  );
}

export function HomePackagesSectionsSkeleton() {
  return (
    <>
      {[0, 1, 2].map((section) => (
        <Section key={section} spacing="compact" background="default" bordered aria-busy="true">
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,34%)_minmax(0,1fr)] lg:gap-10 xl:gap-14">
            <div className="space-y-5 sm:space-y-6">
              <div className="size-11 animate-pulse rounded-2xl bg-muted/60" />
              <div className="space-y-3">
                <div className="h-9 w-full max-w-md animate-pulse rounded-lg bg-muted sm:h-11" />
                <div className="h-4 w-40 animate-pulse rounded bg-muted/70" />
              </div>
            </div>

            <div className="flex items-stretch gap-3 overflow-hidden sm:gap-4">
              {[0, 1, 2].map((card) => (
                <PackageCardSkeleton
                  key={card}
                  className="w-[min(100%,240px)] shrink-0 sm:w-[250px]"
                />
              ))}
            </div>
          </div>
        </Section>
      ))}
    </>
  );
}
