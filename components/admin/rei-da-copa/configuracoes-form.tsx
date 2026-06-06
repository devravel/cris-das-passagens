"use client";

import { useMemo, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { updateReiDaCopaSettingsAction } from "@/app/admin/(protected)/rei-da-copa/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  campaignSettingsSchema,
  type CampaignSettingsInput,
} from "@/lib/rei-da-copa/schemas";
import type { ReiDaCopaSettingsEntity } from "@/lib/rei-da-copa/types";

type ConfiguracoesFormProps = {
  settings: ReiDaCopaSettingsEntity;
};

export function ConfiguracoesForm({ settings }: ConfiguracoesFormProps) {
  const [isPending, startTransition] = useTransition();

  const initialValues = useMemo<CampaignSettingsInput>(
    () => ({
      startDate: settings.startDate ?? "",
      endDate: settings.endDate ?? "",
      firstPlacePrize: settings.firstPlacePrize ?? "",
      secondPlacePrize: settings.secondPlacePrize ?? "",
      thirdPlacePrize: settings.thirdPlacePrize ?? "",
      regulation: settings.regulation ?? "",
    }),
    [settings],
  );

  const form = useForm<CampaignSettingsInput>({
    resolver: zodResolver(campaignSettingsSchema),
    defaultValues: initialValues,
    values: initialValues,
    mode: "onBlur",
  });

  function onSubmit(values: CampaignSettingsInput) {
    startTransition(async () => {
      const result = await updateReiDaCopaSettingsAction(values);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
    });
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6 rounded-2xl border border-border/70 bg-card/90 p-6 shadow-sm"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="startDate" className="mb-1.5 block text-sm font-medium text-foreground">
            Data início
          </label>
          <Input
            id="startDate"
            type="date"
            className="h-10 rounded-xl"
            {...form.register("startDate")}
          />
          {form.formState.errors.startDate ? (
            <p className="mt-1 text-xs text-destructive">
              {form.formState.errors.startDate.message}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="endDate" className="mb-1.5 block text-sm font-medium text-foreground">
            Data fim
          </label>
          <Input
            id="endDate"
            type="date"
            className="h-10 rounded-xl"
            {...form.register("endDate")}
          />
          {form.formState.errors.endDate ? (
            <p className="mt-1 text-xs text-destructive">
              {form.formState.errors.endDate.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4">
        <div>
          <label
            htmlFor="firstPlacePrize"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Prêmio primeiro lugar
          </label>
          <Input
            id="firstPlacePrize"
            placeholder="Ex.: Pacote para a final da Copa"
            className="h-10 rounded-xl"
            {...form.register("firstPlacePrize")}
          />
        </div>

        <div>
          <label
            htmlFor="secondPlacePrize"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Prêmio segundo lugar
          </label>
          <Input
            id="secondPlacePrize"
            placeholder="Ex.: Voucher de viagem"
            className="h-10 rounded-xl"
            {...form.register("secondPlacePrize")}
          />
        </div>

        <div>
          <label
            htmlFor="thirdPlacePrize"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Prêmio terceiro lugar
          </label>
          <Input
            id="thirdPlacePrize"
            placeholder="Ex.: Desconto em pacote"
            className="h-10 rounded-xl"
            {...form.register("thirdPlacePrize")}
          />
        </div>

        <div>
          <label htmlFor="regulation" className="mb-1.5 block text-sm font-medium text-foreground">
            Regulamento
          </label>
          <Textarea
            id="regulation"
            rows={12}
            placeholder="Descreva as regras da campanha Rei da Copa 2026..."
            className="rounded-xl"
            {...form.register("regulation")}
          />
          {form.formState.errors.regulation ? (
            <p className="mt-1 text-xs text-destructive">
              {form.formState.errors.regulation.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="rounded-xl" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Salvando...
            </>
          ) : (
            "Salvar configurações"
          )}
        </Button>
      </div>
    </form>
  );
}
