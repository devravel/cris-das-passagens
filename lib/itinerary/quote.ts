import { z } from "zod";

/** Pra onde vai o pedido de cotação de roteiro. */
export const ITINERARY_QUOTE_EMAIL = "cotacoescrisdaspassagens@gmail.com";

/** Mesmo teto da inscrição do Rei da Copa: 3 envios por IP a cada 30 min. */
export const ITINERARY_QUOTE_RATE_LIMIT = { maxRequests: 3, windowMs: 30 * 60 * 1000 } as const;

export const MAX_PEOPLE = 7;

export const itineraryQuoteSchema = z.object({
  itineraryTitle: z.string().trim().min(1).max(160),
  itinerarySlug: z.string().trim().min(1).max(160),
  name: z.string().trim().min(2, "Informe seu nome.").max(120),
  phone: z
    .string()
    .trim()
    .min(8, "Informe seu WhatsApp.")
    .max(30)
    .regex(/^[\d\s()+-]+$/, "Só números no WhatsApp."),
  email: z.string().trim().email("E-mail inválido.").max(160).optional().or(z.literal("")),
  hotel: z.string().trim().max(160).optional(),
  origin: z.string().trim().max(120).optional(),
  travelDate: z.string().trim().max(80).optional(),
  adults: z.number().int().min(1).max(MAX_PEOPLE),
  children: z.number().int().min(0).max(MAX_PEOPLE),
  babies: z.number().int().min(0).max(MAX_PEOPLE),
  extras: z.array(z.string().trim().max(60)).max(10),
  message: z.string().trim().max(2000).optional(),
  /** Honeypot: humano não vê, bot preenche. */
  website: z.string().max(200).optional(),
});

export type ItineraryQuoteInput = z.infer<typeof itineraryQuoteSchema>;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildItineraryQuoteEmail(
  input: ItineraryQuoteInput,
  siteUrl: string,
  /** Vendedor dono do roteiro (cadastro do painel): só existe aqui, nunca no site. */
  seller?: string | null,
) {
  const receivedAt = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date());
  const pageUrl = `${siteUrl}/roteiros/${input.itinerarySlug}`;

  const rows: [string, string][] = [
    ["Roteiro", input.itineraryTitle],
    ["Vendedor", seller?.trim() || "não informado"],
    ["Nome", input.name],
    ["WhatsApp", input.phone],
    ["E-mail", input.email || "não informado"],
    ["Hotel / tarifa", input.hotel || "não escolhido"],
    ["Saída de", input.origin || "não informado"],
    ["Data aproximada", input.travelDate || "não informada"],
    ["Passageiros", `${input.adults} adulto(s), ${input.children} criança(s), ${input.babies} bebê(s)`],
    ["Também quer", input.extras.length ? input.extras.join(", ") : "—"],
    ["Mensagem", input.message || "—"],
    ["Recebido em", `${receivedAt} (Brasília)`],
  ];

  const subject = seller?.trim()
    ? `Cotação de roteiro: ${input.itineraryTitle} — ${input.name} — ${seller.trim()}`
    : `Cotação de roteiro: ${input.itineraryTitle} — ${input.name}`;
  const text = [
    "Novo pedido de cotação pelo site",
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    `Página: ${pageUrl}`,
  ].join("\n");
  const html = `
    <h2>Novo pedido de cotação pelo site</h2>
    <table cellpadding="6" style="border-collapse:collapse">
      ${rows
        .map(
          ([label, value]) =>
            `<tr><td style="color:#555"><strong>${escapeHtml(label)}</strong></td><td>${escapeHtml(value).replaceAll("\n", "<br>")}</td></tr>`,
        )
        .join("")}
    </table>
    <p><a href="${escapeHtml(pageUrl)}">${escapeHtml(pageUrl)}</a></p>
  `;

  return { subject, text, html };
}
