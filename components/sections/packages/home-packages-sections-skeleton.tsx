import { Section } from "@/components/layout/section";

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

            <div className="flex gap-3 overflow-hidden sm:gap-4">
              {[0, 1, 2].map((card) => (
                <div
                  key={card}
                  className="w-[min(100%,240px)] shrink-0 overflow-hidden rounded-2xl border border-border/70 bg-card/80 sm:w-[250px]"
                >
                  <div className="aspect-[4/3] animate-pulse bg-muted/50" />
                  <div className="space-y-2 p-4">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-muted/70" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-muted/60" />
                    <div className="h-6 w-1/3 animate-pulse rounded bg-muted/70" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>
      ))}
    </>
  );
}
