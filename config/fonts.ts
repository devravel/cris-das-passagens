import { Plus_Jakarta_Sans } from "next/font/google";

/**
 * Tipografia principal — sans humanista premium, próxima da referência
 * (clínica/turismo moderno: legível, acolhedora, headings fortes).
 */
export const fontSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const fontFamily = {
  sans: "var(--font-jakarta), ui-sans-serif, system-ui, sans-serif",
  heading: "var(--font-jakarta), ui-sans-serif, system-ui, sans-serif",
} as const;
