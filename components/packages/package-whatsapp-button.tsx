"use client";

import { PackageWhatsAppCta } from "@/components/packages/package-whatsapp-cta";
import { getPackageWhatsAppUrl } from "@/lib/coupon/whatsapp";
import { getStoredCoupon } from "@/lib/coupon/storage";
import { trackMetaLead } from "@/lib/meta-pixel";

type PackageWhatsAppButtonProps = {
  packageTitle: string;
  className?: string;
  iconClassName?: string;
};

export function PackageWhatsAppButton({
  packageTitle,
  className,
  iconClassName,
}: PackageWhatsAppButtonProps) {
  function openWhatsApp(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();

    trackMetaLead({
      source: "package_whatsapp",
      content_name: packageTitle,
      content_category: "package_quote",
    });

    const storedCoupon = getStoredCoupon();

    openWhatsApp(
      getPackageWhatsAppUrl(
        packageTitle,
        storedCoupon
          ? {
              name: storedCoupon.name,
              discountLabel: storedCoupon.discountLabel,
            }
          : null,
      ),
    );
  }

  return (
    <PackageWhatsAppCta
      href={getPackageWhatsAppUrl(packageTitle)}
      onClick={handleClick}
      className={className}
      iconClassName={iconClassName}
    />
  );
}
