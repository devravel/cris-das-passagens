import { contentLinks } from "@/config/content";
import type { PublicCouponPayload } from "@/lib/coupon/schemas";

export const QUOTE_WHATSAPP_MESSAGE =
  "Olá, venho do site e gostaria de fazer uma cotação.";

export function getQuoteWhatsAppUrl(): string {
  const message = encodeURIComponent(QUOTE_WHATSAPP_MESSAGE);
  return `${contentLinks.whatsapp}?text=${message}`;
}

export function buildPackageWhatsAppMessage(
  packageTitle: string,
  coupon?: Pick<PublicCouponPayload, "name" | "discountLabel"> | null,
): string {
  const baseMessage = `Olá, venho do site e tenho interesse no pacote: ${packageTitle}.`;

  if (!coupon) {
    return baseMessage;
  }

  return `${baseMessage} CUPOM DE DESCONTO APLICADO: ${coupon.name} (${coupon.discountLabel}).`;
}

export function getPackageWhatsAppUrl(
  packageTitle: string,
  coupon?: Pick<PublicCouponPayload, "name" | "discountLabel"> | null,
): string {
  const message = encodeURIComponent(buildPackageWhatsAppMessage(packageTitle, coupon));
  return `${contentLinks.whatsapp}?text=${message}`;
}
