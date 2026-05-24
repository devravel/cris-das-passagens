import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export const ADMIN_AUTH_COOKIE = "admin_session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8h

type AdminSessionPayload = JWTPayload & {
  sub: string;
  email: string;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("Missing env: JWT_SECRET");
  }

  return new TextEncoder().encode(secret);
}

export async function createAdminSessionToken(payload: {
  adminId: string;
  email: string;
}) {
  return new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(payload.adminId)
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_SESSION_MAX_AGE_SECONDS}s`)
    .sign(getJwtSecret());
}

export async function verifyAdminSessionToken(token: string) {
  try {
    const { payload } = await jwtVerify<AdminSessionPayload>(
      token,
      getJwtSecret(),
      {
        algorithms: ["HS256"],
      },
    );

    if (!payload.sub || !payload.email) {
      return null;
    }

    return {
      adminId: payload.sub,
      email: payload.email,
    };
  } catch {
    return null;
  }
}

export function getAdminSessionCookieConfig() {
  return {
    name: ADMIN_AUTH_COOKIE,
    options: {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    },
  };
}
