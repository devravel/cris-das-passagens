"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { contentLinks } from "@/config/content";
import { siteConfig } from "@/config/site";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Unhandled global error:", error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body className="m-0 min-h-screen bg-background text-foreground antialiased">
        <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
          <div className="mb-4 inline-flex size-11 items-center justify-center rounded-full bg-brand/10 text-brand">
            <TriangleAlert className="size-5" strokeWidth={1.75} aria-hidden />
          </div>

          <p className="text-sm font-semibold uppercase tracking-wider text-brand">
            Falha inesperada
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Tivemos um problema para carregar o site
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Nossa equipe já pode te ajudar pelo WhatsApp enquanto o problema é
            normalizado.
          </p>

          <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
            <Button
              type="button"
              onClick={reset}
              className="h-10 w-full rounded-lg bg-brand px-5 text-sm sm:w-auto"
            >
              Tentar novamente
            </Button>

            <Button asChild variant="outline" className="h-10 w-full rounded-lg px-5 text-sm sm:w-auto">
              <a href={contentLinks.whatsapp} target="_blank" rel="noopener noreferrer">
                Falar no WhatsApp
              </a>
            </Button>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Telefone:{" "}
            <a className="font-medium text-foreground" href={siteConfig.phoneHref}>
              {siteConfig.phone}
            </a>
          </p>
        </main>
      </body>
    </html>
  );
}
