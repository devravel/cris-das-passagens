"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Circle,
  Loader2,
  PencilLine,
  Plus,
  Tag,
  Trash2,
} from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  deleteCouponAction,
  setCouponActiveAction,
} from "@/app/admin/(protected)/cupons/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AdminCouponListItem } from "@/lib/coupon/queries";
import { cn } from "@/lib/utils";

type CouponsGridProps = {
  coupons: AdminCouponListItem[];
};

export function CouponsGrid({ coupons }: CouponsGridProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function formatDate(value: string | null) {
    if (!value) {
      return "Sem validade";
    }

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  }

  function isExpired(expiresAt: string | null) {
    if (!expiresAt) {
      return false;
    }

    return new Date(expiresAt) < new Date();
  }

  function handleToggleActive(id: string, isActive: boolean) {
    setPendingId(id);
    startTransition(async () => {
      const result = await setCouponActiveAction(id, !isActive);

      if (!result.ok) {
        toast.error(result.message);
        setPendingId(null);
        return;
      }

      toast.success(result.message);
      setPendingId(null);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!deleteId) return;

    setPendingId(deleteId);
    startTransition(async () => {
      const result = await deleteCouponAction(deleteId);

      if (!result.ok) {
        toast.error(result.message);
        setPendingId(null);
        return;
      }

      toast.success(result.message);
      setPendingId(null);
      setDeleteId(null);
      router.refresh();
    });
  }

  if (coupons.length === 0) {
    return (
      <div className="rounded-2xl border border-border/70 bg-card/80 p-8 text-center shadow-sm">
        <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-2xl bg-brand/10 text-brand">
          <Tag className="size-5" aria-hidden />
        </div>
        <p className="text-sm text-muted-foreground">Nenhum cupom cadastrado ainda.</p>
        <Button asChild className="mt-4 rounded-xl">
          <Link href="/admin/cupons/new">
            <Plus className="size-4" aria-hidden />
            Novo cupom
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border/70 bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Cupom</th>
                <th className="px-4 py-3 font-medium">Desconto</th>
                <th className="px-4 py-3 font-medium">Usos</th>
                <th className="px-4 py-3 font-medium">Validade</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => {
                const expired = isExpired(coupon.expiresAt);
                const limitReached =
                  coupon.maxUses != null && coupon.currentUses >= coupon.maxUses;

                return (
                  <tr key={coupon.id} className="border-b border-border/50 last:border-b-0">
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">{coupon.name}</p>
                        <p className="font-mono text-xs text-muted-foreground">{coupon.code}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-foreground">{coupon.discountLabel}</td>
                    <td className="px-4 py-4 text-foreground">
                      {coupon.currentUses}
                      {coupon.maxUses != null ? ` / ${coupon.maxUses}` : " / ∞"}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {formatDate(coupon.expiresAt)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                          !coupon.isActive || expired || limitReached
                            ? "bg-muted text-muted-foreground"
                            : "bg-brand/10 text-brand",
                        )}
                      >
                        {!coupon.isActive
                          ? "Inativo"
                          : expired
                            ? "Expirado"
                            : limitReached
                              ? "Esgotado"
                              : "Ativo"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-lg"
                          disabled={isPending && pendingId === coupon.id}
                          onClick={() => handleToggleActive(coupon.id, coupon.isActive)}
                        >
                          {isPending && pendingId === coupon.id ? (
                            <Loader2 className="size-3.5 animate-spin" aria-hidden />
                          ) : coupon.isActive ? (
                            <Circle className="size-3.5" aria-hidden />
                          ) : (
                            <CheckCircle2 className="size-3.5" aria-hidden />
                          )}
                          {coupon.isActive ? "Desativar" : "Ativar"}
                        </Button>
                        <Button asChild variant="outline" size="sm" className="rounded-lg">
                          <Link href={`/admin/cupons/${coupon.id}/edit`}>
                            <PencilLine className="size-3.5" aria-hidden />
                            Editar
                          </Link>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-lg text-destructive hover:text-destructive"
                          disabled={isPending && pendingId === coupon.id}
                          onClick={() => setDeleteId(coupon.id)}
                        >
                          <Trash2 className="size-3.5" aria-hidden />
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={Boolean(deleteId)} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Excluir cupom</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. O cupom será removido permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setDeleteId(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              disabled={isPending}
              onClick={handleDelete}
            >
              {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
