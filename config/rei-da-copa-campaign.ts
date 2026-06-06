import type { ContentCta } from "@/config/content";

/** Ative durante o período da Copa; desative após a campanha para restaurar o CTA padrão. */
export const REI_DA_COPA_CAMPAIGN_ENABLED = true;

export const reiDaCopaHomeHeroCta = {
  label: "Participe do REI DA COPA 2026",
  href: "/rei-da-copa",
} satisfies ContentCta;

export function getHomeHeroPrimaryCta(defaultCta: ContentCta): ContentCta {
  return REI_DA_COPA_CAMPAIGN_ENABLED ? reiDaCopaHomeHeroCta : defaultCta;
}
