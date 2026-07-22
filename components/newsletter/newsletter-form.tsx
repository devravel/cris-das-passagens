"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import Link from "next/link";

import { BrazilianMobilePhoneInput } from "@/components/rei-da-copa/brazilian-mobile-phone-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { newsletterSectionContent } from "@/config/newsletter";
import {
  EMPTY_NEWSLETTER_SUBSCRIPTION_VALUES,
  newsletterSubscriptionSchema,
  type NewsletterSubscriptionInput,
} from "@/lib/newsletter/schemas";
import { cn } from "@/lib/utils";

type SubscriptionResponse = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  data?: {
    registrationNumber: number;
  };
};

export function NewsletterForm() {
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
        className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center shadow-sm"
        role="status"
        aria-live="polite"
      >
        <CheckCircle2
          className="mx-auto mb-3 size-10 text-emerald-600"
          aria-hidden
        />
        <p className="text-base font-medium text-foreground">
          {newsletterSectionContent.successTitle}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {newsletterSectionContent.successDescription}
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
        <label className="text-sm font-medium text-foreground" htmlFor="newsletter-name">
          Nome completo
        </label>
        <Input
          id="newsletter-name"
          type="text"
          autoComplete="name"
          placeholder="Digite seu nome e sobrenome"
          className="h-11 rounded-xl px-3"
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
        <label
          className="text-sm font-medium text-foreground"
          htmlFor="newsletter-email"
        >
          E-mail
        </label>
        <Input
          id="newsletter-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="seuemail@exemplo.com"
          className="h-11 rounded-xl px-3"
          aria-invalid={Boolean(form.formState.errors.email)}
          {...form.register("email")}
        />
        {form.formState.errors.email ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label
          className="text-sm font-medium text-foreground"
          htmlFor="newsletter-phone"
        >
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
              placeholder="Digite seu WhatsApp"
              className="h-11 rounded-xl px-3"
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
        className="h-11 w-full rounded-lg bg-brand px-6 text-sm font-semibold text-brand-foreground shadow-sm transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-px hover:bg-brand/90 hover:shadow-md active:translate-y-0 sm:w-auto"
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            {newsletterSectionContent.submittingLabel}
          </>
        ) : (
          <>
            <Mail className="size-4 shrink-0" aria-hidden />
            {newsletterSectionContent.submitLabel}
          </>
        )}
      </Button>

      <p className="text-xs leading-relaxed text-muted-foreground">
        {newsletterSectionContent.privacyNote}{" "}
        <Link
          href="/politica-de-privacidade"
          className="font-medium text-brand underline-offset-2 hover:underline"
        >
          Saiba mais
        </Link>
        .
      </p>
    </form>
  );
}
