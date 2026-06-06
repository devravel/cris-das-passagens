import { prisma } from "@/lib/prisma";
import { formatCouponDiscountValue } from "@/lib/coupon/format";
import type { CouponDiscountTypeValue } from "@/lib/coupon/schemas";

function decimalToNumber(value: { toNumber?: () => number } | number) {
  if (typeof value === "number") {
    return value;
  }

  return value.toNumber?.() ?? Number(value);
}

export type AdminCouponListItem = {
  id: string;
  code: string;
  name: string;
  discountType: CouponDiscountTypeValue;
  discountValue: number;
  discountLabel: string;
  isActive: boolean;
  maxUses: number | null;
  currentUses: number;
  expiresAt: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

function mapAdminCoupon(coupon: {
  id: string;
  code: string;
  name: string;
  discountType: CouponDiscountTypeValue;
  discountValue: { toNumber?: () => number } | number;
  isActive: boolean;
  maxUses: number | null;
  currentUses: number;
  expiresAt: Date | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}): AdminCouponListItem {
  const discountValue = decimalToNumber(coupon.discountValue);

  return {
    id: coupon.id,
    code: coupon.code,
    name: coupon.name,
    discountType: coupon.discountType,
    discountValue,
    discountLabel: formatCouponDiscountValue(coupon.discountType, discountValue),
    isActive: coupon.isActive,
    maxUses: coupon.maxUses,
    currentUses: coupon.currentUses,
    expiresAt: coupon.expiresAt?.toISOString() ?? null,
    description: coupon.description,
    createdAt: coupon.createdAt.toISOString(),
    updatedAt: coupon.updatedAt.toISOString(),
  };
}

export async function getAdminCoupons(): Promise<AdminCouponListItem[]> {
  const coupons = await prisma.coupon.findMany({
    orderBy: [{ createdAt: "desc" }],
  });

  return coupons.map(mapAdminCoupon);
}

export async function getAdminCouponById(id: string): Promise<AdminCouponListItem | null> {
  const coupon = await prisma.coupon.findUnique({
    where: { id },
  });

  if (!coupon) {
    return null;
  }

  return mapAdminCoupon(coupon);
}
