"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import Link from "next/link";

import { BrazilianMobilePhoneInput } from "@/components/rei-da-copa/brazilian-mobile-phone-input";
import { CtaButton } from "@/components/ui/cta-button";
import { Input } from "@/components/ui/input";
import { newsletterSectionContent } from "@/config/newsletter";
import {
  EMPTY_NEWSLETTER_SUBSCRIPTION_VALUES,
  newsletterSubscriptionSchema,
  type NewsletterSubscriptionInput,
} from "@/lib/newsletter/schemas";
import { cn } from "@/lib/utils";

/** Campo de vidro sobre a foto escura — a mesma cor da faixa, sem card. */
const newsletterInputClassName =
  "h-12 rounded-xl border-white/20 bg-white/10 px-4 text-base text-white backdrop-blur-sm placeholder:text-white/55 focus-visible:border-brand-cyan/70 focus-visible:ring-brand-cyan/30 aria-invalid:border-red-300 aria-invalid:ring-red-300/25 sm:h-13";

const newsletterErrorClassName = "mt-1.5 text-left text-xs text-red-300";

type SubscriptionResponse = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  data?: {
    registrationNumber: number;
  };
};

export function NewsletterForm({ className }: { className?: string }) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<NewsletterSubscriptionInput>({
    resolver: zodResolver(newsletterSubscriptionSchema),
    defaultValues: EMPTY_NEWSLETTER_SUBSCRIPTION_VALUES,
    mode: "onSubmit",
    reValidateMode: "onBlur",
  });

  function onSubmit(values: NewsletterSubscriptionInput) {
    setSubmitError(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/newsletter/subscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        const result = (await response.json()) as SubscriptionResponse;

        if (!response.ok || !result.ok || !result.data) {
          if (result.fieldErrors) {
            for (const [field, errors] of Object.entries(result.fieldErrors)) {
              const firstError = errors?.[0];
              if (!firstError) continue;
              form.setError(field as keyof NewsletterSubscriptionInput, {
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

        setSuccess(true);
        form.reset(EMPTY_NEWSLETTER_SUBSCRIPTION_VALUES);
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
        className="mx-auto max-w-md rounded-2xl bg-white/10 p-6 text-center ring-1 ring-white/20 backdrop-blur-sm"
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 className="mx-auto mb-3 size-10 text-emerald-300" aria-hidden />
        <p className="text-base font-medium text-white">
          {newsletterSectionContent.successTitle}
        </p>
        <p className="mt-2 text-sm text-white/75">
          {newsletterSectionContent.successDescription}
        </p>
      </div>
    );
  }

  const errors = form.formState.errors;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={cn("mx-auto max-w-4xl", className)}
      noValidate
    >
      {/* Uma linha só no desktop: nome | e-mail | WhatsApp | botão. */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.1fr_1.2fr_1fr_auto]">
        <div>
          <label className="sr-only" htmlFor="newsletter-name">
            Nome completo
          </label>
          <Input
            id="newsletter-name"
            type="text"
            autoComplete="name"
            placeholder="Seu nome"
            className={newsletterInputClassName}
            aria-invalid={Boolean(errors.name)}
            {...form.register("name")}
          />
          {errors.name ? <p className={newsletterErrorClassName}>{errors.name.message}</p> : null}
        </div>

        <div>
          <label className="sr-only" htmlFor="newsletter-email">
            E-mail
          </label>
          <Input
            id="newsletter-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="seuemail@exemplo.com"
            className={newsletterInputClassName}
            aria-invalid={Boolean(errors.email)}
            {...form.register("email")}
          />
          {errors.email ? <p className={newsletterErrorClassName}>{errors.email.message}</p> : null}
        </div>

        <div>
          <label className="sr-only" htmlFor="newsletter-phone">
            WhatsApp
          </label>
          <Controller
            name="phone"
            control={form.control}
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <BrazilianMobilePhoneInput
                id="newsletter-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="Seu WhatsApp"
                className={newsletterInputClassName}
                aria-invalid={Boolean(errors.phone)}
                getInputRef={ref}
                value={value}
                onBlur={onBlur}
                onValueChange={(values) => onChange(values.formattedValue)}
              />
            )}
          />
          {errors.phone ? <p className={newsletterErrorClassName}>{errors.phone.message}</p> : null}
        </div>

        <CtaButton
          type="submit"
          disabled={isPending}
          arrow={false}
          className="w-full sm:col-span-2 lg:col-span-1 lg:w-auto"
          label={
            isPending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                {newsletterSectionContent.submittingLabel}
              </span>
            ) : (
              newsletterSectionContent.submitLabel
            )
          }
        />
      </div>

      {submitError ? (
        <p aria-live="polite" className="mt-3 text-center text-sm text-red-300">
          {submitError}
        </p>
      ) : null}

      <p className="mt-4 text-center text-xs leading-relaxed text-white/60">
        {newsletterSectionContent.privacyNote}{" "}
        <Link
          href="/politica-de-privacidade"
          className="font-medium text-white/85 underline-offset-2 hover:underline"
        >
          Saiba mais
        </Link>
        .
      </p>
    </form>
  );
}
