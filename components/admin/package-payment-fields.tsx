"use client";

import {
  PACKAGE_INSTALLMENT_COUNT_PRESETS,
  PACKAGE_INSTALLMENT_KIND_LABELS,
  PACKAGE_PAYMENT_METHOD_LABELS,
  PACKAGE_PAYMENT_METHODS,
  buildInstallmentText,
  suggestInstallmentAmount,
  type PackageInstallmentKindValue,
  type PackagePaymentMethodValue,
} from "@/lib/package/payment";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const selectClassName =
  "h-10 w-full rounded-xl border border-input bg-background px-3 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type PackagePaymentFieldsProps = {
  price: number;
  installmentKind: PackageInstallmentKindValue;
  installmentCount: number | null;
  installmentAmount: number | null;
  downPaymentAmount: number | null;
  installmentText: string;
  paymentMethods: PackagePaymentMethodValue[];
  errors?: {
    installmentKind?: string;
    installmentCount?: string;
    installmentAmount?: string;
    downPaymentAmount?: string;
    installmentText?: string;
    paymentMethods?: string;
  };
  onChange: (patch: {
    installmentKind?: PackageInstallmentKindValue;
    installmentCount?: number | null;
    installmentAmount?: number | null;
    downPaymentAmount?: number | null;
    installmentText?: string;
    paymentMethods?: PackagePaymentMethodValue[];
  }) => void;
};

function optionalNumberFromInput(value: string): number | null {
  if (value === "" || value == null) {
    return null;
  }

  const numeric = Number(value);
  return Number.isNaN(numeric) ? null : numeric;
}

