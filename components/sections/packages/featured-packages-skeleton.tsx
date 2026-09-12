import { Section } from "@/components/layout/section";

function PackageCardSkeleton() {
  return (
    <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden rounded-xl bg-card/80 ring-1 ring-border/60">
      <div className="aspect-[4/5] animate-pulse bg-muted/50" />
      <div className="flex flex-1 flex-col space-y-2 p-4">
        <div className="h-3 w-1/3 animate-pulse rounded bg-muted/60" />
        <div className="h-5 w-4/5 animate-pulse rounded bg-muted/70" />
        <div className="mt-auto h-7 w-2/5 animate-pulse rounded bg-muted/70" />
      </div>
    </div>
  );
}

export function FeaturedPackagesSkeleton() {
  return (
    <Section background="default" spacing="compact" aria-busy="true">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-3">
          <div className="h-3 w-32 animate-pulse rounded bg-muted/70" />
          <div className="h-10 w-72 animate-pulse rounded-lg bg-muted" />
          <div className="h-4 w-full max-w-lg animate-pulse rounded bg-muted/60" />
        </div>
        <div className="h-16 w-full animate-pulse rounded-xl bg-muted/50 lg:w-[22rem]" />
      </div>
      <div className="mt-10 flex items-stretch gap-3">
        {[0, 1, 2, 3].map((card) => (
          <PackageCardSkeleton key={card} />
        ))}
      </div>
    </Section>
  );
}
