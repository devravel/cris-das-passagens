export default function AdminPromotionsLoading() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-44 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-80 animate-pulse rounded bg-muted/70" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-32 animate-pulse rounded-2xl border border-border/70 bg-card/80" />
        <div className="h-32 animate-pulse rounded-2xl border border-border/70 bg-card/80" />
        <div className="h-32 animate-pulse rounded-2xl border border-border/70 bg-card/80" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="h-72 animate-pulse rounded-2xl border border-border/70 bg-card/80" />
        <div className="h-72 animate-pulse rounded-2xl border border-border/70 bg-card/80" />
        <div className="h-72 animate-pulse rounded-2xl border border-border/70 bg-card/80" />
      </div>
    </section>
  );
}
