import { sendTransactionalEmail } from "@/lib/email/send-email";
import { REI_DA_COPA_INTERNAL_NOTIFICATION_EMAIL } from "@/lib/rei-da-copa/constants";
import type { ReiDaCopaParticipantEntity } from "@/lib/rei-da-copa/types";
import {
  formatParticipantInstagramForDisplay,
  formatParticipantPhoneForDisplay,
} from "@/lib/rei-da-copa/utils";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatParticipantCreatedAt(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(value);
}

function buildParticipantNotificationContent(participant: ReiDaCopaParticipantEntity) {
  const phone = formatParticipantPhoneForDisplay(participant.phone);
  const instagram = formatParticipantInstagramForDisplay(participant.instagram);
  const createdAt = formatParticipantCreatedAt(participant.createdAt);
  const safeName = escapeHtml(participant.name);

  const subject = `Nova inscrição Rei da Copa #${participant.registrationNumber}`;

  const text = [
    "Nova inscrição na campanha Rei da Copa 2026",
    "",
    `Número de inscrição: #${participant.registrationNumber}`,
    `Nome: ${participant.name}`,
    `Telefone: ${phone}`,
    `Instagram: ${instagram}`,
    `Data e hora: ${createdAt} (America/Sao_Paulo)`,
    "",
    "Consulte o painel administrativo em Inscrições para mais detalhes.",
  ].join("\n");

  const html = `
    <h2>Nova inscrição na campanha Rei da Copa 2026</h2>
    <ul>
      <li><strong>Número de inscrição:</strong> #${participant.registrationNumber}</li>
      <li><strong>Nome:</strong> ${safeName}</li>
      <li><strong>Telefone:</strong> ${phone}</li>
      <li><strong>Instagram:</strong> ${instagram}</li>
      <li><strong>Data e hora:</strong> ${createdAt} (America/Sao_Paulo)</li>
    </ul>
    <p>Consulte o painel administrativo em Inscrições para mais detalhes.</p>
  `;

  return { subject, text, html };
}

export async function notifyNewReiDaCopaParticipant(
  participant: ReiDaCopaParticipantEntity,
): Promise<void> {
  try {
    const content = buildParticipantNotificationContent(participant);
    const result = await sendTransactionalEmail({
      to: REI_DA_COPA_INTERNAL_NOTIFICATION_EMAIL,
      ...content,
    });

    if (!result.sent) {
      console.error(
        `Rei da Copa: notificação interna não enviada para ${REI_DA_COPA_INTERNAL_NOTIFICATION_EMAIL}.`,
        result.skippedReason ?? "Motivo não informado.",
      );
    }
  } catch (error) {
    console.error(
      `Rei da Copa: falha ao enviar notificação interna para ${REI_DA_COPA_INTERNAL_NOTIFICATION_EMAIL}.`,
      error,
    );
  }
}
