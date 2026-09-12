"use client";

import { useEffect } from "react";
import Link from "next/link";

import { useConsent } from "@/components/consent/consent-context";
import { CtaButton } from "@/components/ui/cta-button";
import { consentCopy } from "@/config/consent";

export function CookieBanner() {
  const { isBannerVisible, acceptAll, rejectAll } = useConsent();

  useEffect(() => {
    if (!isBannerVisible) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        rejectAll();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isBannerVisible, rejectAll]);

  if (!isBannerVisible) {
    return null;
  }

  const { banner } = consentCopy;

  return (
    <div
      className="cookie-banner-enter fixed inset-x-0 bottom-0 z-[1100] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6"
      role="dialog"
      aria-live="polite"
      aria-label={banner.ariaLabel}
      aria-describedby="cookie-banner-description"
    >
      <div className="mx-auto flex max-w-[1224px] flex-col gap-5 rounded-2xl border border-brand/15 bg-card/95 p-5 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.25)] backdrop-blur-md sm:p-6 md:flex-row md:items-center md:justify-between md:gap-8">
        <p
          id="cookie-banner-description"
          className="text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]"
        >
          {banner.text}{" "}
          <Link
            href="/politica-de-privacidade"
            className="font-medium text-brand underline-offset-2 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            Saiba mais
          </Link>
        </p>

        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <CtaButton
            type="button"
            label={banner.accept}
            arrow={false}
            onClick={acceptAll}
          />
          <button
            type="button"
            onClick={rejectAll}
            className="inline-flex h-12 items-center justify-center rounded-xl border border-brand/30 px-6 text-[0.9375rem] font-semibold text-brand transition-colors hover:bg-brand/5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:h-13 sm:px-7 sm:text-base"
          >
            {banner.reject}
          </button>
        </div>
      </div>
    </div>
  );
}
