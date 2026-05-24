"use client";

import Link from "next/link";
import { useEffect } from "react";
import { House, MessageCircle, RefreshCw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { contentLinks } from "@/config/content";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Unhandled route error:", error);
  }, [error]);

  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <div className="mb-4 inline-flex size-11 items-center justify-center rounded-full bg-brand/10 text-brand">
        <TriangleAlert className="size-5" strokeWidth={1.75} aria-hidden />
      </div>

      <p className="text-sm font-semibold uppercase tracking-wider text-brand">
        Ocorreu um erro
      </p>
      <h1 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        Não foi possível carregar esta página
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Pode ter sido uma falha temporária. Tente novamente ou fale com nosso
        time para continuar seu atendimento.
      </p>

      <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
        <Button
          type="button"
          onClick={reset}
          className="h-10 w-full rounded-lg bg-brand px-5 text-sm sm:w-auto"
        >
          <RefreshCw className="size-4" strokeWidth={1.75} aria-hidden />
          Tentar novamente
        </Button>

        <Button asChild variant="outline" className="h-10 w-full rounded-lg px-5 text-sm sm:w-auto">
          <Link href="/">
            <House className="size-4" strokeWidth={1.75} aria-hidden />
            Ir para o início
          </Link>
        </Button>

        <Button asChild variant="outline" className="h-10 w-full rounded-lg px-5 text-sm sm:w-auto">
          <a href={contentLinks.whatsapp} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="size-4" strokeWidth={1.75} aria-hidden />
            WhatsApp
          </a>
        </Button>
      </div>
    </section>
  );
}
