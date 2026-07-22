import { updateTag } from "next/cache";
import { NextResponse } from "next/server";

import { PUBLIC_PACKAGE_CACHE_TAGS } from "@/lib/package/cache-tags";
import { syncExpiredPackageSchedules } from "@/lib/package/schedule";

/**
 * Sincroniza pacotes com duração expirada (desativa e invalida cache).
 * Pode ser chamado por cron (Vercel/GitHub Actions) com Authorization: Bearer CRON_SECRET.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  const authHeader = request.headers.get("authorization");

  if (cronSecret) {
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ ok: false, message: "Não autorizado." }, { status: 401 });
    }
  }

  try {
    const deactivated = await syncExpiredPackageSchedules();

    if (deactivated > 0) {
      for (const tag of PUBLIC_PACKAGE_CACHE_TAGS) {
        updateTag(tag);
      }
    }

    return NextResponse.json({
      ok: true,
      deactivated,
    });
  } catch (error) {
    console.error("[cron/package-schedule]", error);
    return NextResponse.json(
      { ok: false, message: "Falha ao sincronizar duração dos pacotes." },
      { status: 500 },
    );
  }
}
