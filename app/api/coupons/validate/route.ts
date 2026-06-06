import { NextRequest, NextResponse } from "next/server";

import { couponService } from "@/lib/coupon/coupon.service";
import { couponValidateSchema } from "@/lib/coupon/schemas";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = couponValidateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Cupom não encontrado ou inválido.",
        },
        { status: 400 },
      );
    }

    const result = await couponService.validateByCode(parsed.data.code);

    if (!result.success) {
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Não foi possível validar o cupom agora. Tente novamente.",
      },
      { status: 500 },
    );
  }
}
