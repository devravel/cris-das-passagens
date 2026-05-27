"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, MapPin, Package, PencilLine, Plus, Sparkles, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  deletePackageAction,
  setPackageActiveAction,
  setPackageFeaturedAction,
} from "@/app/admin/(protected)/packages/actions";
import { PackageCardPreview } from "@/components/admin/package-card-preview";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatPackagePrice } from "@/lib/package/format";
import type { AdminPackageListItem } from "@/lib/package/queries";
import type { PackageCardPreviewData } from "@/lib/package/schemas";
import { cn } from "@/lib/utils";

type PackagesGridProps = {
  packages: AdminPackageListItem[];
};

function toPreviewData(pkg: AdminPackageListItem): PackageCardPreviewData {
  return {
    title: pkg.title,
    shortDescription: pkg.shortDescription,
    destination: pkg.destination,
    image: pkg.image,
    type: pkg.type,
    price: pkg.price,
    oldPrice: pkg.oldPrice,
    installmentText: pkg.installmentText,
    highlightInstallments: pkg.highlightInstallments,
    airline: pkg.airline,
    hotelName: pkg.hotelName,
    includedItems: pkg.includedItems,
    daysCount: pkg.daysCount,
    nightsCount: pkg.nightsCount,
    featured: pkg.featured,
  };
}

export function PackagesGrid({ packages }: PackagesGridProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function formatDate(value: string) {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value));
  }

  function handleToggleActive(id: string, active: boolean) {
    setPendingId(id);
    startTransition(async () => {
      const result = await setPackageActiveAction(id, !active);

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

  function handleToggleFeatured(id: string, featured: boolean) {
    setPendingId(id);
    startTransition(async () => {
      const result = await setPackageFeaturedAction(id, !featured);

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
      const result = await deletePackageAction(deleteId);

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

  if (packages.length === 0) {
    return (
      <div className="rounded-2xl border border-border/70 bg-card/80 p-8 text-center shadow-sm">
        <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-2xl bg-brand/10 text-brand">
          <Package className="size-5" aria-hidden />
        </div>
        <p className="text-sm text-muted-foreground">Nenhum pacote cadastrado ainda.</p>
        <Button asChild className="mt-4 rounded-xl">
          <Link href="/admin/packages/new">
            <Plus className="size-4" aria-hidden />
            Criar primeiro pacote
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {packages.map((pkg) => {
          const isCardPending = pendingId === pkg.id && isPending;

          return (
            <article
              key={pkg.id}
              className={cn(
                "space-y-3 rounded-2xl border border-border/70 bg-card/90 p-3 shadow-sm transition-opacity duration-200",
                !pkg.active && "opacity-80",
                isCardPending && "pointer-events-none opacity-60",
              )}
            >
              <PackageCardPreview data={toPreviewData(pkg)} />

              <div className="space-y-2 px-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" aria-hidden />
                    {pkg.destination}
                  </span>
                  <span aria-hidden>•</span>
                  <span>{formatPackagePrice(pkg.price)}</span>
                  <span aria-hidden>•</span>
                  <span>Criado em {formatDate(pkg.createdAt)}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    aria-pressed={pkg.active}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
                      pkg.active
                        ? "bg-emerald-500/90 text-white hover:bg-emerald-600"
                        : "bg-muted text-muted-foreground hover:bg-muted/80",
                    )}
                    onClick={() => handleToggleActive(pkg.id, pkg.active)}
                    disabled={isCardPending}
                  >
                    {isCardPending ? (
                      <Loader2 className="size-3 animate-spin" aria-hidden />
                    ) : pkg.active ? (
                      "Ativo"
                    ) : (
                      "Inativo"
                    )}
                  </button>
                  <button
                    type="button"
                    aria-pressed={pkg.featured}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
                      pkg.featured
                        ? "bg-amber-400/90 text-amber-950 hover:bg-amber-400"
                        : "bg-muted text-muted-foreground hover:bg-muted/80",
                    )}
                    onClick={() => handleToggleFeatured(pkg.id, pkg.featured)}
                    disabled={isCardPending}
                  >
                    <Sparkles className="size-3" aria-hidden />
                    {pkg.featured ? "Destaque" : "Sem destaque"}
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Button asChild size="sm" variant="outline" className="flex-1 rounded-lg">
                    <Link href={`/admin/packages/${pkg.id}/edit`}>
                      <PencilLine className="size-4" aria-hidden />
                      Editar
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="rounded-lg"
                    onClick={() => setDeleteId(pkg.id)}
                    disabled={isCardPending}
                    aria-label="Excluir pacote"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <Dialog open={Boolean(deleteId)} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Excluir pacote?</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. O pacote será removido permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} className="rounded-lg">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="rounded-lg">
              {isPending && pendingId === deleteId ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Excluindo...
                </>
              ) : (
                "Excluir pacote"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
