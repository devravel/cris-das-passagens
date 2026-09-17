import { contentLinks } from "@/config/content";

export type ItineraryQuote = {
  hotel?: string;
  origin?: string;
  adults: number;
  children: number;
  babies: number;
  travelDate?: string;
  /** Produtos à parte marcados (Guia virtual, Roteiro personalizado...). */
  extras?: string[];
  message?: string;
};

export function buildItineraryWhatsAppMessage(title: string, quote?: ItineraryQuote): string {
  const lines = [`Olá, venho do site e tenho interesse no roteiro: ${title}.`];

  if (quote) {
    if (quote.hotel) lines.push(`Hotel/tarifa: ${quote.hotel}`);
    if (quote.origin) lines.push(`Saída de: ${quote.origin}`);
    lines.push(
      `Passageiros: ${quote.adults} adulto(s), ${quote.children} criança(s), ${quote.babies} bebê(s)`,
    );
    if (quote.travelDate) lines.push(`Data aproximada: ${quote.travelDate}`);
    if (quote.extras?.length) lines.push(`Também tenho interesse em: ${quote.extras.join(", ")}`);
    if (quote.message) lines.push("", quote.message);
  }

  return lines.join("\n");
}

export function getItineraryWhatsAppUrl(title: string, quote?: ItineraryQuote): string {
  return `${contentLinks.whatsapp}?text=${encodeURIComponent(buildItineraryWhatsAppMessage(title, quote))}`;
}
