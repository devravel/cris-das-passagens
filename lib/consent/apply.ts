import { setMetaPixelConsent } from "@/lib/meta-pixel/consent";
import {
  ACTIVE_CONSENT_PROVIDERS,
  isProviderAllowed,
} from "@/lib/consent/providers";
import type { ConsentCategory, ConsentPreferences } from "@/lib/consent/types";

function buildCategoryEnabled(preferences: ConsentPreferences): Record<ConsentCategory, boolean> {
  return {
    necessary: true,
    analytics: preferences.analytics,
    marketing: preferences.marketing,
  };
}

/**
 * Aplica preferências de consentimento aos provedores ativos.
 * Ponto central para futuras integrações (GA, GTM, Clarity, TikTok, CAPI).
 */
export function applyConsentPreferences(preferences: ConsentPreferences): void {
  const categoryEnabled = buildCategoryEnabled(preferences);

  for (const providerId of ACTIVE_CONSENT_PROVIDERS) {
    const allowed = isProviderAllowed(providerId, categoryEnabled);

    switch (providerId) {
      case "meta-pixel":
        setMetaPixelConsent(allowed);
        break;
      // Futuro: google-analytics, google-tag-manager, microsoft-clarity, tiktok-pixel
      default:
        break;
    }
  }
}

/** Verifica se uma categoria opcional está habilitada nas preferências atuais. */
export function isCategoryEnabledInPreferences(
  preferences: ConsentPreferences,
  category: ConsentCategory,
): boolean {
  if (category === "necessary") {
    return true;
  }

  return preferences[category];
}
