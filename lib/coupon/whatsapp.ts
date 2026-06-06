import { contentLinks } from "@/config/content";
import type { PublicCouponPayload } from "@/lib/coupon/schemas";

export function buildPackageWhatsAppMessage(
  packageTitle: string,
  coupon?: Pick<PublicCouponPayload, "name" | "discountLabel"> | null,
): string {
  if (!coupon) {
    return `Olá, vim do site e tenho interesse no pacote: ${packageTitle}`;
  }

  return [
    "Olá, vim do site e tenho interesse no pacote:",
    "",
    packageTitle,
    "",
    "Cupom de desconto aplicado:",
    `${coupon.name} (${coupon.discountLabel})`,
  ].join("\n");
}

export function getPackageWhatsAppUrl(
  packageTitle: string,
  coupon?: Pick<PublicCouponPayload, "name" | "discountLabel"> | null,
): string {
  const message = encodeURIComponent(buildPackageWhatsAppMessage(packageTitle, coupon));
  return `${contentLinks.whatsapp}?text=${message}`;
}
