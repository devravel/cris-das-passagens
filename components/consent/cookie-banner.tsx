"use client";

import Link from "next/link";

import { useConsent } from "@/components/consent/consent-context";
import { Button } from "@/components/ui/button";
import { consentCopy } from "@/config/consent";
import { cn } from "@/lib/utils";

export function CookieBanner() {
  const { isBannerVisible, acceptAll, rejectAll, openPreferences } = useConsent();

  if (!isBannerVisible) {
    return null;
  }

  const { banner } = consentCopy;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-description"
      aria-modal="false"
      className={cn(
        "fixed inset-x-0 bottom-0 z-[60] border-t border-border/80 bg-background/95 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm",
        "supports-backdrop-filter:bg-background/90",
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 sm:py-5">
        <div className="min-w-0 flex-1 space-y-1">
          <p
            id="cookie-banner-title"
            className="font-heading text-sm font-semibold text-foreground sm:text-base"
          >
            {banner.ariaLabel}
          </p>
          <p
            id="cookie-banner-description"
            className="text-sm leading-relaxed text-muted-foreground"
          >
            {banner.text}{" "}
            <Link
              href="/politica-de-privacidade"
              className="font-medium text-brand-navy underline-offset-2 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              Saiba mais
            </Link>
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={rejectAll}
          >
            {banner.reject}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={openPreferences}
          >
            {banner.configure}
          </Button>
          <Button
            type="button"
            size="sm"
            className="w-full bg-brand-navy text-white hover:bg-brand-navy/90 sm:w-auto"
            onClick={acceptAll}
          >
            {banner.accept}
          </Button>
        </div>
      </div>
    </div>
  );
}
