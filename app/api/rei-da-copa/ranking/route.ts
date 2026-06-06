import { NextResponse } from "next/server";

import { getReiDaCopaPublicRanking } from "@/lib/rei-da-copa/queries";

export async function GET() {
  try {
    const ranking = await getReiDaCopaPublicRanking();

    return NextResponse.json({
      ok: true,
      data: ranking,
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Não foi possível carregar o ranking agora.",
      },
      { status: 500 },
    );
  }
}
