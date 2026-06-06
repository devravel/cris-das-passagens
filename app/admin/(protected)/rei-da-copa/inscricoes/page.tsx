import type { Metadata } from "next";
import { ClipboardList, Database, Trophy, Users } from "lucide-react";

import { InscricoesTable } from "@/components/admin/rei-da-copa/inscricoes-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { REI_DA_COPA_INTERNAL_NOTIFICATION_EMAIL } from "@/lib/rei-da-copa/constants";
import { getAdminReiDaCopaParticipants } from "@/lib/rei-da-copa/admin-queries";

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
  title: "Rei da Copa — Inscrições | Cris das Passagens",
  description: "Gerencie inscrições da campanha Rei da Copa 2026.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ReiDaCopaInscricoesPage() {
  const participants = await getAdminReiDaCopaParticipants();

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-brand">
          Rei da Copa
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
          Inscrições
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Lista completa de inscrições salvas no banco de dados.
        </p>
      </header>

      <Card className="rounded-2xl border-brand/20 bg-brand/5 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Database className="size-4 text-brand" aria-hidden />
            Fonte oficial das inscrições
          </CardTitle>
          <CardDescription>
            Toda inscrição concluída na página pública é registrada aqui
            automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Avisos de novas inscrições são enviados para{" "}
          <span className="font-medium text-foreground">
            {REI_DA_COPA_INTERNAL_NOTIFICATION_EMAIL}
          </span>
          . <br />O cadastro do participante nunca depende desse envio.
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-4 text-brand" aria-hidden />
              Total de inscrições
            </CardTitle>
            <CardDescription>
              Participantes cadastrados na campanha.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tracking-tight text-foreground">
            {participants.length}
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
            {participants[0]
              ? formatInscriptionDate(participants[0].createdAt)
              : "—"}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="size-4 text-brand" aria-hidden />
            Lista de inscrições
          </CardTitle>
          <CardDescription>
            Número, nome, telefone, Instagram e data de cadastro (horário de
            Brasília). Use a busca ou exporte em CSV.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InscricoesTable participants={participants} />
        </CardContent>
      </Card>
    </section>
  );
}
