"use client";

import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Check, Loader2, PencilLine, Plus, Trash2, X } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  createItineraryCategoryAction,
  deleteItineraryCategoryAction,
  renameItineraryCategoryAction,
  reorderItineraryCategoriesAction,
  type ItineraryCategoryItem,
} from "@/app/admin/(protected)/roteiros/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ItineraryCategoriesPanelProps = {
  categories: (ItineraryCategoryItem & { count: number })[];
};

/**
 * "Divisórias" = seções da página /roteiros, na ordem daqui.
 * Criar, renomear, reordenar e excluir. Excluir não apaga roteiro.
 */
export function ItineraryCategoriesPanel({ categories }: ItineraryCategoriesPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  function run(action: () => Promise<{ ok: boolean; message: string }>, after?: () => void) {
    startTransition(async () => {
      const result = await action();

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      after?.();
      router.refresh();
    });
  }

  function move(index: number, delta: number) {
    const ids = categories.map((category) => category.id);
    const target = index + delta;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target]!, ids[index]!];
    run(() => reorderItineraryCategoriesAction(ids));
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm sm:p-5">
      <div className="space-y-1">
        <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground">Divisórias</h2>
        <p className="text-xs text-muted-foreground">
          Seções da página de roteiros, nesta ordem. Divisória sem roteiro publicado não aparece no site.
        </p>
      </div>

      {categories.length > 0 ? (
        <ul className="divide-y divide-border/60 rounded-xl border border-border/70">
          {categories.map((category, index) => (
            <li key={category.id} className="flex flex-wrap items-center gap-2 px-3 py-2">
              {editingId === category.id ? (
                <>
                  <Input
                    value={editingName}
                    onChange={(event) => setEditingName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        run(() => renameItineraryCategoryAction(category.id, editingName), () => setEditingId(null));
                      }
                      if (event.key === "Escape") setEditingId(null);
                    }}
                    className="h-9 max-w-xs rounded-lg"
                    autoFocus
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-lg"
                    onClick={() => run(() => renameItineraryCategoryAction(category.id, editingName), () => setEditingId(null))}
                    disabled={isPending}
                  >
                    <Check className="size-4" aria-hidden />
                    Salvar
                  </Button>
                  <Button type="button" size="sm" variant="ghost" className="rounded-lg" onClick={() => setEditingId(null)}>
                    <X className="size-4" aria-hidden />
                  </Button>
                </>
              ) : (
                <>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                    {category.name}
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      {category.count} roteiro{category.count === 1 ? "" : "s"}
                    </span>
                  </span>
                  <div className="flex items-center gap-1">
                    <Button type="button" size="icon-sm" variant="ghost" className="rounded-lg" aria-label="Subir" onClick={() => move(index, -1)} disabled={isPending || index === 0}>
                      <ArrowUp className="size-4" aria-hidden />
                    </Button>
                    <Button type="button" size="icon-sm" variant="ghost" className="rounded-lg" aria-label="Descer" onClick={() => move(index, 1)} disabled={isPending || index === categories.length - 1}>
                      <ArrowDown className="size-4" aria-hidden />
                    </Button>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      className="rounded-lg"
                      aria-label="Renomear"
                      onClick={() => {
                        setEditingId(category.id);
                        setEditingName(category.name);
                      }}
                      disabled={isPending}
                    >
                      <PencilLine className="size-4" aria-hidden />
                    </Button>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      className="rounded-lg text-destructive hover:text-destructive"
                      aria-label="Excluir divisória"
                      onClick={() => {
                        if (window.confirm(`Excluir a divisória "${category.name}"? Os roteiros continuam existindo.`)) {
                          run(() => deleteItineraryCategoryAction(category.id));
                        }
                      }}
                      disabled={isPending}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </Button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">Nenhuma divisória ainda. Ex.: Em destaque, Promoções, Férias de janeiro, Baixa temporada.</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              run(() => createItineraryCategoryAction(newName), () => setNewName(""));
            }
          }}
          placeholder="Nome da divisória"
          className="h-10 max-w-xs rounded-xl"
        />
        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-xl border-border/70"
          onClick={() => run(() => createItineraryCategoryAction(newName), () => setNewName(""))}
          disabled={isPending || !newName.trim()}
        >
          {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Plus className="size-4" aria-hidden />}
          Adicionar divisória
        </Button>
      </div>
    </div>
  );
}
