import type { Metadata } from "next";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getBlueFridayAdminRanking, getBlueFridayInfluencerRanking } from "@/lib/blue-friday/service";

export const metadata: Metadata = {
  title: "Blue Friday — Ranking | Cris das Passagens",
  robots: { index: false, follow: false },
};

export default async function BlueFridayRankingPage() {
  const [ranking, influencers] = await Promise.all([getBlueFridayAdminRanking(), getBlueFridayInfluencerRanking()]);

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-brand">Blue Friday</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">Ranking de destinos</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Pessoas diferentes por destino (a mesma pessoa pedindo o mesmo destino conta 1 vez). O site mostra só o
          top 10 dos destinos da lista de sugestões. Destinos &quot;fora da lista&quot; foram digitados pelo cliente: para
          levar um deles ao ranking público, adicione-o à lista em <code>config/blue-friday-campaign.ts</code>.
        </p>
      </header>

      <Card className="rounded-2xl border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>{ranking.length} destinos pedidos</CardTitle>
          <CardDescription>Clique no destino para ver os pedidos dele.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-border/70">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Destino</th>
                  <th className="px-4 py-3 font-medium text-right">Pessoas</th>
                  <th className="px-4 py-3 font-medium">Site</th>
                </tr>
              </thead>
              <tbody>
                {ranking.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      Nenhum pedido ainda.
                    </td>
                  </tr>
                ) : (
                  ranking.map((entry) => (
                    <tr key={entry.destinationKey} className="border-t border-border/60 text-foreground">
                      <td className="px-4 py-3 tabular-nums">{entry.position}º</td>
                      <td className="px-4 py-3 font-medium">
                        <Link
                          href={`/admin/blue-friday/pedidos?destino=${encodeURIComponent(entry.destinationKey)}`}
                          className="hover:text-brand hover:underline"
                        >
                          {entry.destination}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums">{entry.count}</td>
                      <td className="px-4 py-3 text-xs">
                        {entry.inList ? (
                          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-700">na lista</span>
                        ) : (
                          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-700">fora da lista</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Por influenciador</CardTitle>
          <CardDescription>
            Quem preencheu o cupom do influenciador. Pessoas diferentes por cupom (sem diferença de @, acento ou
            maiúscula). Clique para ver os pedidos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-border/70">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Influenciador</th>
                  <th className="px-4 py-3 font-medium text-right">Pessoas</th>
                  <th className="px-4 py-3 font-medium text-right">Pedidos</th>
                </tr>
              </thead>
              <tbody>
                {influencers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                      Nenhum pedido com cupom de influenciador ainda.
                    </td>
                  </tr>
                ) : (
                  influencers.map((entry) => (
                    <tr key={entry.influencerKey} className="border-t border-border/60 text-foreground">
                      <td className="px-4 py-3 font-medium">
                        <Link
                          href={`/admin/blue-friday/pedidos?influenciador=${encodeURIComponent(entry.influencerKey)}`}
                          className="hover:text-brand hover:underline"
                        >
                          {entry.influencer}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums">{entry.people}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{entry.requests}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
