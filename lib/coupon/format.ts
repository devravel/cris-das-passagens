import type { CouponDiscountTypeValue } from "@/lib/coupon/schemas";
import { formatBRL } from "@/lib/money";

export function formatCouponDiscountValue(
  type: CouponDiscountTypeValue,
  value: number,
  customPrize?: string | null,
): string {
  if (type === "CUSTOM") {
    return customPrize?.trim() || "Prêmio personalizado";
  }

  if (type === "PERCENTAGE") {
    const rounded = Number.isInteger(value) ? value : Number(value.toFixed(2));
    return `${rounded}% OFF`;
  }

  return `${formatBRL(value)} OFF`;
}

export function formatCouponDisplayLabel(
  name: string,
  type: CouponDiscountTypeValue,
  value: number,
  customPrize?: string | null,
): string {
  if (type === "CUSTOM") {
    return `${name} (${formatCouponDiscountValue(type, value, customPrize)})`;
  }

  return `${name} (${formatCouponDiscountValue(type, value)})`;
}

export function getCouponDiscountTypeLabel(type: CouponDiscountTypeValue): string {
  switch (type) {
    case "PERCENTAGE":
      return "Percentual (%)";
    case "FIXED":
      return "Valor fixo (R$)";
    case "CUSTOM":
      return "Personalizado";
  }
}