export function PackagePaymentFields({
  price,
  installmentKind,
  installmentCount,
  installmentAmount,
  downPaymentAmount,
  installmentText,
  paymentMethods,
  errors,
  onChange,
}: PackagePaymentFieldsProps) {
  const previewText = buildInstallmentText({
    installmentKind,
    installmentCount,
    installmentAmount,
    downPaymentAmount,
    installmentText,
    price,
  });

  const showInstallmentAmount =
    installmentKind === "INSTALLMENTS" ||
    installmentKind === "DOWN_PAYMENT" ||
    installmentKind === "PIX_CASH";
  const showCount =
    installmentKind === "INSTALLMENTS" || installmentKind === "DOWN_PAYMENT";
  const showDownPayment = installmentKind === "DOWN_PAYMENT";
  const showCustomText = installmentKind === "CUSTOM";

  function setKind(nextKind: PackageInstallmentKindValue) {
    const nextCount =
      nextKind === "INSTALLMENTS" || nextKind === "DOWN_PAYMENT"
        ? (installmentCount ?? 12)
        : null;

    const suggested =
      nextKind === "INSTALLMENTS" || nextKind === "DOWN_PAYMENT"
        ? suggestInstallmentAmount(price, nextCount)
        : nextKind === "PIX_CASH"
          ? price
          : null;

    onChange({
      installmentKind: nextKind,
      installmentCount: nextCount,
      installmentAmount:
        nextKind === "NONE" || nextKind === "CUSTOM"
          ? null
          : (installmentAmount ?? suggested),
      downPaymentAmount: nextKind === "DOWN_PAYMENT" ? downPaymentAmount : null,
      installmentText: nextKind === "CUSTOM" ? installmentText : "",
    });
  }

  function setCount(count: number) {
    const suggested = suggestInstallmentAmount(price, count);
    onChange({
      installmentCount: count,
      installmentAmount: installmentAmount ?? suggested,
    });
  }

  function togglePaymentMethod(method: PackagePaymentMethodValue) {
    const next = paymentMethods.includes(method)
      ? paymentMethods.filter((item) => item !== method)
      : [...paymentMethods, method];

    onChange({ paymentMethods: next });
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border/70 bg-muted/10 p-4">
      <div className="space-y-1.5">
        <label
          htmlFor="installmentKind"
          className="text-sm font-medium text-foreground"
        >
          Parcelamento
        </label>
        <select
          id="installmentKind"
          className={selectClassName}
          value={installmentKind}
          onChange={(event) =>
            setKind(event.target.value as PackageInstallmentKindValue)
          }
        >
          {(
            [
              "NONE",
              "INSTALLMENTS",
              "DOWN_PAYMENT",
              "PIX_CASH",
              ...(installmentKind === "CUSTOM" ? (["CUSTOM"] as const) : []),
            ] as const
          ).map((kind) => (
            <option key={kind} value={kind}>
              {PACKAGE_INSTALLMENT_KIND_LABELS[kind]}
            </option>
          ))}
        </select>
        {errors?.installmentKind ? (
          <p className="text-xs text-destructive">{errors.installmentKind}</p>
        ) : null}
      </div>

      {showCount ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Parcelas</p>
          <div className="flex flex-wrap gap-2">
            {PACKAGE_INSTALLMENT_COUNT_PRESETS.map((count) => {
              const selected = installmentCount === count;
              return (
                <button
                  key={count}
                  type="button"
                  className={cn(
                    "inline-flex h-9 min-w-14 items-center justify-center rounded-xl border px-3 text-sm font-medium transition-colors",
                    selected
                      ? "border-brand bg-brand/10 text-foreground"
                      : "border-border/70 bg-background text-muted-foreground hover:border-brand/40 hover:text-foreground",
                  )}
                  onClick={() => setCount(count)}
                >
                  {String(count).padStart(2, "0")}x
                </button>
              );
            })}
          </div>
          <div className="max-w-[140px] space-y-1.5">
            <label
              htmlFor="installmentCount"
              className="text-xs text-muted-foreground"
            >
              Outra quantidade
            </label>
            <Input
              id="installmentCount"
              type="number"
              min={1}
              max={48}
              className="h-10 rounded-xl"
              value={installmentCount ?? ""}
              onChange={(event) => {
                const count = optionalNumberFromInput(event.target.value);
                if (count == null) {
                  onChange({ installmentCount: null });
                  return;
                }
                setCount(count);
              }}
            />
          </div>
          {errors?.installmentCount ? (
            <p className="text-xs text-destructive">{errors.installmentCount}</p>
          ) : null}
        </div>
      ) : null}

      {showDownPayment ? (
        <div className="space-y-1.5">
          <label
            htmlFor="downPaymentAmount"
            className="text-sm font-medium text-foreground"
          >
            Entrada (R$)
          </label>
          <Input
            id="downPaymentAmount"
            type="number"
            min="0"
            step="0.01"
            className="h-10 rounded-xl"
            value={downPaymentAmount ?? ""}
            onChange={(event) =>
              onChange({
                downPaymentAmount: optionalNumberFromInput(event.target.value),
              })
            }
          />
          {errors?.downPaymentAmount ? (
            <p className="text-xs text-destructive">{errors.downPaymentAmount}</p>
          ) : null}
        </div>
      ) : null}

      {showInstallmentAmount ? (
        <div className="space-y-1.5">
          <label
            htmlFor="installmentAmount"
            className="text-sm font-medium text-foreground"
          >
            {installmentKind === "PIX_CASH" ? "Valor à vista (R$)" : "Valor da parcela (R$)"}
          </label>
          <Input
            id="installmentAmount"
            type="number"
            min="0"
            step="0.01"
            className="h-10 rounded-xl"
            value={installmentAmount ?? ""}
            onChange={(event) =>
              onChange({
                installmentAmount: optionalNumberFromInput(event.target.value),
              })
            }
          />
          {showCount ? (
            <button
              type="button"
              className="text-xs font-medium text-brand hover:underline"
              onClick={() => {
                const suggested = suggestInstallmentAmount(
                  price,
                  installmentCount,
                );
                if (suggested != null) {
                  onChange({ installmentAmount: suggested });
                }
              }}
            >
              Calcular pelo preço total
            </button>
          ) : null}
          {errors?.installmentAmount ? (
            <p className="text-xs text-destructive">{errors.installmentAmount}</p>
          ) : null}
        </div>
      ) : null}

      {showCustomText ? (
        <div className="space-y-1.5">
          <label
            htmlFor="installmentText"
            className="text-sm font-medium text-foreground"
          >
            Texto de parcelamento
          </label>
          <Input
            id="installmentText"
            className="h-10 rounded-xl"
            placeholder="Ex.: 12x R$ 129"
            value={installmentText}
            onChange={(event) =>
              onChange({ installmentText: event.target.value })
            }
          />
          {errors?.installmentText ? (
            <p className="text-xs text-destructive">{errors.installmentText}</p>
          ) : null}
        </div>
      ) : null}

      {previewText ? (
        <p className="rounded-xl border border-border/60 bg-background px-3 py-2 text-sm text-foreground">
          No card: <span className="font-medium">{previewText}</span>
        </p>
      ) : null}

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">
          Formas de pagamento{" "}
          <span className="font-normal text-muted-foreground">
            (marque as opções do encarte)
          </span>
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {PACKAGE_PAYMENT_METHODS.map((method) => {
            const checked = paymentMethods.includes(method);
            const id = `payment-method-${method}`;

            return (
              <label
                key={method}
                htmlFor={id}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm font-medium text-foreground"
              >
                <input
                  id={id}
                  type="checkbox"
                  className="size-4 rounded border-border text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  checked={checked}
                  onChange={() => togglePaymentMethod(method)}
                />
                {PACKAGE_PAYMENT_METHOD_LABELS[method]}
              </label>
            );
          })}
        </div>
        {errors?.paymentMethods ? (
          <p className="text-xs text-destructive">{errors.paymentMethods}</p>
        ) : null}
      </div>
    </div>
  );
}
