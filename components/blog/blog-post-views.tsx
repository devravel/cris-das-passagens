import { Eye } from "lucide-react";

import { formatViewCount, formatViewCountLabel } from "@/lib/blog/utils";
import { cn } from "@/lib/utils";

type BlogPostViewsProps = {
  views: number;
  /** Mostra "visualizações" por extenso; sem isso fica só ícone + número. */
  withLabel?: boolean;
  className?: string;
};

export function BlogPostViews({ views, withLabel = false, className }: BlogPostViewsProps) {
  const label = formatViewCountLabel(views);

  return (
    <span
      className={cn("inline-flex items-center gap-1.5 whitespace-nowrap", className)}
      title={label}
      aria-label={label}
    >
      <Eye className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
      <span aria-hidden>{withLabel ? label : formatViewCount(views)}</span>
    </span>
  );
}
