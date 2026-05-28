import { cn } from "@/lib/utils";

/** Altura fixa do corpo do card — título e resumo truncados com reticências. */
export const blogCardBodyClassName = "flex min-h-0 flex-1 flex-col p-4 sm:p-6";

export const blogCardTitleClassName = cn(
  "line-clamp-2 font-heading font-semibold leading-snug tracking-tight text-foreground",
);

export const blogCardExcerptClassName = cn(
  "mt-3 line-clamp-4 text-sm leading-relaxed text-muted-foreground sm:text-base",
);

export const blogCardCtaClassName =
  "mt-4 inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand transition-colors duration-200 hover:text-brand/90";
