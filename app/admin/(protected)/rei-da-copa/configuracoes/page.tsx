import type { Metadata } from "next";
import { Settings2 } from "lucide-react";

import { ConfiguracoesForm } from "@/components/admin/rei-da-copa/configuracoes-form";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAdminReiDaCopaSettings } from "@/lib/rei-da-copa/admin-queries";

export const metadata: Metadata = {
  title: "Rei da Copa — Configurações | Cris das Passagens",
  description: "Configure datas, prêmios e regulamento da campanha Rei da Copa 2026.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ReiDaCopaConfiguracoesPage() {
  const settings = await getAdminReiDaCopaSettings();

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-brand">Rei da Copa</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
          Configurações
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Defina o período da campanha, os prêmios e o regulamento exibido na página pública.
        </p>
      </header>

      <Card className="rounded-2xl border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="size-4 text-brand" aria-hidden />
            Campanha Rei da Copa 2026
          </CardTitle>
          <CardDescription>
            Datas, prêmios do pódio e texto do regulamento.
          </CardDescription>
        </CardHeader>
      </Card>

      <ConfiguracoesForm settings={settings} />
    </section>
  );
}
