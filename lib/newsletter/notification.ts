import { sendTransactionalEmail } from "@/lib/email/send-email";
import { NEWSLETTER_INTERNAL_NOTIFICATION_EMAIL } from "@/lib/newsletter/constants";
import type { NewsletterSubscriberEntity } from "@/lib/newsletter/types";
import { formatParticipantPhoneForDisplay } from "@/lib/rei-da-copa/utils";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatSubscriberCreatedAt(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(value);
}

function buildSubscriberNotificationContent(
  subscriber: NewsletterSubscriberEntity,
) {
  const phone = formatParticipantPhoneForDisplay(subscriber.phone);
  const createdAt = formatSubscriberCreatedAt(subscriber.createdAt);
  const safeName = escapeHtml(subscriber.name);
  const safeEmail = escapeHtml(subscriber.email);

  const subject = `Nova inscrição Newsletter #${subscriber.registrationNumber}`;

  const text = [
    "Nova inscrição na newsletter da Cris das Passagens",
    "",
    `Número de inscrição: #${subscriber.registrationNumber}`,
    `Nome: ${subscriber.name}`,
    `E-mail: ${subscriber.email}`,
    `Telefone: ${phone}`,
    `Data e hora: ${createdAt} (America/Sao_Paulo)`,
    "",
    "Consulte o painel administrativo em Newsletter para mais detalhes.",
  ].join("\n");

  const html = `
    <h2>Nova inscrição na newsletter</h2>
    <ul>
      <li><strong>Número de inscrição:</strong> #${subscriber.registrationNumber}</li>
      <li><strong>Nome:</strong> ${safeName}</li>
      <li><strong>E-mail:</strong> ${safeEmail}</li>
      <li><strong>Telefone:</strong> ${phone}</li>
      <li><strong>Data e hora:</strong> ${createdAt} (America/Sao_Paulo)</li>
    </ul>
    <p>Consulte o painel administrativo em Newsletter para mais detalhes.</p>
  `;

  return { subject, text, html };
}

export async function notifyNewNewsletterSubscriber(
  subscriber: NewsletterSubscriberEntity,
): Promise<void> {
  try {
    const content = buildSubscriberNotificationContent(subscriber);
    const result = await sendTransactionalEmail({
      to: NEWSLETTER_INTERNAL_NOTIFICATION_EMAIL,
      ...content,
    });

    if (!result.sent) {
      console.error(
        `Newsletter: notificação interna não enviada para ${NEWSLETTER_INTERNAL_NOTIFICATION_EMAIL}.`,
        result.skippedReason ?? "Motivo não informado.",
      );
    }
  } catch (error) {
    console.error(
      `Newsletter: falha ao enviar notificação interna para ${NEWSLETTER_INTERNAL_NOTIFICATION_EMAIL}.`,
      error,
    );
  }
}
