"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  createReiDaCopaOfficialKeywordAction,
  deactivateReiDaCopaOfficialKeywordAction,
} from "@/app/admin/(protected)/rei-da-copa/actions";
import { Button } from "@/components/ui/button";
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

export function OfficialKeywordsPanel({ keywords }: OfficialKeywordsPanelProps) {
  const router = useRouter();
  const [isCreatePending, startCreateTransition] = useTransition();
  const [isDeactivatePending, startDeactivateTransition] = useTransition();
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);

  const activeKeywords = useMemo(
    () => keywords.filter((keyword) => keyword.isActive),
    [keywords],
  );

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

  function handleDeactivate(id: string) {
    setDeactivatingId(id);

    startDeactivateTransition(async () => {
      const result = await deactivateReiDaCopaOfficialKeywordAction(id);
      setDeactivatingId(null);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    });
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

      {activeKeywords.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border/70 px-4 py-6 text-sm text-muted-foreground">
          Nenhuma palavra-chave ativa cadastrada. Adicione a primeira acima.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/70">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border/70 bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Palavra-chave</th>
                <th className="px-4 py-3 font-medium">Cadastrada em</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {activeKeywords.map((keyword) => (
                <tr key={keyword.id} className="border-b border-border/50 last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{keyword.value}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(keyword.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-lg text-destructive hover:text-destructive"
                      disabled={isDeactivatePending && deactivatingId === keyword.id}
                      onClick={() => handleDeactivate(keyword.id)}
                    >
                      {isDeactivatePending && deactivatingId === keyword.id ? (
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                      ) : (
                        <Trash2 className="size-4" aria-hidden />
                      )}
                      Desativar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
