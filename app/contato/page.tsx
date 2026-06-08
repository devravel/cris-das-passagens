import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink, Mail, Phone } from "lucide-react";

import { MetaLeadAnchor } from "@/components/analytics/meta-lead-anchor";
import { Container } from "@/components/layout/container";
import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { brandPageBreadcrumbs } from "@/config/navigation";
import { Section } from "@/components/layout/section";
import { bodyTextClassName } from "@/components/layout/section-header";
import { Button } from "@/components/ui/button";
import { content, contentLinks } from "@/config/content";
import { getQuoteWhatsAppUrl } from "@/lib/coupon/whatsapp";
import { createMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

const contact = content.contact;

export const metadata: Metadata = createMetadata({
  title: "Contato",
  description:
    "Entre em contato com a Cris das Passagens. Solicite cotação de passagens, pacotes e hospedagem pelo WhatsApp ou telefone. Atendimento online em Osório — RS.",
  path: "/contato",
  keywords: [
    "contato Cris das Passagens",
    "cotação passagens",
    "agência de viagens",
    "WhatsApp",
    "Osório RS",
  ],
});

export default function ContatoPage() {
  return (
    <Section
      spacing="page"
      background="default"
      bordered
      aria-labelledby="contato-page-heading"
    >
      <PageBreadcrumb items={brandPageBreadcrumbs.contato} />

      <header className="mx-auto mb-10 max-w-3xl space-y-3 text-center sm:mb-12 lg:mb-14">
        <h1
          id="contato-page-heading"
          className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-[2.5rem] md:leading-tight"
        >
          Contato
        </h1>
        <p className={cn(bodyTextClassName, "text-center")}>
          Contate-nos e tire suas dúvidas ou faça uma cotação. <br />{" "}
          Nosso atendimento é online, com suporte do início ao fim da viagem.
        </p>
      </header>

      <Container size="narrow" padding="none">
        <div className="space-y-4 rounded-2xl border border-border/70 bg-card/90 p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold text-foreground">
            {contact.legalName}
          </p>

          <ul className="space-y-4" role="list">
            <li>
              <a
                href={contact.phoneHref}
                className="inline-flex items-start gap-3 text-sm text-foreground transition-colors hover:text-brand"
              >
                <Phone
                  className="mt-0.5 size-4 shrink-0 text-brand"
                  aria-hidden
                />
                <span>
                  <span className="block font-medium">Telefone</span>
                  <span className="text-muted-foreground">{contact.phone}</span>
                </span>
              </a>
            </li>

            <li>
              <a
                href={contact.emailHref}
                className="inline-flex items-start gap-3 text-sm text-foreground transition-colors hover:text-brand"
              >
                <Mail
                  className="mt-0.5 size-4 shrink-0 text-brand"
                  aria-hidden
                />
                <span>
                  <span className="block font-medium">Email</span>
                  <span className="text-muted-foreground">{contact.email}</span>
                </span>
              </a>
            </li>

            <li>
              <a
                href={contentLinks.googleBusinessProfile}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-start gap-3 text-sm text-foreground transition-colors hover:text-brand"
              >
                <ExternalLink
                  className="mt-0.5 size-4 shrink-0 text-brand"
                  aria-hidden
                />
                <span>
                  <span className="block font-medium">Perfil Google</span>
                  <span className="text-muted-foreground">
                    Avaliações e informações da empresa no Google
                  </span>
                </span>
              </a>
            </li>
          </ul>
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            asChild
            size="lg"
            className="h-11 rounded-lg bg-brand px-6 text-sm text-brand-foreground shadow-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-px hover:bg-brand/90 hover:shadow-md active:translate-y-0"
          >
            <MetaLeadAnchor
              href={getQuoteWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="gap-2"
              leadParams={{
                source: "contato_quote",
                content_name: "Faça uma cotação agora",
              }}
            >
              Faça uma cotação agora
              <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
            </MetaLeadAnchor>
          </Button>
        </div>

        <p className={cn(bodyTextClassName, "mt-6 text-center text-sm")}>
          Prefere explorar antes?{" "}
          <Link
            href="/pacotes"
            className="font-medium text-brand hover:underline"
          >
            Veja nossos pacotes
          </Link>{" "}
          ou{" "}
          <Link
            href="/sobre"
            className="font-medium text-brand hover:underline"
          >
            conheça nossa história
          </Link>
          .
        </p>
      </Container>
    </Section>
  );
}
