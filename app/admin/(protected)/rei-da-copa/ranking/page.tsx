import type { Metadata } from "next";
import { Medal, Trophy } from "lucide-react";

import { RankingTable } from "@/components/admin/rei-da-copa/ranking-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getAdminReiDaCopaParticipants,
  getAdminReiDaCopaRanking,
} from "@/lib/rei-da-copa/admin-queries";

export const metadata: Metadata = {
  title: "Rei da Copa — Ranking | Cris das Passagens",
  description: "Gerencie o ranking manual da campanha Rei da Copa 2026.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ReiDaCopaRankingPage() {
  const [entries, participants] = await Promise.all([
    getAdminReiDaCopaRanking(),
    getAdminReiDaCopaParticipants(),
  ]);

  const leader = entries[0];

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-brand">Rei da Copa</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
          Ranking
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Atualize pontuação e posição manualmente. Use os atalhos +10, +20, +50 e +100.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="size-4 text-brand" aria-hidden />
              Participantes no ranking
            </CardTitle>
            <CardDescription>Total de posições cadastradas.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tracking-tight text-foreground">
            {entries.length}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Medal className="size-4 text-brand" aria-hidden />
              Líder atual
            </CardTitle>
            <CardDescription>Primeira posição do ranking.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              {leader ? leader.name : "—"}
            </p>
            <p className="text-xs text-muted-foreground">
              {leader ? `${leader.points} pontos` : "Nenhum participante ranqueado"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Ranking manual</CardTitle>
          <CardDescription>
            Posição, nome, Instagram e pontuação com edição administrativa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RankingTable entries={entries} participants={participants} />
        </CardContent>
      </Card>
    </section>
  );
}
