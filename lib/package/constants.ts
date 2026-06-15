export const PACKAGE_TYPES = [
  "PACKAGE_COMPLETE",
  "FLIGHT",
  "HOTEL",
  "TICKET",
  "CRUISE",
  "CIRCUIT",
] as const;

export const PACKAGE_CATEGORIES = ["NATIONAL", "INTERNATIONAL"] as const;

export const PACKAGE_PRICE_SCOPES = ["PER_PERSON", "COUPLE", "FAMILY"] as const;

export type PackageTypeValue = (typeof PACKAGE_TYPES)[number];
export type PackageCategoryValue = (typeof PACKAGE_CATEGORIES)[number];
export type PackagePriceScopeValue = (typeof PACKAGE_PRICE_SCOPES)[number];

export const PACKAGE_TYPE_LABELS: Record<PackageTypeValue, string> = {
  PACKAGE_COMPLETE: "Pacote completo",
  FLIGHT: "Passagem aérea",
  HOTEL: "Hospedagem",
  TICKET: "Ingresso",
  CRUISE: "Cruzeiro",
  CIRCUIT: "Circuito",
};

export const PACKAGE_TYPE_CARD_LABELS: Record<PackageTypeValue, string> = {
  PACKAGE_COMPLETE: "Pacote Completo",
  FLIGHT: "Aéreo",
  HOTEL: "Hospedagem",
  TICKET: "Ingresso",
  CRUISE: "Cruzeiro",
  CIRCUIT: "Circuito",
};

export const PACKAGE_CATEGORY_LABELS: Record<PackageCategoryValue, string> = {
  NATIONAL: "Nacional",
  INTERNATIONAL: "Internacional",
};

export const PACKAGE_PRICE_SCOPE_LABELS: Record<PackagePriceScopeValue, string> = {
  PER_PERSON: "Por pessoa",
  COUPLE: "Duas pessoas",
  FAMILY: "Família",
};

export const PACKAGE_TYPES_WITH_CATEGORY = new Set<PackageTypeValue>(PACKAGE_TYPES);

export const RECOMMENDED_PACKAGE_IMAGE_SIZE = "1200×900px";
export const PACKAGE_IMAGE_ASPECT_RATIO = "4 / 3";

/** Limite da descrição curta no card (2 linhas com line-clamp-2). */
export const PACKAGE_SHORT_DESCRIPTION_MAX = 280;
export const PACKAGE_SHORT_DESCRIPTION_MIN = 10;
/** Mínimo da descrição completa = limite máximo da descrição curta. */
export const PACKAGE_FULL_DESCRIPTION_MIN = PACKAGE_SHORT_DESCRIPTION_MAX;
export const PACKAGE_FULL_DESCRIPTION_MAX = 10_000;
