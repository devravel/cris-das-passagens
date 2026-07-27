"use client";

import { useEffect } from "react";
import Link from "next/link";

import { useConsent } from "@/components/consent/consent-context";
import { consentCopy } from "@/config/consent";

const bannerButtonClassName =
  "inline-flex items-center justify-center border border-black bg-white px-8 py-3.5 text-[14px] font-bold uppercase tracking-[0.5px] text-black transition-colors hover:bg-[rgb(225,225,225)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30";

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
      className="cookie-banner-enter fixed inset-x-0 bottom-0 z-[1100] border-t border-black/10 bg-white p-4 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] pb-[max(1rem,env(safe-area-inset-bottom))]"
      role="dialog"
      aria-live="polite"
      aria-label={banner.ariaLabel}
      aria-describedby="cookie-banner-description"
    >
      <div className="mx-auto flex max-w-[1224px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p
          id="cookie-banner-description"
          className="text-[14px] leading-[1.5] text-black"
        >
          {banner.text}{" "}
          <Link
            href="/politica-de-privacidade"
            className="font-medium underline underline-offset-2 hover:text-black/70 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
          >
            Saiba mais
          </Link>
        </p>

        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={acceptAll}
            className={bannerButtonClassName}
          >
            {banner.accept}
          </button>
          <button
            type="button"
            onClick={rejectAll}
            className={bannerButtonClassName}
          >
            {banner.reject}
          </button>
        </div>
      </div>
    </div>
  );
}
