"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, PencilLine, Plus, Star, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  deleteItineraryAction,
  setItineraryFeaturedAction,
  setItineraryPublishedAction,
} from "@/app/admin/(protected)/roteiros/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type ItineraryListItem = {
  id: string;
  title: string;
  slug: string;
  duration: string;
  published: boolean;
  featuredOnHomepage: boolean;
  categories: string[];
  updatedAt: string;
};

export function ItinerariesTable({ itineraries }: { itineraries: ItineraryListItem[] }) {
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

  function run(action: () => Promise<{ ok: boolean; message: string }>) {
    startTransition(async () => {
      const result = await action();

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setDeleteId(null);
      router.refresh();
    });
  }

  if (itineraries.length === 0) {
    return (
      <div className="rounded-2xl border border-border/70 bg-card/80 p-6 text-center shadow-sm">
        <p className="text-sm text-muted-foreground">Nenhum roteiro cadastrado ainda.</p>
        <Button asChild className="mt-4 rounded-xl">
          <Link href="/admin/roteiros/new">
            <Plus className="size-4" aria-hidden />
            Criar primeiro roteiro
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card/90 shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Roteiro</th>
              <th className="px-4 py-3 font-medium">Divisórias</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Homepage</th>
              <th className="px-4 py-3 font-medium">Atualizado</th>
              <th className="px-4 py-3 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {itineraries.map((item) => (
              <tr key={item.id} className="border-t border-border/70">
                <td className="px-4 py-3">
                  <div className="space-y-0.5">
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      /roteiros/{item.slug} · {item.duration}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {item.categories.length === 0 ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : (
                      item.categories.map((name) => (
                        <span key={name} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          {name}
                        </span>
                      ))
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                      item.published
                        ? "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                    onClick={() => run(() => setItineraryPublishedAction(item.id, !item.published))}
                    disabled={isPending}
                  >
                    {item.published ? "Publicado" : "Rascunho"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                      item.featuredOnHomepage
                        ? "bg-brand/15 text-brand hover:bg-brand/20"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    } ${!item.published ? "cursor-not-allowed opacity-60" : ""}`}
                    onClick={() => run(() => setItineraryFeaturedAction(item.id, !item.featuredOnHomepage))}
                    disabled={isPending || !item.published}
                    aria-label={item.featuredOnHomepage ? "Remover destaque da homepage" : "Destacar na homepage"}
                  >
                    <Star className={`size-3.5 ${item.featuredOnHomepage ? "fill-current" : ""}`} aria-hidden />
                    {item.featuredOnHomepage ? "Destaque" : "Normal"}
                  </button>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(item.updatedAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button asChild size="sm" variant="outline" className="rounded-lg">
                      <Link href={`/admin/roteiros/${item.id}/edit`}>
                        <PencilLine className="size-4" aria-hidden />
                        Editar
                      </Link>
                    </Button>
                    <Button size="sm" variant="destructive" className="rounded-lg" onClick={() => setDeleteId(item.id)} disabled={isPending}>
                      <Trash2 className="size-4" aria-hidden />
                      Excluir
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={Boolean(deleteId)} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Excluir roteiro?</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. A página do roteiro sai do ar na hora.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} className="rounded-lg">
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && run(() => deleteItineraryAction(deleteId))}
              className="rounded-lg"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Excluindo...
                </>
              ) : (
                "Excluir roteiro"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
