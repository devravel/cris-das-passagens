import { Section } from "@/components/layout/section";

export default function PacotesLoading() {
  return (
    <Section spacing="default" background="default" bordered aria-busy="true" aria-label="Carregando pacotes">
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
          <div key={section} className={section > 0 ? "border-t border-border/50 pt-14 sm:pt-16 lg:pt-20" : undefined}>
            <div className="mb-6 space-y-3 sm:mb-8">
              <div className="h-8 w-48 animate-pulse rounded-lg bg-muted sm:w-56" />
              <div className="h-4 w-full max-w-2xl animate-pulse rounded bg-muted/70" />
            </div>

            <div className="mb-6 h-10 w-56 animate-pulse rounded-full bg-muted/60 sm:mb-8" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
              {[0, 1, 2, 3].map((card) => (
                <div
                  key={card}
                  className="overflow-hidden rounded-2xl border border-border/70 bg-card/80"
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
        ))}
      </div>
    </Section>
  );
}
