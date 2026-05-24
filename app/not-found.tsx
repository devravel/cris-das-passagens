import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, House, MessageCircle, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { contentLinks } from "@/config/content";
import { siteConfig } from "@/config/site";
import { createNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = createNoIndexMetadata({
  title: "Página não encontrada",
  description: "A página solicitada não foi encontrada.",
});

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <div className="mb-4 inline-flex size-11 items-center justify-center rounded-full bg-brand/10 text-brand">
        <TriangleAlert className="size-5" strokeWidth={1.75} aria-hidden />
      </div>

      <p className="text-sm font-semibold uppercase tracking-wider text-brand">404</p>
      <h1 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        Esta página ainda não foi construída
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Estamos evoluindo o site para trazer mais conteúdos em breve. Enquanto
        isso, nossa equipe pode te atender agora mesmo.
      </p>

      <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
        <Button asChild className="h-10 w-full rounded-lg bg-brand px-5 text-sm sm:w-auto">
          <Link href="/">
            <House className="size-4" strokeWidth={1.75} aria-hidden />
            Voltar para o início
          </Link>
        </Button>

        <Button asChild variant="outline" className="h-10 w-full rounded-lg px-5 text-sm sm:w-auto">
          <a href={contentLinks.whatsapp} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="size-4" strokeWidth={1.75} aria-hidden />
            Falar no WhatsApp
          </a>
        </Button>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Se preferir, ligue para <a className="font-medium text-foreground" href={siteConfig.phoneHref}>{siteConfig.phone}</a>.
      </p>

      <Link
        href="/"
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand transition-colors hover:text-brand/90"
      >
        <ArrowLeft className="size-4" strokeWidth={1.75} aria-hidden />
        Retornar
      </Link>
    </section>
  );
}
