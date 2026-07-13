"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  CheckCircle2, 
  Circle, 
  Loader2, 
  Package, 
  PencilLine, 
  Plus, 
  Sparkles, 
  Trash2 
} from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  deletePackageAction,
  setPackageActiveAction,
} from "@/app/admin/(protected)/packages/actions";
import { PackageShareActions } from "@/components/packages/package-share-actions";
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
import { PACKAGE_CATEGORY_LABELS, PACKAGE_TYPE_LABELS } from "@/lib/package/constants";
import type { AdminPackageListItem } from "@/lib/package/queries";
import { cn } from "@/lib/utils";

type PackagesGridProps = {
  packages: AdminPackageListItem[];
};

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

  function handleToggleActive(id: string, isActive: boolean) {
    setPendingId(id);
    startTransition(async () => {
      const result = await setPackageActiveAction(id, !isActive);

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
      <div className="space-y-3">
        {packages.map((pkg) => {
          const isRowPending = pendingId === pkg.id && isPending;

          return (
            <article
              key={pkg.id}
              className={cn(
                "group flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-3 shadow-sm transition-all duration-200 hover:shadow-md sm:flex-row sm:items-center sm:gap-4",
                !pkg.active && "opacity-60",
                isRowPending && "pointer-events-none opacity-40",
              )}
            >
              {/* Thumbnail */}
              <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted sm:size-16">
                {pkg.image ? (
                  <Image
                    src={pkg.image}
                    alt={pkg.title}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <Package className="size-6 text-muted-foreground" aria-hidden />
                  </div>
                )}
              </div>

              {/* Main Info */}
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-start gap-2">
                    <h3 className="min-w-0 flex-1 text-base font-semibold text-foreground">
                      {pkg.title}
                    </h3>
                    <div className="flex shrink-0 flex-wrap gap-1.5">
                      {pkg.active ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          <CheckCircle2 className="size-3" aria-hidden />
                          Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          <Circle className="size-3" aria-hidden />
                          Inativo
                        </span>
                      )}
                      {pkg.featured && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-400/20 px-2 py-0.5 text-xs font-medium text-amber-900">
                          <Sparkles className="size-3" aria-hidden />
                          Destaque
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="font-medium">{pkg.destination}</span>
                    <span aria-hidden>•</span>
                    <span>{PACKAGE_TYPE_LABELS[pkg.type]}</span>
                    {pkg.category && (
                      <>
                        <span aria-hidden>•</span>
                        <span>{PACKAGE_CATEGORY_LABELS[pkg.category]}</span>
                      </>
                    )}
                    <span aria-hidden>•</span>
                    <span className="font-semibold text-foreground">{formatPackagePrice(pkg.price)}</span>
                    <span aria-hidden>•</span>
                    <span>
                      Adicionado em <time dateTime={pkg.createdAt}>{formatDate(pkg.createdAt)}</time>
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-end">
                <PackageShareActions title={pkg.title} slug={pkg.slug} compact />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="flex-1 rounded-lg sm:flex-initial sm:w-28"
                  disabled={isRowPending}
                  onClick={() => handleToggleActive(pkg.id, pkg.active)}
                >
                  {isRowPending ? (
                    <Loader2 className="size-3.5 animate-spin" aria-hidden />
                  ) : pkg.active ? (
                    <Circle className="size-3.5 sm:mr-1.5" aria-hidden />
                  ) : (
                    <CheckCircle2 className="size-3.5 sm:mr-1.5" aria-hidden />
                  )}
                  <span className="hidden sm:inline">{pkg.active ? "Desativar" : "Ativar"}</span>
                </Button>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="flex-1 rounded-lg sm:flex-initial sm:w-24"
                >
                  <Link href={`/admin/packages/${pkg.id}/edit`}>
                    <PencilLine className="size-3.5 sm:mr-1.5" aria-hidden />
                    <span className="hidden sm:inline">Editar</span>
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive sm:flex-initial sm:w-24"
                  onClick={() => setDeleteId(pkg.id)}
                  disabled={isRowPending}
                >
                  <Trash2 className="size-3.5 sm:mr-1.5" aria-hidden />
                  <span className="hidden sm:inline">Excluir</span>
                </Button>
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
