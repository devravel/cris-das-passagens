/** Cores oficiais da marca — fonte única para uso fora do CSS (metadata, OG, etc.). */
export const brandColors = {
  primary: "#345ba7",
  primaryForeground: "#ffffff",
  /** Azul claro — hovers, tags, detalhes (referência visual). */
  primaryLight: "#5a7bc4",
  /** Fundos alternados — off-white azulado da referência. */
  soft: "#f4f9f9",
  softAlt: "#f0f7f9",
  /** CTA final / blocos de conversão escuros. */
  navy: "#0a1628",
  /** Conversão WhatsApp — accent de ação (referência). */
  whatsapp: "#25D366",
  /** Textos secundários e neutros. */
  secondary: "#666666",
} as const;

/** Valores OKLCH espelhados em `app/globals.css`. */
export const brandOklch = {
  primary: "oklch(0.483 0.130 262.2)",
  primaryForeground: "oklch(0.985 0 0)",
  primaryLight: "oklch(0.591 0.119 264.6)",
  soft: "oklch(0.978 0.005 197.1)",
  softAlt: "oklch(0.971 0.008 216.6)",
  whatsapp: "oklch(0.761 0.201 149.7)",
  navy: "oklch(0.18 0.04 264)",
} as const;

export const themeConfig = {
  radius: "1rem",
  colors: brandColors,
  oklch: brandOklch,
  /** Plus Jakarta Sans — referência premium (legível, headings fortes). */
  fontFamily: "Plus Jakarta Sans",
} as const;

export type ThemeConfig = typeof themeConfig;
