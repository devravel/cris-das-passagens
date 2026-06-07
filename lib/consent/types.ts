/** Categorias de consentimento — extensível para futuras integrações. */
export type ConsentCategory = "necessary" | "analytics" | "marketing";

export type ConsentPreferences = Record<Exclude<ConsentCategory, "necessary">, boolean>;

export const DEFAULT_REJECTED_PREFERENCES: ConsentPreferences = {
  analytics: false,
  marketing: false,
};

export const DEFAULT_ACCEPTED_PREFERENCES: ConsentPreferences = {
  analytics: true,
  marketing: true,
};

/** Identificadores de provedores de rastreamento — preparado para expansão futura. */
export type ConsentProviderId =
  | "meta-pixel"
  | "elfsight-reviews"
  | "google-analytics"
  | "google-tag-manager"
  | "microsoft-clarity"
  | "tiktok-pixel";

export type StoredConsent = {
  version: number;
  preferences: ConsentPreferences;
  updatedAt: string;
};
