import { NextResponse } from "next/server";

import { getCurrentAdminSession } from "@/lib/auth/admin-auth";

export async function GET() {
  const session = await getCurrentAdminSession();

  if (!session) {
    return NextResponse.json(
      { ok: false, authenticated: false, user: null },
      { status: 401 },
    );
  }

  return NextResponse.json({
    ok: true,
    authenticated: true,
    user: {
      id: session.adminId,
      email: session.email,
    },
  });
}
