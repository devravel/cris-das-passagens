import { NextResponse } from "next/server";

import { getAdminSessionCookieConfig } from "@/lib/auth/admin-jwt";

export async function POST() {
  const cookieConfig = getAdminSessionCookieConfig();
  const response = NextResponse.json({ ok: true });

  response.cookies.set(cookieConfig.name, "", {
    ...cookieConfig.options,
    maxAge: 0,
  });

  return response;
}
