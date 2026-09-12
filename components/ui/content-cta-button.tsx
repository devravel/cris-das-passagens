"use client";

import { CtaButton } from "@/components/ui/cta-button";
import type { ContentCta } from "@/config/content";

type ContentCtaButtonProps = {
  cta: ContentCta;
  className?: string;
};

/** CTA de seção alimentado por `ContentCta` — atalho pro CtaButton. */
export function ContentCtaButton({ cta, className }: ContentCtaButtonProps) {
  return (
    <CtaButton
      href={cta.href}
      label={cta.label}
      trackingSource="content_cta"
      className={className}
    />
  );
}
