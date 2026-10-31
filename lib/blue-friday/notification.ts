import type { BlueFridayRequestRow } from "@/lib/blue-friday/format";
import { sendTransactionalEmail } from "@/lib/email/send-email";
import { escapeHtml, ITINERARY_QUOTE_EMAIL } from "@/lib/itinerary/quote";

/** Mesma caixa das cotações de roteiro (pedido do Cris, 30/10). */
export const BLUE_FRIDAY_REQUEST_EMAIL = ITINERARY_QUOTE_EMAIL;

/** Mesmos textos da tabela do painel e do CSV (`toBlueFridayRequestRow`). */
function buildBlueFridayRequestEmail(row: BlueFridayRequestRow) {
  const rows: [string, string][] = [
    ["Passaporte", row.passport],
    ["Nome", row.name],
    ["WhatsApp", row.phone],
    ["Destino", row.destination],
    ["Saída de", row.departureCity],
    ["Quando", row.when],
    ["Passageiros", row.passengers],
    ["Orçamento", row.budget],
    ["Pagamento", row.payment],
    ["Compraria por", row.targetPrice],
    ["Cupom do influenciador", row.influencer],
    ["Recebido em", `${row.createdAt} (Brasília)`],
  ];

  const subject = `Blue Friday: ${row.destination} — ${row.name} (Passaporte ${row.passport})`;

  const text = [
    "Novo pedido da Blue Friday pelo site",
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    `Chamar no WhatsApp: ${row.whatsappUrl}`,
    "Todos os pedidos: painel → Blue Friday → Pedidos.",
  ].join("\n");

  const html = `
    <h2>Novo pedido da Blue Friday pelo site</h2>
    <table cellpadding="6" style="border-collapse:collapse">
      ${rows
        .map(
          ([label, value]) =>
            `<tr><td style="color:#555"><strong>${escapeHtml(label)}</strong></td><td>${escapeHtml(value)}</td></tr>`,
        )
        .join("")}
    </table>
    <p><a href="${escapeHtml(row.whatsappUrl)}">Chamar no WhatsApp</a></p>
    <p style="color:#555">Todos os pedidos: painel → Blue Friday → Pedidos.</p>
  `;

  return { subject, text, html };
}

/** Falha no e-mail não derruba o cadastro: o pedido já está no banco e no painel. */
export async function notifyBlueFridayRequest(row: BlueFridayRequestRow): Promise<void> {
  try {
    const result = await sendTransactionalEmail({ to: BLUE_FRIDAY_REQUEST_EMAIL, ...buildBlueFridayRequestEmail(row) });

    if (!result.sent) {
      console.error("[Blue Friday] E-mail do pedido não enviado:", result.skippedReason ?? "motivo não informado");
    }
  } catch (error) {
    console.error("[Blue Friday] Falha ao enviar o e-mail do pedido:", error);
  }
}
