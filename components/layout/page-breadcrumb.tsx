import { JsonLdScript } from "@/components/seo/json-ld-script";
import type { BreadcrumbItem } from "@/config/navigation";
import { createBreadcrumbJsonLd } from "@/lib/seo";

export type PageBreadcrumbProps = {
  items: readonly BreadcrumbItem[];
  className?: string;
};

/**
 * Só o JSON-LD pro Google. A trilha visível ("Início › Roteiros") saiu de
 * todas as páginas em 2026-09-17 a pedido do cliente.
 */
export function PageBreadcrumb({ items }: PageBreadcrumbProps) {
  return <JsonLdScript data={createBreadcrumbJsonLd([...items])} />;
}
