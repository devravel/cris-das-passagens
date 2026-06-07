"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ContentCta } from "@/config/content";
import { trackMetaLeadFromHref } from "@/lib/meta-pixel";
import { cn } from "@/lib/utils";

const defaultButtonClassName =
  "h-11 rounded-lg bg-brand px-6 text-sm text-brand-foreground shadow-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-px hover:bg-brand/90 hover:shadow-md active:translate-y-0";

type ContentCtaButtonProps = {
  cta: ContentCta;
  className?: string;
};

export function ContentCtaButton({ cta, className }: ContentCtaButtonProps) {
  const isExternal = cta.href.startsWith("http");

  if (isExternal) {
    return (
      <Button asChild size="lg" className={cn(defaultButtonClassName, className)}>
        <a
          href={cta.href}
          target="_blank"
          rel="noopener noreferrer"
          className="gap-2"
          onClick={() =>
            trackMetaLeadFromHref(cta.href, {
              source: "content_cta",
              content_name: cta.label,
            })
          }
        >
          {cta.label}
          <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
        </a>
      </Button>
    );
  }

  return (
    <Button asChild size="lg" className={cn(defaultButtonClassName, className)}>
      <Link href={cta.href} className="gap-2">
        {cta.label}
        <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
      </Link>
    </Button>
  );
}
