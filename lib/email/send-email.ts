type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

type SendEmailResult = {
  sent: boolean;
  skippedReason?: string;
};

function getResendApiKey() {
  return process.env.RESEND_API_KEY?.trim() || null;
}

function getResendFromAddress() {
  return (
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Cris das Passagens <onboarding@resend.dev>"
  );
}

export async function sendTransactionalEmail(
  input: SendEmailInput,
): Promise<SendEmailResult> {
  const apiKey = getResendApiKey();

  if (!apiKey) {
    return {
      sent: false,
      skippedReason: "RESEND_API_KEY não configurada.",
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getResendFromAddress(),
      to: [input.to],
      subject: input.subject,
      text: input.text,
      html: input.html,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Falha ao enviar e-mail (${response.status}): ${errorBody}`);
  }

  return { sent: true };
}
