import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";

/** Corpo — Plus Jakarta Sans: legível em texto corrido e nos cards de pacote. */
export const fontSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/**
 * Títulos — Bricolage Grotesque: grotesca com personalidade, pesada e
 * apertada nos títulos grandes. Separa a voz da marca do corpo de texto.
 */
export const fontHeading = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export const fontFamily = {
  sans: "var(--font-jakarta), ui-sans-serif, system-ui, sans-serif",
  heading: "var(--font-bricolage), var(--font-jakarta), ui-sans-serif, system-ui, sans-serif",
} as const;
