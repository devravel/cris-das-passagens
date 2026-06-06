import { NextRequest, NextResponse } from "next/server";

import { couponService } from "@/lib/coupon/coupon.service";
import { couponRedeemSchema } from "@/lib/coupon/schemas";

export async function POST(request: NextRequest) {
  try {
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
