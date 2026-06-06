"use client";

import { useMemo, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  createCouponAction,
  updateCouponAction,
} from "@/app/admin/(protected)/cupons/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  COUPON_DISCOUNT_TYPES,
  EMPTY_COUPON_FORM_VALUES,
  couponFormSchema,
  type CouponFormInput,
  type CouponFormValues,
} from "@/lib/coupon/schemas";
const selectClassName =
  "h-10 w-full rounded-xl border border-input bg-background px-3 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type CouponFormProps = {
  mode: "create" | "edit";
  couponId?: string;
  initialValues?: CouponFormInput;
  onSuccess?: () => void;
};

export function CouponForm({
  mode,
  couponId,
  initialValues,
  onSuccess,
}: CouponFormProps) {
  const [isPending, startTransition] = useTransition();

  const values = useMemo(
    () => ({
      ...EMPTY_COUPON_FORM_VALUES,
      ...initialValues,
    }),
    [initialValues],
  );

  const form = useForm<CouponFormInput, unknown, CouponFormValues>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: values,
    mode: "onBlur",
  });

  function onSubmit(input: CouponFormValues) {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createCouponAction(input)
          : await updateCouponAction(couponId!, input);

      if (!result.ok) {
        toast.error(result.message);

        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, messages]) => {
            if (messages?.[0]) {
              form.setError(field as keyof CouponFormInput, {
                message: messages[0],
              });
            }
          });
        }

        return;
      }

      toast.success(result.message);
      onSuccess?.();
    });
  }

  const discountType = form.watch("discountType");

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="coupon-name" className="text-sm font-medium text-foreground">
            Nome
          </label>
          <Input
            id="coupon-name"
            {...form.register("name")}
            placeholder="Ex.: Copa 10%"
            className="rounded-xl"
          />
          {form.formState.errors.name ? (
            <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="coupon-code" className="text-sm font-medium text-foreground">
            Código
          </label>
          <Input
            id="coupon-code"
            {...form.register("code")}
            placeholder="Ex.: COPA10"
            className="rounded-xl uppercase"
          />
          {form.formState.errors.code ? (
            <p className="text-xs text-destructive">{form.formState.errors.code.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="coupon-type" className="text-sm font-medium text-foreground">
            Tipo
          </label>
          <select
            id="coupon-type"
            {...form.register("discountType")}
            className={selectClassName}
          >
            {COUPON_DISCOUNT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type === "PERCENTAGE" ? "Percentual (%)" : "Valor fixo (R$)"}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="coupon-value" className="text-sm font-medium text-foreground">
            Valor
          </label>
          <Input
            id="coupon-value"
            type="number"
            min={0}
            step={discountType === "PERCENTAGE" ? 1 : 0.01}
            {...form.register("discountValue", { valueAsNumber: true })}
            className="rounded-xl"
          />
          {form.formState.errors.discountValue ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.discountValue.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="coupon-max-uses" className="text-sm font-medium text-foreground">
            Limite de usos (opcional)
          </label>
          <Input
            id="coupon-max-uses"
            type="number"
            min={1}
            step={1}
            placeholder="Ilimitado"
            {...form.register("maxUses", {
              setValueAs: (value) => {
                if (value === "" || value == null) {
                  return null;
                }

                const parsed = Number(value);
                return Number.isNaN(parsed) ? null : parsed;
              },
            })}
            className="rounded-xl"
          />
          {form.formState.errors.maxUses ? (
            <p className="text-xs text-destructive">{form.formState.errors.maxUses.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="coupon-expires" className="text-sm font-medium text-foreground">
            Data de expiração (opcional)
          </label>
          <Input
            id="coupon-expires"
            type="datetime-local"
            {...form.register("expiresAt")}
            className="rounded-xl"
          />
          {form.formState.errors.expiresAt ? (
            <p className="text-xs text-destructive">{form.formState.errors.expiresAt.message}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="coupon-description" className="text-sm font-medium text-foreground">
          Descrição interna (opcional)
        </label>
        <Textarea
          id="coupon-description"
          rows={3}
          {...form.register("description")}
          placeholder="Observações para a equipe comercial."
          className="rounded-xl"
        />
        {form.formState.errors.description ? (
          <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>
        ) : null}
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          {...form.register("isActive")}
          className="size-4 rounded border-input"
        />
        Cupom ativo
      </label>

      <Button type="submit" disabled={isPending} className="rounded-xl">
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Salvando...
          </>
        ) : mode === "create" ? (
          "Criar cupom"
        ) : (
          "Salvar alterações"
        )}
      </Button>
    </form>
  );
}
