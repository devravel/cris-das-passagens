"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, CircleOff, Loader2, Plus, Trash2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  activateReiDaCopaOfficialKeywordAction,
  createReiDaCopaOfficialKeywordAction,
  deactivateReiDaCopaOfficialKeywordAction,
  deleteReiDaCopaOfficialKeywordAction,
} from "@/app/admin/(protected)/rei-da-copa/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  campaignKeywordCreateSchema,
  type CampaignKeywordCreateInput,
} from "@/lib/rei-da-copa/schemas";
import type { AdminReiDaCopaOfficialKeywordRow } from "@/lib/rei-da-copa/types";

type OfficialKeywordsPanelProps = {
  keywords: AdminReiDaCopaOfficialKeywordRow[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatKeywordValue(value: string) {
  return value.toLocaleUpperCase("pt-BR");
}

function statusClassName(isActive: boolean) {
  if (isActive) {
    return "bg-emerald-500/15 text-emerald-700";
  }

  return "bg-muted text-muted-foreground";
}

export function OfficialKeywordsPanel({ keywords }: OfficialKeywordsPanelProps) {
  const router = useRouter();
  const [isCreatePending, startCreateTransition] = useTransition();
  const [isActionPending, startActionTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<{
    id: string;
    type: "activate" | "deactivate" | "delete";
  } | null>(null);
  const [deleteKeywordId, setDeleteKeywordId] = useState<string | null>(null);

  const deleteKeyword = keywords.find((keyword) => keyword.id === deleteKeywordId);

  const form = useForm<CampaignKeywordCreateInput>({
    resolver: zodResolver(campaignKeywordCreateSchema),
    defaultValues: { value: "" },
    mode: "onBlur",
  });

  function onSubmit(values: CampaignKeywordCreateInput) {
    startCreateTransition(async () => {
      const result = await createReiDaCopaOfficialKeywordAction(values);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      form.reset({ value: "" });
      router.refresh();
    });
  }

  function handleActivate(id: string) {
    setPendingAction({ id, type: "activate" });

    startActionTransition(async () => {
      const result = await activateReiDaCopaOfficialKeywordAction(id);
      setPendingAction(null);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    });
  }

  function handleDeactivate(id: string) {
    setPendingAction({ id, type: "deactivate" });

    startActionTransition(async () => {
      const result = await deactivateReiDaCopaOfficialKeywordAction(id);
      setPendingAction(null);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!deleteKeywordId) {
      return;
    }

    setPendingAction({ id: deleteKeywordId, type: "delete" });

    startActionTransition(async () => {
      const result = await deleteReiDaCopaOfficialKeywordAction(deleteKeywordId);
      setPendingAction(null);
      setDeleteKeywordId(null);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    });
  }

  function isPendingFor(id: string, type: "activate" | "deactivate" | "delete") {
    return (
      isActionPending &&
      pendingAction?.id === id &&
      pendingAction.type === type
    );
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="flex-1 space-y-1.5">
          <label
            htmlFor="official-keyword-value"
            className="text-sm font-medium text-foreground"
          >
            Nova palavra-chave
          </label>
          <Controller
            name="value"
            control={form.control}
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <Input
                id="official-keyword-value"
                type="text"
                placeholder="Digite a palavra-chave da campanha"
                className="h-10 rounded-xl"
                aria-invalid={Boolean(form.formState.errors.value)}
                ref={ref}
                value={value}
                onBlur={onBlur}
                onChange={(event) =>
                  onChange(event.target.value.toLocaleUpperCase("pt-BR"))
                }
              />
            )}
          />
          {form.formState.errors.value ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.value.message}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Somente palavras-chave cadastradas aqui poderão ser enviadas pelos participantes.
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="h-10 rounded-xl"
          disabled={isCreatePending}
        >
          {isCreatePending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Cadastrando...
            </>
          ) : (
            <>
              <Plus className="size-4" aria-hidden />
              Cadastrar
            </>
          )}
        </Button>
      </form>

      {keywords.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border/70 px-4 py-6 text-sm text-muted-foreground">
          Nenhuma palavra-chave cadastrada. Adicione a primeira acima.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/70">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border/70 bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Palavra-chave</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Cadastrada em</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {keywords.map((keyword) => (
                <tr
                  key={keyword.id}
                  className={`border-b border-border/50 last:border-0 ${
                    keyword.isActive ? "" : "opacity-70"
                  }`}
                >
                  <td
                    className={`px-4 py-3 font-medium ${
                      keyword.isActive ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {formatKeywordValue(keyword.value)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClassName(keyword.isActive)}`}
                    >
                      {keyword.isActive ? "Ativa" : "Inativa"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(keyword.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {keyword.isActive ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 rounded-lg text-destructive hover:text-destructive"
                          disabled={isPendingFor(keyword.id, "deactivate")}
                          onClick={() => handleDeactivate(keyword.id)}
                        >
                          {isPendingFor(keyword.id, "deactivate") ? (
                            <Loader2 className="size-4 animate-spin" aria-hidden />
                          ) : (
                            <CircleOff className="size-4" aria-hidden />
                          )}
                          Desativar
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-lg"
                          disabled={isPendingFor(keyword.id, "activate")}
                          onClick={() => handleActivate(keyword.id)}
                        >
                          {isPendingFor(keyword.id, "activate") ? (
                            <Loader2 className="size-4 animate-spin" aria-hidden />
                          ) : (
                            <Check className="size-4" aria-hidden />
                          )}
                          Ativar
                        </Button>
                      )}

                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="h-8 rounded-lg"
                        disabled={isPendingFor(keyword.id, "delete")}
                        onClick={() => setDeleteKeywordId(keyword.id)}
                      >
                        {isPendingFor(keyword.id, "delete") ? (
                          <Loader2 className="size-4 animate-spin" aria-hidden />
                        ) : (
                          <Trash2 className="size-4" aria-hidden />
                        )}
                        Excluir
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog
        open={Boolean(deleteKeywordId)}
        onOpenChange={(open) => !open && setDeleteKeywordId(null)}
      >
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Excluir palavra-chave?</DialogTitle>
            <DialogDescription>
              {deleteKeyword
                ? `A palavra-chave "${formatKeywordValue(deleteKeyword.value)}" será removida permanentemente e não poderá mais ser utilizada na campanha.`
                : "A palavra-chave será removida permanentemente e não poderá mais ser utilizada na campanha."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteKeywordId(null)}
              className="rounded-lg"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="rounded-lg"
              disabled={isActionPending}
            >
              {isActionPending && pendingAction?.type === "delete" ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
