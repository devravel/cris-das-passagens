"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import { Loader2, Tag } from "lucide-react";

import { couponFieldDescription, couponFieldLabel } from "@/config/coupon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isClient = useIsClient();
  const activeCoupon = isClient ? appliedCoupon ?? getStoredCoupon() : null;

  function handleApply() {
    setSuccessMessage(null);
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
        });

        const stored = getStoredCoupon();
        setAppliedCoupon(stored);
        setCode("");
        setSuccessMessage(
          `🎉 Cupom ${result.coupon.name} (${result.coupon.discountLabel}) aplicado! Este benefício será considerado pelo agente durante o atendimento. Selecione um pacote agora mesmo.`,
        );
      } catch {
        setErrorMessage("Cupom não encontrado ou inválido.");
      }
    });
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
        <span className="w-full text-left text-xs font-medium text-foreground sm:text-sm">
          {couponFieldLabel}
        </span>
        {showDescription ? (
          <span className="w-full text-left text-[11px] leading-snug text-muted-foreground/80 sm:text-xs">
            {couponFieldDescription}
          </span>
        ) : null}
        <div className="flex w-full min-w-0 items-center gap-2">
          <div className="h-9 min-w-0 flex-1 rounded-xl border border-border/70 bg-background/80" />
          <div className="h-9 w-20 shrink-0 rounded-xl bg-brand/20" />
        </div>
      </div>
    );
  }

  const appliedLabel = activeCoupon
    ? `${activeCoupon.name} (${activeCoupon.discountLabel})`
    : null;

  return (
    <div className={cn("flex min-w-0 flex-1 flex-col items-stretch gap-2 sm:max-w-md lg:max-w-lg", className)}>
      <div className="flex w-full min-w-0 flex-col gap-1.5">
        <label
          htmlFor={inputId}
          className="w-full text-left text-xs font-medium text-foreground sm:text-sm"
        >
          {couponFieldLabel}
        </label>

        {showDescription ? (
          <p className="w-full text-left text-[11px] leading-snug text-muted-foreground/80 sm:text-xs">
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
              value={code}
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
      </div>

      {activeCoupon && !successMessage ? (
        <p className="w-full text-right text-[11px] leading-snug text-brand sm:text-xs">
          Cupom {appliedLabel} ativo. Selecione um pacote para falar com o agente.
        </p>
      ) : null}

      {successMessage ? (
        <p className="w-full rounded-xl border border-brand/20 bg-brand/5 px-3 py-2 text-left text-[11px] leading-relaxed text-foreground sm:text-xs">
          {successMessage}
        </p>
      ) : null}

      {errorMessage ? (
        <p className="w-full text-right text-[11px] leading-snug text-destructive sm:text-xs">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
