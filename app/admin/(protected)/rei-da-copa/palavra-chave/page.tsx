import type { Metadata } from "next";
import { KeyRound, ListChecks } from "lucide-react";

import { OfficialKeywordsPanel } from "@/components/admin/rei-da-copa/official-keywords-panel";
import { PalavraChaveTable } from "@/components/admin/rei-da-copa/palavra-chave-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getAdminReiDaCopaKeywordSubmissions,
  getAdminReiDaCopaOfficialKeywords,
} from "@/lib/rei-da-copa/admin-queries";

export const metadata: Metadata = {
  title: "Rei da Copa — Palavra-chave | Cris das Passagens",
  description: "Valide envios de palavra-chave da campanha Rei da Copa 2026.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ReiDaCopaPalavraChavePage() {
  const [submissions, officialKeywords] = await Promise.all([
    getAdminReiDaCopaKeywordSubmissions(),
    getAdminReiDaCopaOfficialKeywords(),
  ]);
  const pendingCount = submissions.filter((submission) => submission.status === "PENDING").length;
  const approvedCount = submissions.filter((submission) => submission.status === "APPROVED").length;
  const activeKeywordCount = officialKeywords.filter((keyword) => keyword.isActive).length;

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-brand">Rei da Copa</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
          Palavra-chave
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Cadastre as palavras-chave oficiais da campanha e revise os envios dos participantes.
        </p>
      </header>

      <Card className="rounded-2xl border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Palavras-chave oficiais</CardTitle>
          <CardDescription>
            Apenas palavras-chave cadastradas aqui podem ser enviadas na página da campanha.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OfficialKeywordsPanel keywords={officialKeywords} />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="size-4 text-brand" aria-hidden />
              Total de envios
            </CardTitle>
            <CardDescription>Palavras-chave recebidas na campanha.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tracking-tight text-foreground">
            {submissions.length}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="size-4 text-brand" aria-hidden />
              Pendentes / válidas
            </CardTitle>
            <CardDescription>Envios aguardando validação e já aprovados.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm font-medium text-foreground">
            {pendingCount} pendentes · {approvedCount} válidas
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="size-4 text-brand" aria-hidden />
              Ativas no cadastro
            </CardTitle>
            <CardDescription>Palavras-chave disponíveis para envio público.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tracking-tight text-foreground">
            {activeKeywordCount}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Envios de palavra-chave</CardTitle>
          <CardDescription>
            Participante, telefone, Instagram, palavra enviada, data e status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PalavraChaveTable submissions={submissions} />
        </CardContent>
      </Card>
    </section>
  );
}
