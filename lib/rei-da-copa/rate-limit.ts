import type { NextRequest } from "next/server";

import {
  REI_DA_COPA_KEYWORD_RATE_LIMIT,
  REI_DA_COPA_REGISTRATION_RATE_LIMIT,
} from "@/lib/rei-da-copa/constants";

export type ReiDaCopaRateLimitBucket = "registration" | "keyword";

type RateLimitConfig = {
  maxRequests: number;
  windowMs: number;
};

type RateLimitResult =
  | { allowed: true }
  | { allowed: false; message: string; ip: string; bucket: ReiDaCopaRateLimitBucket };

const RATE_LIMITS: Record<ReiDaCopaRateLimitBucket, RateLimitConfig> = {
  registration: REI_DA_COPA_REGISTRATION_RATE_LIMIT,
  keyword: REI_DA_COPA_KEYWORD_RATE_LIMIT,
};

const RATE_LIMIT_MESSAGES: Record<ReiDaCopaRateLimitBucket, string> = {
  registration:
    "Muitas tentativas de inscrição. Aguarde alguns minutos e tente novamente.",
  keyword:
    "Muitos envios de palavra-chave. Aguarde alguns minutos e tente novamente.",
};

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
    const activeTimestamps = timestamps.filter((timestamp) => timestamp > windowStart);

    if (activeTimestamps.length === 0) {
      requestTimestamps.delete(key);
      continue;
    }

    requestTimestamps.set(key, activeTimestamps);
  }
}

export function checkReiDaCopaRateLimit(
  request: NextRequest,
  bucket: ReiDaCopaRateLimitBucket,
): RateLimitResult {
  const { maxRequests, windowMs } = RATE_LIMITS[bucket];
  const ip = getClientIp(request);
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const windowStart = now - windowMs;
  const activeTimestamps = (requestTimestamps.get(key) ?? []).filter(
    (timestamp) => timestamp > windowStart,
  );

  if (activeTimestamps.length >= maxRequests) {
    console.warn(
      `Rei da Copa: rate limit bloqueado (${bucket}) — IP ${ip}, ${activeTimestamps.length}/${maxRequests} em 30 min.`,
    );

    return {
      allowed: false,
      message: RATE_LIMIT_MESSAGES[bucket],
      ip,
      bucket,
    };
  }

  activeTimestamps.push(now);
  requestTimestamps.set(key, activeTimestamps);

  if (requestTimestamps.size > 500) {
    pruneExpiredEntries(windowMs);
  }

  return { allowed: true };
}
