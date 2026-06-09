import type { ConsentCategory, ConsentProviderId } from "@/lib/consent/types";

/**
 * Mapeamento de provedores → categorias de consentimento.
 * Ao adicionar GA, GTM, Clarity ou TikTok, registre aqui e implemente em apply.ts.
 */
export const CONSENT_PROVIDER_CATEGORIES: Record<ConsentProviderId, ConsentCategory> = {
  "meta-pixel": "marketing",
  "elfsight-reviews": "analytics",
  "google-analytics": "analytics",
  "google-tag-manager": "analytics",
  "microsoft-clarity": "analytics",
  "hotjar": "analytics",
  "tiktok-pixel": "marketing",
};

/** Provedores atualmente implementados no projeto. */
export const ACTIVE_CONSENT_PROVIDERS: ConsentProviderId[] = [
  "meta-pixel",
  "elfsight-reviews",
  "google-analytics",
];

/** Provedores reservados para integração futura — não carregar até implementar. */
export const PLANNED_CONSENT_PROVIDERS: ConsentProviderId[] = [
  "google-tag-manager",
  "microsoft-clarity",
  "hotjar",
  "tiktok-pixel",
];

export function isProviderAllowed(
  providerId: ConsentProviderId,
  categoryEnabled: Record<ConsentCategory, boolean>,
): boolean {
  const category = CONSENT_PROVIDER_CATEGORIES[providerId];
  return categoryEnabled[category] === true;
}
