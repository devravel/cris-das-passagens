"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { CouponForm } from "@/components/admin/coupon-form";
import { Button } from "@/components/ui/button";
import type { AdminCouponListItem } from "@/lib/coupon/queries";

type CouponEditScreenProps = {
  coupon: AdminCouponListItem;
};

function toDatetimeLocalValue(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function CouponEditScreen({ coupon }: CouponEditScreenProps) {
  const router = useRouter();

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
            Editar cupom
          </h1>
          <p className="text-sm text-muted-foreground">
            Atualize código, desconto, validade e status do cupom.
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={() => router.push("/admin/cupons")}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Voltar
        </Button>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm sm:p-6">
        <CouponForm
          mode="edit"
          couponId={coupon.id}
          initialValues={{
            name: coupon.name,
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            maxUses: coupon.maxUses,
            expiresAt: toDatetimeLocalValue(coupon.expiresAt),
            description: coupon.description ?? "",
            isActive: coupon.isActive,
          }}
          onSuccess={() => {
            router.push("/admin/cupons");
            router.refresh();
          }}
        />
      </div>
    </section>
  );
}
