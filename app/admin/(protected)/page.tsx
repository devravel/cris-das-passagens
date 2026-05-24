import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Megaphone, ShieldCheck } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Admin | Cris das Passagens",
  description: "Dashboard administrativo para gestao de conteudo e promocoes.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminHomePage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
          Bem-vindo ao painel
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Gerencie os principais recursos do site com foco em agilidade, consistencia e
          seguranca operacional.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-4 text-brand" aria-hidden />
              Conteudo do blog
            </CardTitle>
            <CardDescription>Crie, publique e atualize artigos em minutos.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Fluxo pronto para acelerar atualizacoes editoriais sem perder padrao visual.
          </CardContent>
          <CardContent>
            <Button asChild variant="outline" className="rounded-xl border-border/70">
              <Link href="/admin/blogs">Acessar blogs</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="size-4 text-brand" aria-hidden />
              Promocoes em destaque
            </CardTitle>
            <CardDescription>Atualize campanhas e links com controle total.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Mantenha ofertas relevantes e melhore a conversao com ajustes rapidos.
          </CardContent>
          <CardContent>
            <Button asChild variant="outline" className="rounded-xl border-border/70">
              <Link href="/admin/promotions">Acessar promotions</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 shadow-sm sm:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-brand" aria-hidden />
              Sessao protegida
            </CardTitle>
            <CardDescription>Autenticacao JWT com cookie seguro.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Rotas `/admin` sao protegidas automaticamente por middleware e validacao server-side.
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
