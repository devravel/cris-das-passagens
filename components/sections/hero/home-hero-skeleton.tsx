import { Section } from "@/components/layout/section";
import { cn } from "@/lib/utils";

function PackageCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-full min-w-0 flex-col overflow-hidden rounded-xl bg-card/80 ring-1 ring-border/60",
        className,
      )}
    >
      <div className="aspect-[5/3] animate-pulse bg-muted/50" />
      <div className="flex flex-1 flex-col space-y-2 p-4">
        <div className="h-3 w-1/3 animate-pulse rounded bg-muted/60" />
        <div className="h-5 w-4/5 animate-pulse rounded bg-muted/70" />
        <div className="mt-auto h-7 w-2/5 animate-pulse rounded bg-muted/70" />
      </div>
    </div>
  );
}

export function HomeHeroSkeleton() {
  return (
    <Section
      background="soft"
      spacing="none"
      bordered
      className="overflow-hidden pb-12 pt-5 sm:pb-20 sm:pt-10 lg:pb-24 lg:pt-12"
      aria-busy="true"
    >
      <div className="grid items-start gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-16">
        <div className="flex flex-col gap-6 sm:gap-7">
          <div className="mx-auto h-12 w-full max-w-lg animate-pulse rounded-lg bg-muted sm:mx-0 sm:h-14" />
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-muted/70" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-muted/60" />
          </div>
          <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
            {[0, 1, 2, 3].map((tag) => (
              <div key={tag} className="h-7 w-24 animate-pulse rounded-full bg-muted/60" />
            ))}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="h-11 w-full animate-pulse rounded-lg bg-muted sm:w-44" />
            <div className="h-11 w-full animate-pulse rounded-lg bg-muted/70 sm:w-48" />
          </div>
        </div>

        <div className="min-w-0 space-y-4 sm:space-y-5">
          <div className="h-7 w-56 animate-pulse rounded bg-muted/70" />
          <div className="flex items-stretch gap-3 sm:gap-3.5">
            {[0, 1].map((card) => (
              <PackageCardSkeleton key={card} className="w-1/2" />
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
