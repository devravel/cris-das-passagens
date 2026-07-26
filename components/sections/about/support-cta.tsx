"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ContentCta } from "@/config/content";
import { trackMetaLeadFromHref, type MetaLeadSource } from "@/lib/meta-pixel";
import { cn } from "@/lib/utils";
import { whatsappSolidButtonClassName } from "@/lib/whatsapp-styles";

type SupportCtaProps = {
  cta: ContentCta;
  trackingSource?: MetaLeadSource;
};

export function SupportCta({
  cta,
  trackingSource = "support_whatsapp",
}: SupportCtaProps) {
  const isExternal = cta.href.startsWith("http");
  const buttonClassName =
    "h-12 rounded-lg px-8 text-base font-semibold shadow-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-px hover:shadow-md active:translate-y-0 sm:h-14 sm:px-10 sm:text-lg";

  if (isExternal) {
    return (
      <Button
        asChild
        size="lg"
        className={cn(buttonClassName, whatsappSolidButtonClassName)}
      >
        <a
          href={cta.href}
          target="_blank"
          rel="noopener noreferrer"
          className="gap-2"
          onClick={() =>
            trackMetaLeadFromHref(cta.href, {
              source: trackingSource,
              content_name: cta.label,
            })
          }
        >
          {cta.label}
          <ArrowRight className="size-5" strokeWidth={1.75} aria-hidden />
        </a>
      </Button>
    );
  }

  return (
    <Button
      asChild
      size="lg"
      className={cn(buttonClassName, whatsappSolidButtonClassName)}
    >
      <Link href={cta.href} className="gap-2">
        {cta.label}
        <ArrowRight className="size-5" strokeWidth={1.75} aria-hidden />
      </Link>
    </Button>
  );
}
