"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Loader2, Megaphone, PencilLine, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deletePromotionAction } from "@/app/admin/(protected)/promotions/actions";
import { getPromotionHref } from "@/components/promotion/promotion-popup";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PACKAGE_SCHEDULE_TIME_ZONE } from "@/lib/package/dates";
import type { AdminPromotion } from "@/lib/promotion/queries";
import { PROMOTION_STATUS_LABELS, getPromotionStatus } from "@/lib/promotion/schemas";
import { resolvePublicImageSrc } from "@/lib/storage/image-src";
import { cn } from "@/lib/utils";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: PACKAGE_SCHEDULE_TIME_ZONE,
});

export function PromotionsTable({ promotions }: { promotions: AdminPromotion[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleting, setDeleting] = useState<AdminPromotion | null>(null);

  function handleDelete() {
    if (!deleting) return;

    startTransition(async () => {
      const result = await deletePromotionAction(deleting.id);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setDeleting(null);
      router.refresh();
    });
  }

  if (promotions.length === 0) {
    return (
      <div className="rounded-2xl border border-border/70 bg-card/80 p-8 text-center shadow-sm">
        <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-2xl bg-brand/10 text-brand">
          <Megaphone className="size-5" aria-hidden />
        </div>
        <p className="text-sm text-muted-foreground">Nenhuma promoção criada ainda.</p>
        <Button asChild className="mt-4 rounded-xl">
          <Link href="/admin/promotions/new">
            <Plus className="size-4" aria-hidden />
            Nova promoção
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
                <th className="px-4 py-3 font-medium">Promoção</th>
                <th className="px-4 py-3 font-medium">Período</th>
                <th className="px-4 py-3 font-medium">Pacotes</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((promotion) => {
                const status = getPromotionStatus(promotion.startsAt, promotion.endsAt);
                // No período mas sem pacote: o pop-up não abre. Vale avisar.
                const missingPackages = status === "live" && promotion.packageCount === 0;

                return (
                  <tr key={promotion.id} className="border-b border-border/50 last:border-b-0">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element -- miniatura do painel */}
                        <img
                          src={resolvePublicImageSrc(promotion.image)}
                          alt=""
                          className="h-15 w-12 shrink-0 rounded-md bg-muted object-cover"
                        />
                        <div className="min-w-0 space-y-1">
                          <p className="font-medium text-foreground">{promotion.name}</p>
                          <p className="font-mono text-xs text-muted-foreground">
                            {getPromotionHref(promotion.slug)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-muted-foreground">
                      {dateFormatter.format(new Date(promotion.startsAt))}
                      <br />
                      até {dateFormatter.format(new Date(promotion.endsAt))}
                    </td>
                    <td className="px-4 py-4 text-foreground">{promotion.packageCount}</td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
                          status === "live" ? "bg-brand/10 text-brand" : "bg-muted text-muted-foreground",
                        )}
                      >
                        {PROMOTION_STATUS_LABELS[status]}
                      </span>
                      {missingPackages ? (
                        <p className="mt-1.5 max-w-52 text-xs text-destructive">
                          Sem pacote vinculado, o pop-up não abre.
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {status !== "ended" ? (
                          <Button asChild variant="outline" size="sm" className="rounded-lg">
                            <Link href={getPromotionHref(promotion.slug)} target="_blank">
                              <ExternalLink className="size-3.5" aria-hidden />
                              Ver página
                            </Link>
                          </Button>
                        ) : null}
                        <Button asChild variant="outline" size="sm" className="rounded-lg">
                          <Link href={`/admin/promotions/${promotion.id}/edit`}>
                            <PencilLine className="size-3.5" aria-hidden />
                            Editar
                          </Link>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-lg text-destructive hover:text-destructive"
                          onClick={() => setDeleting(promotion)}
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

      <Dialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Excluir promoção</DialogTitle>
            <DialogDescription>
              O pop-up e a página saem do ar. Os pacotes vinculados continuam no site, só perdem o
              vínculo. Não dá pra desfazer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setDeleting(null)}>
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
