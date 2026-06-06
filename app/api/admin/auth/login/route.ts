import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  createAdminSessionToken,
  getAdminSessionCookieConfig,
} from "@/lib/auth/admin-jwt";
import {
  ADMIN_LOGIN_INVALID_CREDENTIALS_MESSAGE,
  ADMIN_LOGIN_RATE_LIMIT_MESSAGE,
  checkAdminLoginRateLimit,
  clearAdminLoginRateLimit,
  recordAdminLoginFailure,
} from "@/lib/auth/admin-login-rate-limit";
import { runFailedLoginTimingWork } from "@/lib/auth/admin-login-timing";
import { getSafeAdminRedirectTarget } from "@/lib/auth/admin-redirect";
import { validateAdminCredentials } from "@/lib/auth/admin-service";

const loginSchema = z.object({
  email: z.email("Informe um e-mail válido."),
  password: z
    .string()
    .min(8, "A senha deve ter no mínimo 8 caracteres.")
    .max(128, "A senha deve ter no máximo 128 caracteres."),
  redirectTo: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsedData = loginSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsedData.error.issues[0]?.message ?? "Dados inválidos.",
        },
        { status: 400 },
      );
    }

    const { email, password, redirectTo: redirectToInput } = parsedData.data;
    const rateLimit = checkAdminLoginRateLimit(request);

    if (!rateLimit.allowed) {
      await runFailedLoginTimingWork(email, password);

      return NextResponse.json(
        {
          ok: false,
          error: ADMIN_LOGIN_RATE_LIMIT_MESSAGE,
        },
        { status: 429 },
      );
    }

    const credentials = await validateAdminCredentials(email, password);

    if (!credentials) {
      recordAdminLoginFailure(request);

      return NextResponse.json(
        {
          ok: false,
          error: ADMIN_LOGIN_INVALID_CREDENTIALS_MESSAGE,
        },
        { status: 401 },
      );
    }

    const token = await createAdminSessionToken({
      adminId: credentials.id,
      email: credentials.email,
    });

    const cookieConfig = getAdminSessionCookieConfig();
    const redirectTo = getSafeAdminRedirectTarget(redirectToInput ?? null);

    const response = NextResponse.json({
      ok: true,
      redirectTo,
    });

    response.cookies.set(cookieConfig.name, token, cookieConfig.options);
    clearAdminLoginRateLimit(request);

    return response;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Não foi possível autenticar agora. Tente novamente.",
      },
      { status: 500 },
    );
  }
}
