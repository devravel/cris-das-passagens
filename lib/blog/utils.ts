/** Data compacta para a sidebar de leitura (ex.: 09 Set 2025). */
export function formatBlogSidebarDate(date: Date): string {
  const day = new Intl.DateTimeFormat("pt-BR", { day: "2-digit" }).format(date);
  const month = new Intl.DateTimeFormat("pt-BR", { month: "short" })
    .format(date)
    .replace(/\./g, "")
    .trim();
  const monthLabel = month.charAt(0).toUpperCase() + month.slice(1);
  const year = new Intl.DateTimeFormat("pt-BR", { year: "numeric" }).format(date);

  return `${day} ${monthLabel} ${year}`;
}

const dayInSaoPaulo = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Sao_Paulo",
  dateStyle: "short",
});

/** Só conta como atualização se a edição caiu em outro dia que a publicação. */
export function wasUpdatedAfterPublish(createdAt: Date, updatedAt: Date): boolean {
  return dayInSaoPaulo.format(updatedAt) !== dayInSaoPaulo.format(createdAt);
}

export function normalizeSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const compactNumber = new Intl.NumberFormat("pt-BR", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** Contagem de visualizações no padrão de mercado: 155, 1,2 mil, 3 mi. */
export function formatViewCount(views: number): string {
  return compactNumber.format(views);
}

export function formatViewCountLabel(views: number): string {
  return `${formatViewCount(views)} ${views === 1 ? "visualização" : "visualizações"}`;
}
