import { prisma } from "@/lib/prisma";
import { formatCouponDiscountValue } from "@/lib/coupon/format";
import type { PublicCouponPayload } from "@/lib/coupon/schemas";

type CouponRecord = {
  id: string;
  code: string;
  name: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: { toNumber?: () => number } | number;
  isActive: boolean;
  maxUses: number | null;
  currentUses: number;
  expiresAt: Date | null;
};

function decimalToNumber(value: { toNumber?: () => number } | number) {
  if (typeof value === "number") {
    return value;
  }

  return value.toNumber?.() ?? Number(value);
}

function toPublicCoupon(coupon: CouponRecord): PublicCouponPayload {
  const discountValue = decimalToNumber(coupon.discountValue);

  return {
    code: coupon.code,
    name: coupon.name,
    discountType: coupon.discountType,
    discountValue,
    discountLabel: formatCouponDiscountValue(coupon.discountType, discountValue),
  };
}

function getValidationMessage(coupon: CouponRecord | null): string | null {
  if (!coupon) {
    return "Cupom não encontrado ou inválido.";
  }

  if (!coupon.isActive) {
    return "Cupom não encontrado ou inválido.";
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return "Cupom não encontrado ou inválido.";
  }

  if (coupon.maxUses != null && coupon.currentUses >= coupon.maxUses) {
    return "Cupom não encontrado ou inválido.";
  }

  return null;
}

export const couponService = {
  async validateByCode(code: string) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    const message = getValidationMessage(coupon);

    if (message || !coupon) {
      return {
        success: false as const,
        message: message ?? "Cupom não encontrado ou inválido.",
      };
    }

    return {
      success: true as const,
      coupon: toPublicCoupon(coupon),
    };
  },

  async redeemByCode(code: string, packageTitle: string) {
    const normalizedCode = code.toUpperCase();

    return prisma.$transaction(async (tx) => {
      const coupon = await tx.coupon.findUnique({
        where: { code: normalizedCode },
      });

      const message = getValidationMessage(coupon);

      if (message || !coupon) {
        return {
          success: false as const,
          message: "Este cupom não está mais disponível. Selecione um pacote sem cupom ou tente outro código.",
        };
      }

      if (coupon.maxUses != null && coupon.currentUses >= coupon.maxUses) {
        return {
          success: false as const,
          message: "Este cupom não está mais disponível. Selecione um pacote sem cupom ou tente outro código.",
        };
      }

      const updated = await tx.coupon.update({
        where: { id: coupon.id },
        data: {
          currentUses: { increment: 1 },
        },
      });

      await tx.couponRedemption.create({
        data: {
          couponId: coupon.id,
          packageTitle,
        },
      });

      if (updated.maxUses != null && updated.currentUses > updated.maxUses) {
        throw new Error("Coupon usage limit exceeded.");
      }

      return {
        success: true as const,
        coupon: toPublicCoupon(updated),
      };
    });
  },
};
