import { contentLinks } from "@/config/content";
import type { PublicCouponPayload } from "@/lib/coupon/schemas";

export const QUOTE_WHATSAPP_MESSAGE =
  "Olá, venho do site e gostaria de fazer uma cotação.";

export function getQuoteWhatsAppUrl(): string {
  const message = encodeURIComponent(QUOTE_WHATSAPP_MESSAGE);
  return `${contentLinks.whatsapp}?text=${message}`;
}

type WhatsAppCoupon = Pick<
  PublicCouponPayload,
  "name" | "discountLabel" | "discountType"
>;

export function buildPackageWhatsAppMessage(
  packageTitle: string,
  coupon?: WhatsAppCoupon | null,
): string {
  const baseMessage = `Olá, venho do site e tenho interesse no pacote: ${packageTitle}.`;

  if (!coupon) {
    return baseMessage;
  }

  if (coupon.discountType === "CUSTOM") {
    return `${baseMessage} CUPOM APLICADO: ${coupon.name} — ${coupon.discountLabel}.`;
  }

  return `${baseMessage} CUPOM DE DESCONTO APLICADO: ${coupon.name} (${coupon.discountLabel}).`;
}

export function getPackageWhatsAppUrl(
  packageTitle: string,
  coupon?: WhatsAppCoupon | null,
): string {
  const message = encodeURIComponent(buildPackageWhatsAppMessage(packageTitle, coupon));
  return `${contentLinks.whatsapp}?text=${message}`;
}
