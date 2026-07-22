"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import { Loader2, Tag, X } from "lucide-react";

import {
  couponFieldDescription,
  couponFieldDescriptionShort,
  couponFieldFootnote,
  couponFieldLabel,
} from "@/config/coupon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  clearStoredCoupon,
  getStoredCoupon,
  hasActiveStoredCoupon,
  saveStoredCoupon,
  type StoredCoupon,
} from "@/lib/coupon/storage";
import { cn } from "@/lib/utils";

type CouponApplyFormProps = {
  className?: string;
  inputId?: string;
  showDescription?: boolean;
};

const couponMutedTextClassName =
  "text-[11px] leading-snug text-muted-foreground/80 sm:text-xs";

const couponFootnoteClassName = cn(
  "w-fit max-w-full text-[11px] font-semibold leading-snug text-brand sm:text-xs",
);

const couponFieldLabelClassName =
  "text-left text-xs font-medium text-foreground sm:text-sm";

function CouponFieldLabelText() {
  return (
    <>
      <span
        className={cn(
          couponFieldLabelClassName,
          "hidden min-[320px]:max-[347px]:flex min-[320px]:max-[347px]:flex-col",
        )}
      >
        <span>Tem cupom?</span>
        <span>Digite-o aqui.</span>
      </span>
      <span className={cn(couponFieldLabelClassName, "min-[320px]:max-[347px]:hidden")}>
        {couponFieldLabel}
      </span>
    </>
  );
}

export function CouponFieldFootnote({ className }: { className?: string }) {
  return (
    <span className={cn(couponFootnoteClassName, className)}>
      {couponFieldFootnote}
    </span>
  );
}

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

type ValidateResponse =
  | {
      success: true;
      coupon: {
        code: string;
        name: string;
        discountLabel: string;
        discountType: "PERCENTAGE" | "FIXED" | "CUSTOM";
      };
    }
  | {
      success: false;
      message: string;
    };

