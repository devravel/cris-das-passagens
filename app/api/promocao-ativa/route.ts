import { NextResponse } from "next/server";

import { getLivePromotion } from "@/lib/promotion/queries";

/**
 * Promoção no ar pro pop-up e pro item do menu. Buscada no navegador (e não no
 * layout) porque as páginas são estáticas/ISR: assim início e fim valem na hora.
 * A CDN segura 30 s — salvar no painel aparece no site em até um minuto.
 */
export async function GET() {
  try {
    const promotion = await getLivePromotion();

    return NextResponse.json(
      { promotion },
      { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=30" } },
    );
  } catch (error) {
    console.error("[api/promocao-ativa]", error);
    return NextResponse.json({ promotion: null }, { status: 500 });
  }
}
