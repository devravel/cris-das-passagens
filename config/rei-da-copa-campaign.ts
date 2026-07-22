import type { ContentCta } from "@/config/content";

/**
 * Ative durante o período da Copa; desative após a campanha para ocultar
 * links/CTAs públicos e restaurar o CTA padrão da hero.
 * Código, rotas admin e dados permanecem disponíveis para consulta.
 */
export const REI_DA_COPA_CAMPAIGN_ENABLED = false;

export const reiDaCopaHomeHeroCta = {
  label: "Participe do REI DA COPA 2026",
  href: "/rei-da-copa",
} satisfies ContentCta;

export function getHomeHeroPrimaryCta(defaultCta: ContentCta): ContentCta {
  return REI_DA_COPA_CAMPAIGN_ENABLED ? reiDaCopaHomeHeroCta : defaultCta;
}
