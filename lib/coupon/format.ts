import type { CouponDiscountTypeValue } from "@/lib/coupon/schemas";

export function formatCouponDiscountValue(
  type: CouponDiscountTypeValue,
  value: number,
): string {
  if (type === "PERCENTAGE") {
    const rounded = Number.isInteger(value) ? value : Number(value.toFixed(2));
    return `${rounded}% OFF`;
  }

  const formatted = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);

  return `${formatted} OFF`;
}

export function formatCouponDisplayLabel(
  name: string,
  type: CouponDiscountTypeValue,
  value: number,
): string {
  return `${name} (${formatCouponDiscountValue(type, value)})`;
}
