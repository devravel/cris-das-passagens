import { NextRequest, NextResponse } from "next/server";

import { sendTransactionalEmail } from "@/lib/email/send-email";
import {
  ITINERARY_QUOTE_EMAIL,
  ITINERARY_QUOTE_RATE_LIMIT,
  buildItineraryQuoteEmail,
  itineraryQuoteSchema,
} from "@/lib/itinerary/quote";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/seo/site-url";

/**
 * Cotação de roteiro → e-mail da equipe. Mesmo desenho da inscrição do Rei da
 * Copa: Zod, rate limit por IP em memória, Resend. Nada é gravado no banco.
 */

// ponytail: rate limit em memória por instância (igual ao Rei da Copa); banco se precisar valer entre instâncias
const requests = new Map<string, number[]>();

function clientIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const recent = (requests.get(ip) ?? []).filter((t) => t > now - ITINERARY_QUOTE_RATE_LIMIT.windowMs);
  if (recent.length >= ITINERARY_QUOTE_RATE_LIMIT.maxRequests) return true;
  requests.set(ip, [...recent, now]);
  return false;
}

export async function POST(request: NextRequest) {
  if (isRateLimited(clientIp(request))) {
    return NextResponse.json(
      { ok: false, error: "Muitos envios seguidos. Aguarde alguns minutos ou chame no WhatsApp." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Dados inválidos." }, { status: 400 });
  }

  const parsed = itineraryQuoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Revise os campos." },
      { status: 400 },
    );
  }

  // Honeypot preenchido: responde ok e não manda nada.
  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  try {
    // Vendedor vem do banco, não do formulário: o cliente nunca vê esse dado.
    const itinerary = await prisma.itinerary.findUnique({
      where: { slug: parsed.data.itinerarySlug },
      select: { seller: true },
    });

    const result = await sendTransactionalEmail({
      to: ITINERARY_QUOTE_EMAIL,
      ...buildItineraryQuoteEmail(parsed.data, getSiteUrl(), itinerary?.seller),
    });

    if (!result.sent) {
      console.error("Cotação de roteiro não enviada:", result.skippedReason);
      return NextResponse.json({ ok: false, error: "Envio indisponível no momento." }, { status: 503 });
    }
  } catch (error) {
    console.error("Cotação de roteiro: falha no envio.", error);
    return NextResponse.json({ ok: false, error: "Não conseguimos enviar agora." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
