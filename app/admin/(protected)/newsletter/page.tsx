import type { Metadata } from "next";
import { ClipboardList, Database, Mail, Users } from "lucide-react";

import { SubscribersTable } from "@/components/admin/newsletter/subscribers-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NEWSLETTER_INTERNAL_NOTIFICATION_EMAIL } from "@/lib/newsletter/constants";
import { getAdminNewsletterSubscribers } from "@/lib/newsletter/admin-queries";

function formatInscriptionDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}

export const metadata: Metadata = {
  title: "Newsletter | Cris das Passagens",
  description: "Gerencie inscritos da newsletter do site.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NewsletterAdminPage() {
  const subscribers = await getAdminNewsletterSubscribers();

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-brand">
          Leads
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
          Newsletter
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Lista completa de inscritos na newsletter salvos no banco de dados.
        </p>
      </header>

      <Card className="rounded-2xl border-brand/20 bg-brand/5 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Database className="size-4 text-brand" aria-hidden />
            Fonte oficial das inscrições
          </CardTitle>
          <CardDescription>
            Toda inscrição concluída na landing page é registrada aqui
            automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Avisos de novas inscrições são enviados para{" "}
          <span className="font-medium text-foreground">
            {NEWSLETTER_INTERNAL_NOTIFICATION_EMAIL}
          </span>
          . <br />O cadastro do inscrito nunca depende desse envio.
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-4 text-brand" aria-hidden />
              Total de inscritos
            </CardTitle>
            <CardDescription>
              Contatos cadastrados na newsletter.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tracking-tight text-foreground">
            {subscribers.length}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="size-4 text-brand" aria-hidden />
              Última inscrição
            </CardTitle>
            <CardDescription>Data da inscrição mais recente.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm font-medium text-foreground">
            {subscribers[0]
              ? formatInscriptionDate(subscribers[0].createdAt)
              : "—"}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="size-4 text-brand" aria-hidden />
            Lista de inscritos
          </CardTitle>
          <CardDescription>
            Número, nome, e-mail, telefone e data de cadastro (horário de
            Brasília). Use a busca ou exporte em CSV.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SubscribersTable subscribers={subscribers} />
        </CardContent>
      </Card>
    </section>
  );
}
