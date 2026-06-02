import { Section } from "@/components/layout/section";
import { cn } from "@/lib/utils";

function PackageListingCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-2xl bg-card/80 ring-1 ring-border/60",
        className,
      )}
    >
      <div className="aspect-[4/3] animate-pulse bg-muted/50" />
      <div className="flex flex-1 flex-col space-y-2.5 p-4 sm:p-5">
        <div className="h-3 w-1/3 animate-pulse rounded bg-muted/60" />
        <div className="h-6 w-4/5 animate-pulse rounded bg-muted/70" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted/60" />
        <div className="space-y-2 border-t border-border/50 pt-3">
          <div className="h-3 w-full animate-pulse rounded bg-muted/50" />
          <div className="h-3 w-11/12 animate-pulse rounded bg-muted/50" />
          <div className="h-3 w-10/12 animate-pulse rounded bg-muted/50" />
        </div>
        <div className="mt-auto space-y-1.5 pt-2">
          <div className="h-3 w-1/4 animate-pulse rounded bg-muted/50" />
          <div className="h-8 w-2/5 animate-pulse rounded bg-muted/70" />
        </div>
      </div>
      <div className="border-t border-border/70 p-4 sm:p-5">
        <div className="h-10 animate-pulse rounded-lg bg-muted/60" />
      </div>
      <div className="border-t border-border/70 px-4 py-3 sm:px-5">
        <div className="mx-auto h-3 w-3/4 animate-pulse rounded bg-muted/50" />
      </div>
    </div>
  );
}

export default function PacotesLoading() {
  return (
    <Section spacing="page" background="default" bordered aria-busy="true" aria-label="Carregando pacotes">
      <div className="mb-6 sm:mb-8">
        <div className="h-9 w-48 animate-pulse rounded-lg bg-muted/70" />
      </div>

      <header className="mb-10 max-w-3xl space-y-3 sm:mb-12 lg:mb-14">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-muted sm:h-12 sm:w-80" />
        <div className="h-4 w-full max-w-xl animate-pulse rounded bg-muted/70" />
        <div className="h-4 w-full max-w-lg animate-pulse rounded bg-muted/60" />
      </header>

      <div className="space-y-14 sm:space-y-16 lg:space-y-20">
        {[0, 1, 2].map((section) => (
          <div
            key={section}
            className={section > 0 ? "border-t border-border/50 pt-14 sm:pt-16 lg:pt-20" : undefined}
          >
            <div className="mb-6 space-y-3 sm:mb-8">
              <div className="h-8 w-48 animate-pulse rounded-lg bg-muted sm:w-56" />
              <div className="h-4 w-full max-w-2xl animate-pulse rounded bg-muted/70" />
            </div>

            <div className="mb-6 h-10 w-full animate-pulse rounded-full bg-muted/60 sm:mb-8 sm:w-56" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:justify-items-center sm:gap-5 lg:grid-cols-3 lg:justify-items-center lg:gap-6 xl:grid-cols-4 xl:justify-items-stretch xl:gap-6">
              {[0, 1, 2, 3].map((card) => (
                <PackageListingCardSkeleton
                  key={card}
                  className="w-full max-w-none sm:max-w-[288px] xl:max-w-none"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
