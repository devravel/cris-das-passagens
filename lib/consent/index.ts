export {
  applyConsentPreferences,
  isCategoryEnabledInPreferences,
} from "@/lib/consent/apply";
export {
  acceptAllConsentPreferences,
  getConsentStoreServerSnapshot,
  getConsentStoreSnapshot,
  initConsentStore,
  persistConsentPreferences,
  rejectAllConsentPreferences,
  subscribeConsentStore,
  type ConsentStoreState,
} from "@/lib/consent/store";
export {
  ACTIVE_CONSENT_PROVIDERS,
  CONSENT_PROVIDER_CATEGORIES,
  isProviderAllowed,
  PLANNED_CONSENT_PROVIDERS,
} from "@/lib/consent/providers";
export {
  clearStoredConsent,
  CONSENT_STORAGE_KEY,
  CONSENT_STORAGE_VERSION,
  getStoredPreferencesOrDefault,
  hasStoredConsentChoice,
  readStoredConsent,
  writeStoredConsent,
} from "@/lib/consent/storage";
export {
  DEFAULT_ACCEPTED_PREFERENCES,
  DEFAULT_REJECTED_PREFERENCES,
  type ConsentCategory,
  type ConsentPreferences,
  type ConsentProviderId,
  type StoredConsent,
} from "@/lib/consent/types";
