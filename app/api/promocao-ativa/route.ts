import { NextResponse } from "next/server";

import { getLivePromotion } from "@/lib/promotion/queries";

/**
 * Promoção no ar pro pop-up e pro item do menu. Buscada no navegador (e não no
 * layout) porque as páginas são estáticas/ISR: assim início e fim valem na hora.
 * A CDN segura 1 min — salvar no painel aparece no site em até um minuto.
 */
export async function GET() {
  try {
    const promotion = await getLivePromotion();

    return NextResponse.json(
      { promotion },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
    );
  } catch (error) {
    console.error("[api/promocao-ativa]", error);
    return NextResponse.json({ promotion: null }, { status: 500 });
  }
}
