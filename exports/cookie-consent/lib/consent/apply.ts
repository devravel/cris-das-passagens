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
 * No projeto de origem chama Meta Pixel / GA — aqui fica como ponto de extensão.
 * Conecte seus scripts (gtag, fbq, etc.) nos cases abaixo.
 */
export function applyConsentPreferences(preferences: ConsentPreferences): void {
  const categoryEnabled = buildCategoryEnabled(preferences);

  for (const providerId of ACTIVE_CONSENT_PROVIDERS) {
    const allowed = isProviderAllowed(providerId, categoryEnabled);

    switch (providerId) {
      case "meta-pixel":
        // setMetaPixelConsent(allowed)
        break;
      case "google-analytics":
        // setGoogleAnalyticsConsent(allowed)
        break;
      case "elfsight-reviews":
        // carregar widget só se allowed
        break;
      default:
        break;
    }

    void allowed;
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
