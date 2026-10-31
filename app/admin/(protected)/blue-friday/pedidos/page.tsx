import type { Metadata } from "next";
import Link from "next/link";

import { RequestsToolbar } from "@/components/admin/blue-friday/requests-toolbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BLUE_FRIDAY_CAMPAIGN_ENABLED } from "@/config/blue-friday-campaign";
import { toBlueFridayRequestRow } from "@/lib/blue-friday/format";
import { getBlueFridayAdminRanking, listBlueFridayRequests } from "@/lib/blue-friday/service";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blue Friday — Pedidos | Cris das Passagens",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ page?: string; q?: string; destino?: string; influenciador?: string }>;
};

export default async function BlueFridayRequestsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const search = params.q ?? "";
  const destinationKey = params.destino ?? "";
  // Vem do link na tela Ranking (contagem por influenciador).
  const influencerKey = params.influenciador ?? "";

  const [{ items, total, totalPages }, ranking] = await Promise.all([
    listBlueFridayRequests({
      page,
      search,
      destinationKey: destinationKey || undefined,
      influencerKey: influencerKey || undefined,
    }),
    getBlueFridayAdminRanking(),
  ]);
  const rows = items.map(toBlueFridayRequestRow);

  const pageHref = (target: number) => {
    const query = new URLSearchParams();
    if (search) query.set("q", search);
    if (destinationKey) query.set("destino", destinationKey);
    if (influencerKey) query.set("influenciador", influencerKey);
    if (target > 1) query.set("page", String(target));
    return query.size ? `?${query}` : "?";
  };

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-brand">Blue Friday</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">Pedidos</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Cada cadastro da página Blue Friday vira um pedido. O mesmo WhatsApp sempre recebe o mesmo nº de
          passaporte.
          {BLUE_FRIDAY_CAMPAIGN_ENABLED ? null : (
            <span className="mt-1 block font-medium text-amber-700">
              A campanha está desligada: a página pública não aparece e não recebe cadastros.
            </span>
          )}
        </p>
      </header>

      <Card className="rounded-2xl border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>{total} {total === 1 ? "pedido" : "pedidos"}</CardTitle>
          <CardDescription>Mais recentes primeiro. Clique no WhatsApp para chamar a pessoa.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RequestsToolbar
            search={search}
            destinationKey={destinationKey}
            destinationOptions={ranking.map((entry) => ({ value: entry.destinationKey, label: entry.destination }))}
            canExport={total > 0}
          />

          {influencerKey ? (
            <p className="text-sm text-muted-foreground">
              Só pedidos com o cupom do influenciador <strong className="text-foreground">{influencerKey}</strong>.{" "}
              <Link href="/admin/blue-friday/pedidos" className="text-brand hover:underline">
                Ver todos
              </Link>
            </p>
          ) : null}

          <div className="overflow-x-auto rounded-xl border border-border/70">
            <table className="w-full min-w-[1200px] text-left text-sm">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="px-3 py-3 font-medium">Nº</th>
                  <th className="px-3 py-3 font-medium">Nome / WhatsApp</th>
                  <th className="px-3 py-3 font-medium">Destino</th>
                  <th className="px-3 py-3 font-medium">Quando</th>
                  <th className="px-3 py-3 font-medium">Passageiros</th>
                  <th className="px-3 py-3 font-medium">Orçamento</th>
                  <th className="px-3 py-3 font-medium">Pagamento</th>
                  <th className="px-3 py-3 font-medium">Compraria por</th>
                  <th className="px-3 py-3 font-medium">Influenciador</th>
                  <th className="px-3 py-3 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">
                      Nenhum pedido encontrado.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id} className="border-t border-border/60 align-top text-foreground">
                      <td className="px-3 py-3 font-mono text-xs">{row.passport}</td>
                      <td className="px-3 py-3">
                        <p className="font-medium">{row.name}</p>
                        <a
                          href={row.whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-brand hover:underline"
                        >
                          {row.phone}
                        </a>
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-medium">{row.destination}</p>
                        <p className="text-xs text-muted-foreground">Saindo de {row.departureCity}</p>
                      </td>
                      <td className="px-3 py-3">{row.when}</td>
                      <td className="px-3 py-3">{row.passengers}</td>
                      <td className="px-3 py-3">{row.budget}</td>
                      <td className="px-3 py-3">{row.payment}</td>
                      <td className="px-3 py-3 tabular-nums">{row.targetPrice}</td>
                      <td className="px-3 py-3">{row.influencer}</td>
                      <td className="px-3 py-3 text-xs text-muted-foreground">{row.createdAt}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 ? (
            <nav className="flex items-center justify-between text-sm" aria-label="Paginação">
              <Link
                href={pageHref(page - 1)}
                aria-disabled={page <= 1}
                className={cn("rounded-lg border px-3 py-1.5", page <= 1 && "pointer-events-none opacity-40")}
              >
                Anterior
              </Link>
              <span className="text-muted-foreground">
                Página {page} de {totalPages}
              </span>
              <Link
                href={pageHref(page + 1)}
                aria-disabled={page >= totalPages}
                className={cn("rounded-lg border px-3 py-1.5", page >= totalPages && "pointer-events-none opacity-40")}
              >
                Próxima
              </Link>
            </nav>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
