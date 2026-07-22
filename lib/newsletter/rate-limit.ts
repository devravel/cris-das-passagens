import type { NextRequest } from "next/server";

import { NEWSLETTER_SUBSCRIPTION_RATE_LIMIT } from "@/lib/newsletter/constants";

type RateLimitResult =
  | { allowed: true }
  | { allowed: false; message: string; ip: string };

const requestTimestamps = new Map<string, number[]>();

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function pruneExpiredEntries(windowMs: number) {
  const windowStart = Date.now() - windowMs;

  for (const [key, timestamps] of requestTimestamps.entries()) {
    const activeTimestamps = timestamps.filter(
      (timestamp) => timestamp > windowStart,
    );

    if (activeTimestamps.length === 0) {
      requestTimestamps.delete(key);
      continue;
    }

    requestTimestamps.set(key, activeTimestamps);
  }
}

export function checkNewsletterRateLimit(
  request: NextRequest,
): RateLimitResult {
  const { maxRequests, windowMs } = NEWSLETTER_SUBSCRIPTION_RATE_LIMIT;
  const ip = getClientIp(request);
  const key = `newsletter:${ip}`;
  const now = Date.now();
  const windowStart = now - windowMs;
  const activeTimestamps = (requestTimestamps.get(key) ?? []).filter(
    (timestamp) => timestamp > windowStart,
  );

  if (activeTimestamps.length >= maxRequests) {
    console.warn(
      `Newsletter: rate limit bloqueado — IP ${ip}, ${activeTimestamps.length}/${maxRequests} em 30 min.`,
    );

    return {
      allowed: false,
      message:
        "Muitas tentativas de inscrição. Aguarde alguns minutos e tente novamente.",
      ip,
    };
  }

  activeTimestamps.push(now);
  requestTimestamps.set(key, activeTimestamps);

  if (requestTimestamps.size > 500) {
    pruneExpiredEntries(windowMs);
  }

  return { allowed: true };
}
