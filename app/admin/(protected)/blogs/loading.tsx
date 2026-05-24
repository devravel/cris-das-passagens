export default function AdminBlogsLoading() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded bg-muted/70" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-32 animate-pulse rounded-2xl border border-border/70 bg-card/80" />
        <div className="h-32 animate-pulse rounded-2xl border border-border/70 bg-card/80" />
        <div className="h-32 animate-pulse rounded-2xl border border-border/70 bg-card/80 md:col-span-2" />
      </div>

      <div className="h-80 animate-pulse rounded-2xl border border-border/70 bg-card/80" />
    </section>
  );
}
