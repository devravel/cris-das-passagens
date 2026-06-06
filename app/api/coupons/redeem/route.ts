import { NextRequest, NextResponse } from "next/server";

import { couponService } from "@/lib/coupon/coupon.service";
import { couponRedeemSchema } from "@/lib/coupon/schemas";

const COUPON_REDEEM_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const COUPON_REDEEM_RATE_LIMIT_MAX_REQUESTS = 5;
const couponRedeemAttempts = new Map<string, number[]>();

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function isCouponRedeemAllowed(request: NextRequest) {
  const ip = getClientIp(request);
  const key = `redeem:${ip}`;
  const now = Date.now();
  const windowStart = now - COUPON_REDEEM_RATE_LIMIT_WINDOW_MS;
  const activeTimestamps = (couponRedeemAttempts.get(key) ?? []).filter(
    (timestamp) => timestamp > windowStart,
  );

  if (activeTimestamps.length >= COUPON_REDEEM_RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  activeTimestamps.push(now);
  couponRedeemAttempts.set(key, activeTimestamps);

  return true;
}

export async function POST(request: NextRequest) {
  try {
    if (!isCouponRedeemAllowed(request)) {
      return NextResponse.json(
        {
          success: false,
          message: "Muitas tentativas de uso do cupom. Aguarde um pouco e tente novamente.",
        },
        { status: 429 },
      );
    }

    const body = await request.json();
    const parsed = couponRedeemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Dados inválidos para utilizar o cupom.",
        },
        { status: 400 },
      );
    }

    const result = await couponService.redeemByCode(
      parsed.data.code,
      parsed.data.packageTitle,
    );

    if (!result.success) {
      return NextResponse.json(result, { status: 409 });
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Não foi possível utilizar o cupom agora. Tente novamente.",
      },
      { status: 500 },
    );
  }
}
