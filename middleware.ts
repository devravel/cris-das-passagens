import { NextRequest, NextResponse } from "next/server";

import {
  ADMIN_AUTH_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/auth/admin-jwt";
import {
  adminAuthPaths,
  buildAdminLoginRedirect,
} from "@/lib/auth/admin-redirect";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_AUTH_COOKIE)?.value;
  const session = token ? await verifyAdminSessionToken(token) : null;
  const isLoginPage = pathname === adminAuthPaths.login;

  if (!session && !isLoginPage) {
    const loginUrl = new URL(buildAdminLoginRedirect(pathname), request.url);

    return NextResponse.redirect(loginUrl);
  }

  if (session && isLoginPage) {
    const dashboardUrl = new URL(adminAuthPaths.dashboard, request.url);

    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
