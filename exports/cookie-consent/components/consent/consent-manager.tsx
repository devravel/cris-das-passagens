"use client";

import type { ReactNode } from "react";

import { ConsentProvider } from "@/components/consent/consent-context";
import { ConsentPreferencesModal } from "@/components/consent/consent-preferences-modal";
import { CookieBanner } from "@/components/consent/cookie-banner";

type ConsentRootProps = {
  children: ReactNode;
};

/** Root portátil — sem GoogleAnalytics / MetaPixel do projeto original. */
export function ConsentRoot({ children }: ConsentRootProps) {
  return (
    <ConsentProvider>
      {children}
      <CookieBanner />
      <ConsentPreferencesModal />
    </ConsentProvider>
  );
}

/** @deprecated Use ConsentRoot — kept for backwards compatibility. */
export const ConsentManager = ConsentRoot;
