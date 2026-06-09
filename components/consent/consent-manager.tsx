"use client";

import type { ReactNode } from "react";

import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { MetaPixel } from "@/components/analytics/meta-pixel";
import { ConsentProvider } from "@/components/consent/consent-context";
import { ConsentPreferencesModal } from "@/components/consent/consent-preferences-modal";
import { CookieBanner } from "@/components/consent/cookie-banner";

type ConsentRootProps = {
  children: ReactNode;
};

export function ConsentRoot({ children }: ConsentRootProps) {
  return (
    <ConsentProvider>
      {children}
      <GoogleAnalytics />
      <MetaPixel />
      <CookieBanner />
      <ConsentPreferencesModal />
    </ConsentProvider>
  );
}

/** @deprecated Use ConsentRoot — kept for backwards compatibility. */
export const ConsentManager = ConsentRoot;
