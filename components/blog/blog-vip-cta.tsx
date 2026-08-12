import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { content } from "@/config/content";
import { cn } from "@/lib/utils";

type BlogVipCtaProps = {
  className?: string;
};

export function BlogVipCta({ className }: BlogVipCtaProps) {
  const vipCta = content.blogPost.vipCta;

  return (
    <aside
      className={cn(
        "overflow-hidden rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/10 via-background to-brand-soft/20 p-6 shadow-sm sm:p-8",
        className,
      )}
      aria-label="Grupo VIP de dicas"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
        {vipCta.eyebrow}
      </p>
      <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-foreground">
        {vipCta.headline}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
        {vipCta.description}
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        {vipCta.groups.map((group) => (
          <Button
            key={group.href}
            asChild
            size="lg"
            className="h-11 rounded-lg bg-brand px-6 text-sm text-brand-foreground shadow-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-px hover:bg-brand/90 hover:shadow-md"
          >
            <Link href={group.href} target="_blank" rel="noopener noreferrer" className="gap-2">
              {group.label}
              <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
            </Link>
          </Button>
        ))}
      </div>
    </aside>
  );
}
