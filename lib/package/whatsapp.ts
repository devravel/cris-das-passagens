import { contentLinks } from "@/config/content";
import type { PublicPackage } from "@/lib/package/queries";

export function getPackageWhatsAppUrl(pkg: PublicPackage): string {
  const message = encodeURIComponent(
    `Olá! Tenho interesse em ${pkg.destination}. Pode me passar mais detalhes?`,
  );

  return `${contentLinks.whatsapp}?text=${message}`;
}
