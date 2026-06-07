import { contentLinks } from "@/config/content";
import type { PublicCouponPayload } from "@/lib/coupon/schemas";

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
