import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { JsonLdScript } from "@/components/seo/json-ld-script";
import type { BreadcrumbItem } from "@/config/navigation";
import { createBreadcrumbJsonLd } from "@/lib/seo";
import { cn } from "@/lib/utils";

export type PageBreadcrumbProps = {
  items: readonly BreadcrumbItem[];
  className?: string;
};

export function PageBreadcrumb({ items, className }: PageBreadcrumbProps) {
  const lastIndex = items.length - 1;

  return (
    <>
      <JsonLdScript data={createBreadcrumbJsonLd([...items])} />
      <nav aria-label="Breadcrumb" className={cn("mb-6 sm:mb-8", className)}>
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          {items.map((item, index) => {
            const isLast = index === lastIndex;

            return (
              <li key={item.path} className="inline-flex items-center gap-1.5">
                {index > 0 ? (
                  <ChevronRight className="size-3.5 shrink-0 opacity-60" aria-hidden />
                ) : null}
                {isLast ? (
                  <span aria-current="page" className="font-medium text-foreground">
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.path}
                    className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
