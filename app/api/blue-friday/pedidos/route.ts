import { NextRequest, NextResponse } from "next/server";

import { BLUE_FRIDAY_CAMPAIGN_ENABLED, blueFridayCampaign } from "@/config/blue-friday-campaign";
import { createBlueFridayRequest, getBlueFridayRequestSchema } from "@/lib/blue-friday/service";
import { isCampaignOpen } from "@/lib/rei-da-copa/campaign-window";

/**
 * Cadastro Blue Friday → passaporte + pedido no banco. Mesmo desenho de
 * /api/roteiros/cotacao: Zod, honeypot, rate limit por IP em memória.
 */

const RATE_LIMIT = { maxRequests: 10, windowMs: 30 * 60 * 1000 } as const;

// ponytail: rate limit em memória por instância (igual roteiros/Rei da Copa); banco se precisar valer entre instâncias
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
  const recent = (requests.get(ip) ?? []).filter((t) => t > now - RATE_LIMIT.windowMs);
  if (recent.length >= RATE_LIMIT.maxRequests) return true;
  requests.set(ip, [...recent, now]);
  return false;
}

export async function POST(request: NextRequest) {
  const isOpen =
    BLUE_FRIDAY_CAMPAIGN_ENABLED &&
    isCampaignOpen({
      startDate: blueFridayCampaign.signupStartDate,
      endDate: blueFridayCampaign.signupEndDate,
    });

  if (!isOpen) {
    return NextResponse.json({ ok: false, error: "As inscrições da Blue Friday não estão abertas agora." }, { status: 403 });
  }

  if (isRateLimited(clientIp(request))) {
    return NextResponse.json(
      { ok: false, error: "Muitos envios seguidos. Aguarde alguns minutos e tente de novo." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Dados inválidos." }, { status: 400 });
  }

  const parsed = getBlueFridayRequestSchema().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Revise os campos." },
      { status: 400 },
    );
  }

  // Honeypot preenchido: responde como sucesso e não grava.
  if (parsed.data.website) {
    return NextResponse.json({ ok: true, passportNumber: 0 }, { status: 201 });
  }

  try {
    const { passportNumber } = await createBlueFridayRequest(parsed.data);
    return NextResponse.json({ ok: true, passportNumber }, { status: 201 });
  } catch (error) {
    console.error("[Blue Friday] Falha ao salvar o pedido:", error);
    return NextResponse.json({ ok: false, error: "Não conseguimos salvar agora. Tente de novo." }, { status: 500 });
  }
}
