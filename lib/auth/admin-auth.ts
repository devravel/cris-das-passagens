import { cookies } from "next/headers";
import { ADMIN_AUTH_COOKIE, verifyAdminSessionToken } from "@/lib/auth/admin-jwt";
export {
  ADMIN_AUTH_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSessionToken,
  getAdminSessionCookieConfig,
  verifyAdminSessionToken,
} from "@/lib/auth/admin-jwt";

export async function getCurrentAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_COOKIE)?.value;

  if (!token) {
    return null;
  }

  return verifyAdminSessionToken(token);
}
