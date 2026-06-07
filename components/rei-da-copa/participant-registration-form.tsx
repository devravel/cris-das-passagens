"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { BrazilianMobilePhoneInput } from "@/components/rei-da-copa/brazilian-mobile-phone-input";
import { reiDaCopaCampaignButtonClassName } from "@/components/rei-da-copa/rei-da-copa-hero-cta";
import { SoccerBallIcon } from "@/components/rei-da-copa/soccer-ball-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  EMPTY_PARTICIPANT_REGISTRATION_VALUES,
  participantRegistrationSchema,
  type ParticipantRegistrationInput,
} from "@/lib/rei-da-copa/schemas";
import {
  isValidParticipantInstagram,
  normalizeParticipantInstagram,
} from "@/lib/rei-da-copa/utils";
import { cn } from "@/lib/utils";

type RegistrationResponse = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  data?: {
    registrationNumber: number;
  };
};

type SuccessState = {
  registrationNumber: number;
};

export function ParticipantRegistrationForm() {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState<SuccessState | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<ParticipantRegistrationInput>({
    resolver: zodResolver(participantRegistrationSchema),
    defaultValues: EMPTY_PARTICIPANT_REGISTRATION_VALUES,
    mode: "onSubmit",
    reValidateMode: "onBlur",
  });

  const instagramValue = form.watch("instagram");
  const instagramHandle = normalizeParticipantInstagram(instagramValue ?? "");
  const hasValidInstagramHandle = isValidParticipantInstagram(
    instagramValue ?? "",
  );

  function onSubmit(values: ParticipantRegistrationInput) {
    setSubmitError(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/rei-da-copa/participants", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        const result = (await response.json()) as RegistrationResponse;

        if (!response.ok || !result.ok || !result.data) {
          if (result.fieldErrors) {
            for (const [field, errors] of Object.entries(result.fieldErrors)) {
              const firstError = errors?.[0];
              if (!firstError) continue;
              form.setError(field as keyof ParticipantRegistrationInput, {
                message: firstError,
              });
            }
          }

          setSubmitError(
            result.error ??
              "Não foi possível concluir a inscrição agora. Tente novamente.",
          );
          return;
        }

        setSuccess({ registrationNumber: result.data.registrationNumber });
        form.reset(EMPTY_PARTICIPANT_REGISTRATION_VALUES);
      } catch {
        setSubmitError(
          "Erro de conexão. Verifique sua internet e tente novamente.",
        );
      }
    });
  }

  if (success) {
    return (
      <div
        className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center shadow-sm"
        role="status"
        aria-live="polite"
      >
        <CheckCircle2
          className="mx-auto mb-3 size-10 text-emerald-600"
          aria-hidden
        />
        <p className="text-base font-medium text-foreground">
          Inscrição realizada com sucesso.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Seu número de inscrição é{" "}
          <span className="font-semibold text-foreground">
            #{success.registrationNumber}
          </span>
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-5"
      noValidate
    >
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground" htmlFor="name">
          NOME COMPLETO
        </label>
        <Input
          id="name"
          type="text"
          autoComplete="name"
          placeholder="Digite seu nome e sobrenome"
          className="h-10 rounded-xl px-3"
          aria-invalid={Boolean(form.formState.errors.name)}
          {...form.register("name")}
        />
        {form.formState.errors.name ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.name.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground" htmlFor="phone">
          TELEFONE
        </label>
        <Controller
          name="phone"
          control={form.control}
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <BrazilianMobilePhoneInput
              id="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="Digite seu WhatsApp"
              className="h-10 rounded-xl px-3"
              aria-invalid={Boolean(form.formState.errors.phone)}
              getInputRef={ref}
              value={value}
              onBlur={onBlur}
              onValueChange={(values) => onChange(values.formattedValue)}
            />
          )}
        />
        {form.formState.errors.phone ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.phone.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label
          className="text-sm font-medium text-foreground"
          htmlFor="instagram"
        >
          INSTAGRAM
        </label>
        <Controller
          name="instagram"
          control={form.control}
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <div
              className={cn(
                "flex h-10 items-center overflow-hidden rounded-xl border border-input bg-transparent transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30",
                form.formState.errors.instagram &&
                  "border-destructive ring-3 ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
              )}
            >
              <span
                className="pl-3 text-sm text-muted-foreground select-none"
                aria-hidden
              >
                @
              </span>
              <Input
                id="instagram"
                ref={ref}
                type="text"
                autoComplete="username"
                autoCapitalize="off"
                spellCheck={false}
                placeholder="seuusuario"
                value={value}
                onBlur={onBlur}
                onChange={(event) =>
                  onChange(normalizeParticipantInstagram(event.target.value))
                }
                className="h-full rounded-none rounded-r-xl border-0 bg-transparent px-2 shadow-none focus-visible:border-transparent focus-visible:ring-0"
                aria-invalid={Boolean(form.formState.errors.instagram)}
              />
            </div>
          )}
        />
        {form.formState.errors.instagram ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.instagram.message}
          </p>
        ) : hasValidInstagramHandle ? (
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs">
            <p className="text-muted-foreground">
              O usuário digitado deve ser um perfil real do Instagram, senão os
              pontos não serão contabilizados.
            </p>
            <a
              href={`https://www.instagram.com/${instagramHandle}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-brand hover:underline"
            >
              Ver perfil
            </a>
          </div>
        ) : null}
      </div>

      <div
        aria-live="polite"
        className={cn(
          "min-h-5 text-sm text-destructive transition-opacity",
          submitError ? "opacity-100" : "opacity-0",
        )}
      >
        {submitError ?? " "}
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={isPending}
        className={cn(reiDaCopaCampaignButtonClassName, "relative rounded-lg")}
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Enviando inscrição...
          </>
        ) : (
          <>
            <span
              className="rei-da-copa-ball-sweep pointer-events-none absolute top-1/2 hidden w-6 -translate-y-1/2 opacity-0 md:block"
              aria-hidden
            >
              <SoccerBallIcon className="size-6" />
            </span>
            <SoccerBallIcon
              className="relative z-10 size-4 shrink-0"
              aria-hidden
            />
            <span className="relative z-10">PARTICIPAR</span>
          </>
        )}
      </Button>
    </form>
  );
}
