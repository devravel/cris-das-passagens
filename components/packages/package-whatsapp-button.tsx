"use client";

import { useState } from "react";

import { PackageWhatsAppCta } from "@/components/packages/package-whatsapp-cta";
import { getPackageWhatsAppUrl } from "@/lib/coupon/whatsapp";
import { redeemCouponInBackground } from "@/lib/coupon/redeem-client";
import {
  getStoredCoupon,
  hasRecentlyUsedCoupon,
  recordCouponUsage,
} from "@/lib/coupon/storage";

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function openWhatsApp(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const storedCoupon = getStoredCoupon();

    if (!storedCoupon) {
      openWhatsApp(getPackageWhatsAppUrl(packageTitle));
      return;
    }

    if (hasRecentlyUsedCoupon(storedCoupon.code)) {
      setErrorMessage("Este cupom já foi utilizado neste dispositivo.");
      return;
    }

    openWhatsApp(
      getPackageWhatsAppUrl(packageTitle, {
        name: storedCoupon.name,
        discountLabel: storedCoupon.discountLabel,
      }),
    );
    recordCouponUsage(storedCoupon.code);
    redeemCouponInBackground({
      code: storedCoupon.code,
      packageTitle,
    });
  }

  return (
    <div className="flex w-full flex-col gap-1">
      <PackageWhatsAppCta
        href={getPackageWhatsAppUrl(packageTitle)}
        onClick={handleClick}
        className={className}
        iconClassName={iconClassName}
      />
      {errorMessage ? (
        <p className="text-center text-[10px] leading-snug text-destructive sm:text-[11px]">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
