"use client";

import { Input } from "@/components/ui/input";
import { toDatetimeLocalValue } from "@/lib/package/dates";
import type {
  PackageActivationMode,
  PackageFormInput,
} from "@/lib/package/schemas";

type PackageDurationFieldsProps = {
  defineDuration: boolean;
  activationMode: PackageActivationMode;
  activatesAt: string;
  deactivatesAt: string;
  errors: {
    activatesAt?: { message?: string };
    deactivatesAt?: { message?: string };
  };
  onDefineDurationChange: (value: boolean) => void;
  onActivationModeChange: (value: PackageActivationMode) => void;
  onActivatesAtChange: (value: string) => void;
  onDeactivatesAtChange: (value: string) => void;
};

const checkboxClassName =
  "size-4 rounded border-border text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const radioClassName =
  "size-4 border-border text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function PackageDurationFields({
  defineDuration,
  activationMode,
  activatesAt,
  deactivatesAt,
  errors,
  onDefineDurationChange,
  onActivationModeChange,
  onActivatesAtChange,
  onDeactivatesAtChange,
}: PackageDurationFieldsProps) {
  return (
    <div className="space-y-3 rounded-xl border border-border/70 bg-muted/20 p-3">
      <label
        htmlFor="defineDuration"
        className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground"
      >
        <input
          id="defineDuration"
          type="checkbox"
          className={checkboxClassName}
          checked={defineDuration}
          onChange={(event) => onDefineDurationChange(event.target.checked)}
        />
        Definir duração do pacote
      </label>

      {defineDuration ? (
        <div className="space-y-4 border-t border-border/60 pt-3">
          <div className="space-y-2.5">
            <p className="text-sm font-medium text-foreground">Ativação</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border/70 bg-background px-3 py-2 text-sm text-foreground">
                <input
                  type="radio"
                  name="activationMode"
                  className={radioClassName}
                  checked={activationMode === "now"}
                  onChange={() => onActivationModeChange("now")}
                />
                A partir de agora
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border/70 bg-background px-3 py-2 text-sm text-foreground">
                <input
                  type="radio"
                  name="activationMode"
                  className={radioClassName}
                  checked={activationMode === "scheduled"}
                  onChange={() => onActivationModeChange("scheduled")}
                />
                Agendar data e hora
              </label>
            </div>

            {activationMode === "scheduled" ? (
              <div className="space-y-1.5">
                <label
                  htmlFor="activatesAt"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Data e hora de ativação
                </label>
                <Input
                  id="activatesAt"
                  type="datetime-local"
                  className="h-10 rounded-xl"
                  value={activatesAt}
                  onChange={(event) => onActivatesAtChange(event.target.value)}
                />
                {errors.activatesAt?.message ? (
                  <p className="text-xs text-destructive">
                    {errors.activatesAt.message}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                O pacote fica disponível imediatamente ao salvar (se estiver marcado
                como ativo).
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="deactivatesAt"
              className="text-sm font-medium text-foreground"
            >
              Desativação
            </label>
            <Input
              id="deactivatesAt"
              type="datetime-local"
              className="h-10 rounded-xl"
              value={deactivatesAt}
              onChange={(event) => onDeactivatesAtChange(event.target.value)}
            />
            {errors.deactivatesAt?.message ? (
              <p className="text-xs text-destructive">
                {errors.deactivatesAt.message}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                O sistema desativa o pacote automaticamente nesta data e hora.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function packageDurationInitialValues(pkg: {
  activatesAt: string | null;
  deactivatesAt: string | null;
}): Pick<
  PackageFormInput,
  "defineDuration" | "activationMode" | "activatesAt" | "deactivatesAt"
> {
  const hasSchedule = Boolean(pkg.activatesAt || pkg.deactivatesAt);

  return {
    defineDuration: hasSchedule,
    activationMode: pkg.activatesAt ? "scheduled" : "now",
    activatesAt: toDatetimeLocalValue(pkg.activatesAt),
    deactivatesAt: toDatetimeLocalValue(pkg.deactivatesAt),
  };
}
