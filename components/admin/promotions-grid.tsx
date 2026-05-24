"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Loader2, Megaphone, PencilLine, Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  deletePromotionAction,
  setPromotionActiveAction,
} from "@/app/admin/(protected)/promotions/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type PromotionListItem = {
  id: string;
  image: string;
  title: string | null;
  link: string | null;
  active: boolean;
  createdAt: string;
};

type PromotionsGridProps = {
  promotions: PromotionListItem[];
};

export function PromotionsGrid({ promotions }: PromotionsGridProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function formatDate(value: string) {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value));
  }

  function handleToggleActive(id: string, active: boolean) {
    startTransition(async () => {
      const result = await setPromotionActiveAction(id, !active);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!deleteId) return;

    startTransition(async () => {
      const result = await deletePromotionAction(deleteId);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setDeleteId(null);
      router.refresh();
    });
  }

  if (promotions.length === 0) {
    return (
      <div className="rounded-2xl border border-border/70 bg-card/80 p-8 text-center shadow-sm">
        <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-2xl bg-brand/10 text-brand">
          <Megaphone className="size-5" aria-hidden />
        </div>
        <p className="text-sm text-muted-foreground">Nenhuma promoção cadastrada ainda.</p>
        <Button asChild className="mt-4 rounded-xl">
          <Link href="/admin/promotions/new">
            <Plus className="size-4" aria-hidden />
            Criar primeira promoção
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {promotions.map((promotion) => (
          <article
            key={promotion.id}
            className={cn(
              "group overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-sm transition-shadow hover:shadow-md",
              !promotion.active && "opacity-80",
            )}
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-muted/30">
              <Image
                src={promotion.image}
                alt={promotion.title ?? "Promoção"}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
              <button
                type="button"
                className={cn(
                  "absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                  promotion.active
                    ? "bg-emerald-500/90 text-white hover:bg-emerald-600"
                    : "bg-background/90 text-muted-foreground hover:bg-background",
                )}
                onClick={() => handleToggleActive(promotion.id, promotion.active)}
                disabled={isPending}
              >
                {promotion.active ? "Ativa" : "Inativa"}
              </button>
            </div>

            <div className="space-y-3 p-4">
              <div className="space-y-1">
                <h2 className="line-clamp-2 font-medium text-foreground">
                  {promotion.title ?? "Sem título"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Criada em {formatDate(promotion.createdAt)}
                </p>
              </div>

              {promotion.link ? (
                <a
                  href={promotion.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 truncate text-xs font-medium text-brand hover:underline"
                >
                  <ExternalLink className="size-3.5 shrink-0" aria-hidden />
                  <span className="truncate">{promotion.link}</span>
                </a>
              ) : (
                <p className="text-xs text-muted-foreground">Sem link configurado</p>
              )}

              <div className="flex items-center gap-2 pt-1">
                <Button asChild size="sm" variant="outline" className="flex-1 rounded-lg">
                  <Link href={`/admin/promotions/${promotion.id}/edit`}>
                    <PencilLine className="size-4" aria-hidden />
                    Editar
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="rounded-lg"
                  onClick={() => setDeleteId(promotion.id)}
                  disabled={isPending}
                  aria-label="Excluir promoção"
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <Dialog open={Boolean(deleteId)} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Excluir promoção?</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. A campanha será removida permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} className="rounded-lg">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="rounded-lg">
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Excluindo...
                </>
              ) : (
                "Excluir promoção"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
