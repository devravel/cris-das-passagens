"use client";

import { useConsent } from "@/components/consent/consent-context";
import { consentCopy } from "@/config/consent";
import { cn } from "@/lib/utils";

type CookiePreferencesLinkProps = {
  className?: string;
};

export function CookiePreferencesLink({ className }: CookiePreferencesLinkProps) {
  const { openPreferences } = useConsent();

  return (
    <button
      type="button"
      onClick={openPreferences}
      className={cn(
        "text-[0.8125rem] font-medium text-white/70 transition-colors duration-200 hover:text-white",
        "focus-visible:rounded-md focus-visible:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
        className,
      )}
    >
      {consentCopy.footerLink}
    </button>
  );
}
