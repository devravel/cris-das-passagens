import type { NextRequest } from "next/server";

export const ADMIN_LOGIN_MAX_FAILED_ATTEMPTS = 5;
export const ADMIN_LOGIN_LOCKOUT_WINDOW_MS = 15 * 60 * 1000;

export const ADMIN_LOGIN_INVALID_CREDENTIALS_MESSAGE =
  "E-mail ou senha inválidos.";

export const ADMIN_LOGIN_RATE_LIMIT_MESSAGE =
  "Muitas tentativas de login. Aguarde alguns minutos e tente novamente.";

const failedAttemptTimestamps = new Map<string, number[]>();

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function pruneExpiredEntries(windowMs: number) {
  const windowStart = Date.now() - windowMs;

  for (const [key, timestamps] of failedAttemptTimestamps.entries()) {
    const activeTimestamps = timestamps.filter((timestamp) => timestamp > windowStart);

    if (activeTimestamps.length === 0) {
      failedAttemptTimestamps.delete(key);
      continue;
    }

    failedAttemptTimestamps.set(key, activeTimestamps);
  }
}

function getRateLimitKey(request: NextRequest): string {
  return `admin-login:${getClientIp(request)}`;
}

function getActiveFailureTimestamps(request: NextRequest, now = Date.now()): number[] {
  const key = getRateLimitKey(request);
  const windowStart = now - ADMIN_LOGIN_LOCKOUT_WINDOW_MS;

  return (failedAttemptTimestamps.get(key) ?? []).filter(
    (timestamp) => timestamp > windowStart,
  );
}

export function checkAdminLoginRateLimit(request: NextRequest): {
  allowed: true;
} | {
  allowed: false;
  message: string;
  ip: string;
} {
  const ip = getClientIp(request);
  const activeTimestamps = getActiveFailureTimestamps(request);

  if (activeTimestamps.length >= ADMIN_LOGIN_MAX_FAILED_ATTEMPTS) {
    console.warn(
      `Admin login: rate limit bloqueado — IP ${ip}, ${activeTimestamps.length}/${ADMIN_LOGIN_MAX_FAILED_ATTEMPTS} falhas em 15 min.`,
    );

    return {
      allowed: false,
      message: ADMIN_LOGIN_RATE_LIMIT_MESSAGE,
      ip,
    };
  }

  return { allowed: true };
}

export function recordAdminLoginFailure(request: NextRequest): void {
  const ip = getClientIp(request);
  const key = getRateLimitKey(request);
  const now = Date.now();
  const activeTimestamps = getActiveFailureTimestamps(request, now);

  activeTimestamps.push(now);
  failedAttemptTimestamps.set(key, activeTimestamps);

  if (failedAttemptTimestamps.size > 500) {
    pruneExpiredEntries(ADMIN_LOGIN_LOCKOUT_WINDOW_MS);
  }

  console.warn(
    `Admin login: tentativa inválida — IP ${ip}, ${activeTimestamps.length}/${ADMIN_LOGIN_MAX_FAILED_ATTEMPTS} falhas em 15 min.`,
  );
}

export function clearAdminLoginRateLimit(request: NextRequest): void {
  failedAttemptTimestamps.delete(getRateLimitKey(request));
}
