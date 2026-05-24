import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  createAdminSessionToken,
  getAdminSessionCookieConfig,
} from "@/lib/auth/admin-jwt";
import { getSafeAdminRedirectTarget } from "@/lib/auth/admin-redirect";
import { validateAdminCredentials } from "@/lib/auth/admin-service";

const loginSchema = z.object({
  email: z.email("Informe um e-mail valido."),
  password: z
    .string()
    .min(8, "A senha deve ter no minimo 8 caracteres.")
    .max(128, "A senha deve ter no maximo 128 caracteres."),
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
          error: parsedData.error.issues[0]?.message ?? "Dados invalidos.",
        },
        { status: 400 },
      );
    }

    const credentials = await validateAdminCredentials(
      parsedData.data.email,
      parsedData.data.password,
    );

    if (!credentials) {
      return NextResponse.json(
        {
          ok: false,
          error: "E-mail ou senha invalidos.",
        },
        { status: 401 },
      );
    }

    const token = await createAdminSessionToken({
      adminId: credentials.id,
      email: credentials.email,
    });

    const cookieConfig = getAdminSessionCookieConfig();
    const redirectTo = getSafeAdminRedirectTarget(
      parsedData.data.redirectTo ?? null,
    );

    const response = NextResponse.json({
      ok: true,
      redirectTo,
    });

    response.cookies.set(cookieConfig.name, token, cookieConfig.options);

    return response;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Nao foi possivel autenticar agora. Tente novamente.",
      },
      { status: 500 },
    );
  }
}
