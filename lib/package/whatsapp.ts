import type { PublicPackage } from "@/lib/package/queries";
import { getPackageWhatsAppUrl as buildPackageWhatsAppUrl } from "@/lib/coupon/whatsapp";

export function getPackageWhatsAppUrl(pkg: PublicPackage): string {
  return buildPackageWhatsAppUrl(pkg.title || pkg.destination);
}
