import type { PackageTypeValue } from "@/lib/package/constants";

export const PACKAGE_DEPARTURE_CITY_PRESETS = {
  SAO_PAULO: "São Paulo, SP",
  PORTO_ALEGRE: "Porto Alegre, RS",
} as const;

export const DEFAULT_PACKAGE_DEPARTURE_CITY = PACKAGE_DEPARTURE_CITY_PRESETS.SAO_PAULO;

export type DepartureCityPresetId = keyof typeof PACKAGE_DEPARTURE_CITY_PRESETS | "OTHER";

export function packageTypeShowsDepartureCity(type: PackageTypeValue): boolean {
  return type !== "HOTEL" && type !== "TICKET" && type !== "CIRCUIT";
}

export function resolveDepartureCityPreset(value: string): DepartureCityPresetId {
  const normalized = value.trim();

  if (
    normalized === PACKAGE_DEPARTURE_CITY_PRESETS.SAO_PAULO ||
    normalized === "São Paulo"
  ) {
    return "SAO_PAULO";
  }

  if (normalized === PACKAGE_DEPARTURE_CITY_PRESETS.PORTO_ALEGRE) {
    return "PORTO_ALEGRE";
  }

  return "OTHER";
}

export function departureCityFromPreset(preset: DepartureCityPresetId): string {
  if (preset === "SAO_PAULO") {
    return PACKAGE_DEPARTURE_CITY_PRESETS.SAO_PAULO;
  }

  if (preset === "PORTO_ALEGRE") {
    return PACKAGE_DEPARTURE_CITY_PRESETS.PORTO_ALEGRE;
  }

  return "";
}
