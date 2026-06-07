"use client";

import { useEffect } from "react";
import Link from "next/link";

import { useConsent } from "@/components/consent/consent-context";
import { Button } from "@/components/ui/button";
import { consentCopy } from "@/config/consent";
import { cn } from "@/lib/utils";

const rejectButtonClassName = cn(
  "h-10 min-w-[7.5rem] cursor-pointer px-5 text-sm font-semibold",
  "border-border/90 bg-background text-foreground shadow-sm",
  "transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out",
  "hover:border-brand/40 hover:bg-muted hover:text-foreground hover:shadow-[0_4px_14px_-6px_rgba(52,91,167,0.18)]",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100",
  "w-full sm:w-auto",
);

const acceptButtonClassName = cn(
  "h-10 min-w-[7.5rem] cursor-pointer px-5 text-sm font-semibold",
  "bg-brand-navy text-white shadow-sm",
  "transition-[background-color,box-shadow,transform] duration-200 ease-out",
  "hover:bg-brand-navy/90 hover:shadow-[0_4px_14px_-6px_rgba(52,91,167,0.35)]",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-brand/50",
  "active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100",
  "w-full sm:w-auto",
);

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
    <>
      <div
        role="presentation"
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-[59] bg-foreground/25 backdrop-blur-sm",
          "supports-backdrop-filter:bg-foreground/20",
          "motion-reduce:backdrop-blur-none",
        )}
        onClick={rejectAll}
      />

      <div
        role="dialog"
        aria-labelledby="cookie-banner-title"
        aria-describedby="cookie-banner-description"
        aria-modal="true"
        className={cn(
          "fixed inset-x-0 bottom-0 z-[60]",
          "border-t border-border/80 bg-background/95 ring-1 ring-border/50",
          "shadow-[0_-8px_30px_-14px_rgba(52,91,167,0.16)] backdrop-blur-sm",
          "supports-backdrop-filter:bg-background/90",
          "pb-[max(0px,env(safe-area-inset-bottom))]",
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

          <div className="flex w-full shrink-0 flex-col gap-2.5 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
            <Button
              type="button"
              variant="outline"
              className={rejectButtonClassName}
              onClick={rejectAll}
            >
              {banner.reject}
            </Button>
            <Button type="button" className={acceptButtonClassName} onClick={acceptAll}>
              {banner.accept}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
