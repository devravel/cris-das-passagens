"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  PackageWhatsAppCta,
  packageActionButtonClassName,
} from "@/components/packages/package-whatsapp-cta";
import { getPackageWhatsAppUrl } from "@/lib/coupon/whatsapp";
import {
  getStoredCoupon,
  hasRecentlyUsedCoupon,
  recordCouponUsage,
} from "@/lib/coupon/storage";
import { cn } from "@/lib/utils";

type RedeemResponse =
  | {
      success: true;
      coupon: {
        name: string;
        discountLabel: string;
      };
    }
  | {
      success: false;
      message: string;
    };

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
  const [isPending, startTransition] = useTransition();
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

    startTransition(async () => {
      try {
        const response = await fetch("/api/coupons/redeem", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: storedCoupon.code,
            packageTitle,
          }),
        });

        const result = (await response.json()) as RedeemResponse;

        if (!result.success) {
          const message =
            "Este cupom não está mais disponível. Selecione um pacote sem cupom ou tente outro código.";
          setErrorMessage(message);
          toast.error(message);
          return;
        }

        recordCouponUsage(storedCoupon.code);

        openWhatsApp(
          getPackageWhatsAppUrl(packageTitle, {
            name: result.coupon.name,
            discountLabel: result.coupon.discountLabel,
          }),
        );
      } catch {
        const message = "Não foi possível validar o cupom agora. Tente novamente.";
        setErrorMessage(message);
        toast.error(message);
      }
    });
  }

  if (isPending) {
    return (
      <span
        className={cn(
          packageActionButtonClassName,
          "bg-[#25D366] text-white shadow-sm",
          className,
        )}
        aria-busy="true"
      >
        <Loader2 className={cn("size-4 animate-spin", iconClassName)} aria-hidden />
        <span className="text-center">Validando cupom...</span>
      </span>
    );
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
