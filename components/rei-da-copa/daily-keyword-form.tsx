"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { BrazilianMobilePhoneInput } from "@/components/rei-da-copa/brazilian-mobile-phone-input";
import {
  reiDaCopaCampaignButtonClassName,
  reiDaCopaCampaignLinkClassName,
} from "@/components/rei-da-copa/rei-da-copa-hero-cta";
import { SoccerBallIcon } from "@/components/rei-da-copa/soccer-ball-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  REI_DA_COPA_KEYWORD_NOT_FOUND_MESSAGE,
  REI_DA_COPA_PARTICIPANT_NOT_FOUND_MESSAGE,
} from "@/lib/rei-da-copa/constants";
import {
  dailyKeywordSubmissionSchema,
  EMPTY_DAILY_KEYWORD_SUBMISSION_VALUES,
  type DailyKeywordSubmissionInput,
} from "@/lib/rei-da-copa/schemas";
import { cn } from "@/lib/utils";

type KeywordResponse = {
  ok: boolean;
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export function DailyKeywordForm() {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<DailyKeywordSubmissionInput>({
    resolver: zodResolver(dailyKeywordSubmissionSchema),
    defaultValues: EMPTY_DAILY_KEYWORD_SUBMISSION_VALUES,
    mode: "onSubmit",
    reValidateMode: "onBlur",
  });

  function onSubmit(values: DailyKeywordSubmissionInput) {
    setSubmitError(null);
    setSuccess(false);

    startTransition(async () => {
      try {
        const response = await fetch("/api/rei-da-copa/palavra-chave", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        const result = (await response.json()) as KeywordResponse;

        if (!response.ok || !result.ok) {
          let hasFieldErrors = false;

          if (result.fieldErrors) {
            for (const [field, errors] of Object.entries(result.fieldErrors)) {
              const firstError = errors?.[0];
              if (!firstError) continue;
              hasFieldErrors = true;
              form.setError(field as keyof DailyKeywordSubmissionInput, {
                message: firstError,
              });
            }
          }

          setSubmitError(
            hasFieldErrors
              ? null
              : (result.error ??
                  "Não foi possível enviar a palavra-chave agora. Tente novamente."),
          );
          return;
        }

        setSuccess(true);
        form.reset(EMPTY_DAILY_KEYWORD_SUBMISSION_VALUES);
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
          Palavra-chave enviada com sucesso.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Sua submissão foi registrada e será validada pela equipe da campanha.
        </p>
      </div>
    );
  }

  const showRegistrationHint =
    submitError === REI_DA_COPA_PARTICIPANT_NOT_FOUND_MESSAGE ||
    form.formState.errors.phone?.message ===
      REI_DA_COPA_PARTICIPANT_NOT_FOUND_MESSAGE;

  const showKeywordHint =
    submitError === REI_DA_COPA_KEYWORD_NOT_FOUND_MESSAGE ||
    form.formState.errors.keyword?.message ===
      REI_DA_COPA_KEYWORD_NOT_FOUND_MESSAGE;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-5"
      noValidate
    >
      <div className="space-y-1.5">
        <label
          className="text-sm font-medium text-foreground"
          htmlFor="keyword-phone"
        >
          Telefone
        </label>
        <Controller
          name="phone"
          control={form.control}
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <BrazilianMobilePhoneInput
              id="keyword-phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="(XX) XXXXX-XXXX"
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
          htmlFor="keyword"
        >
          Palavra-chave
        </label>
        <Controller
          name="keyword"
          control={form.control}
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <Input
              id="keyword"
              type="text"
              placeholder="Digite a palavra-chave do dia"
              className="h-10 rounded-xl px-3"
              aria-invalid={Boolean(form.formState.errors.keyword)}
              ref={ref}
              value={value}
              onBlur={onBlur}
              onChange={(event) =>
                onChange(event.target.value.toLocaleUpperCase("pt-BR"))
              }
            />
          )}
        />
        {form.formState.errors.keyword ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.keyword.message}
          </p>
        ) : null}
      </div>

      <div
        aria-live="polite"
        className={cn(
          "min-h-5 text-sm transition-opacity",
          submitError ? "text-destructive opacity-100" : "opacity-0",
        )}
      >
        {submitError ?? " "}
      </div>

      {showRegistrationHint ? (
        <p className="text-sm text-muted-foreground">
          Ainda não está inscrito? Se inscreva{" "}
          <a href="#inscricao" className={reiDaCopaCampaignLinkClassName}>
            aqui
          </a>
          .
        </p>
      ) : null}

      {showKeywordHint ? (
        <p className="text-sm text-muted-foreground">
          Confira a palavra-chave divulgada na campanha e tente novamente com
          atenção.
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        disabled={isPending}
        className={cn(reiDaCopaCampaignButtonClassName, "relative rounded-lg")}
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Enviando palavra-chave...
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
            <span className="relative z-10">Enviar palavra-chave</span>
          </>
        )}
      </Button>
    </form>
  );
}
