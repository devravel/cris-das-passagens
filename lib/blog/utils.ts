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