export function CouponApplyForm({
  className,
  inputId = "coupon-code-input",
  showDescription = false,
}: CouponApplyFormProps) {
  const [code, setCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<StoredCoupon | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isClient = useIsClient();
  const activeCoupon = isClient ? (appliedCoupon ?? getStoredCoupon()) : null;

  function handleApply() {
    setErrorMessage(null);

    const trimmedCode = code.trim();

    if (!trimmedCode) {
      setErrorMessage("Cupom não encontrado ou inválido.");
      return;
    }

    if (hasActiveStoredCoupon()) {
      setErrorMessage("Você já possui um cupom ativo.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/coupons/validate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code: trimmedCode }),
        });

        const result = (await response.json()) as ValidateResponse;

        if (!result.success) {
          setErrorMessage("Cupom não encontrado ou inválido.");
          return;
        }

        saveStoredCoupon({
          code: result.coupon.code,
          name: result.coupon.name,
          discountLabel: result.coupon.discountLabel,
          discountType: result.coupon.discountType,
        });

        const stored = getStoredCoupon();
        setAppliedCoupon(stored);
        setCode(stored?.code ?? "");
      } catch {
        setErrorMessage("Cupom não encontrado ou inválido.");
      }
    });
  }

  function handleRemoveCoupon() {
    clearStoredCoupon();
    setAppliedCoupon(null);
    setCode("");
    setErrorMessage(null);
  }

  if (!isClient) {
    return (
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col items-stretch gap-1.5 sm:max-w-md lg:max-w-lg",
          className,
        )}
        aria-hidden
      >
        <div className="flex w-full min-w-0 flex-col gap-1 max-[768px]:flex-row max-[768px]:flex-wrap max-[768px]:items-baseline max-[768px]:justify-between max-[768px]:gap-x-2 max-[425px]:flex-nowrap min-[768px]:flex-row min-[768px]:flex-wrap min-[768px]:items-baseline min-[768px]:justify-between min-[768px]:gap-x-2">
          <span className="min-w-0">
            <CouponFieldLabelText />
          </span>
          <CouponFieldFootnote className="inline-flex shrink-0 text-left min-[426px]:max-[639px]:hidden" />
        </div>
        {showDescription ? (
          <span
            className={cn(
              couponMutedTextClassName,
              "hidden w-full text-left max-[767px]:inline",
            )}
          >
            {couponFieldDescription}
          </span>
        ) : null}
        <div className="flex w-full min-w-0 items-center gap-2">
          <div className="h-9 min-w-0 flex-1 rounded-xl border border-border/70 bg-background/80" />
          <div className="h-9 w-20 shrink-0 rounded-xl bg-brand/20" />
        </div>
        <CouponFieldFootnote className="hidden w-full text-left min-[426px]:max-[639px]:inline-flex" />
        <span
          className={cn(couponMutedTextClassName, "block w-full text-left")}
        >
          {couponFieldDescriptionShort}
        </span>
      </div>
    );
  }

  const appliedLabel = activeCoupon
    ? `${activeCoupon.name} (${activeCoupon.discountLabel})`
    : null;
  const couponDescriptionText = activeCoupon
    ? activeCoupon.discountType === "CUSTOM"
      ? `Cupom ${activeCoupon.name} aplicado! ${activeCoupon.discountLabel}`
      : `🎉 Cupom ${appliedLabel} aplicado! Este benefício será considerado pelo agente durante o atendimento. Selecione um pacote agora mesmo.`
    : couponFieldDescriptionShort;

  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col items-stretch gap-2 sm:max-w-md lg:max-w-lg",
        className,
      )}
    >
      <div className="flex w-full min-w-0 flex-col gap-1.5">
        <div className="flex w-full min-w-0 flex-col gap-1 max-[768px]:flex-row max-[768px]:flex-wrap max-[768px]:items-baseline max-[768px]:justify-between max-[768px]:gap-x-2 max-[425px]:flex-nowrap min-[768px]:flex-row min-[768px]:flex-wrap min-[768px]:items-baseline min-[768px]:justify-between min-[768px]:gap-x-2">
          <label htmlFor={inputId} className="min-w-0">
            <CouponFieldLabelText />
          </label>
          <CouponFieldFootnote className="inline-flex shrink-0 text-left min-[426px]:max-[639px]:hidden" />
        </div>

        {showDescription ? (
          <p
            className={cn(
              couponMutedTextClassName,
              "hidden w-full text-left max-[767px]:block",
            )}
          >
            {couponFieldDescription}
          </p>
        ) : null}

        <div className="flex w-full min-w-0 items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Tag
              className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              id={inputId}
              value={activeCoupon ? activeCoupon.code : code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleApply();
                }
              }}
              placeholder="Cupom"
              disabled={Boolean(activeCoupon) || isPending}
              className="h-9 rounded-xl border-border/70 bg-background/90 pl-8 text-xs uppercase tracking-wide sm:text-sm"
            />
          </div>
          <Button
            type="button"
            size="sm"
            onClick={handleApply}
            disabled={Boolean(activeCoupon) || isPending}
            className="h-9 shrink-0 rounded-xl px-3 text-xs font-semibold sm:px-4 sm:text-sm"
          >
            {isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
                <span className="sr-only">Aplicando</span>
              </>
            ) : (
              "Aplicar"
            )}
          </Button>
        </div>

        <CouponFieldFootnote className="hidden w-full text-left min-[426px]:max-[639px]:inline-flex" />

        {activeCoupon ? (
          <div className="flex w-full items-start gap-2">
            <p className={cn(couponMutedTextClassName, "min-w-0 flex-1 text-left")}>
              {couponDescriptionText}
            </p>
            <button
              type="button"
              onClick={handleRemoveCoupon}
              className="mt-0.5 shrink-0 rounded-sm p-0.5 text-muted-foreground/70 transition-colors hover:text-foreground"
              aria-label="Remover cupom"
            >
              <X className="size-3.5" aria-hidden />
            </button>
          </div>
        ) : (
          <p className={cn(couponMutedTextClassName, "block w-full text-left")}>
            {couponDescriptionText}
          </p>
        )}
      </div>

      {errorMessage ? (
        <p className="w-full text-right text-[11px] leading-snug text-destructive sm:text-xs">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
