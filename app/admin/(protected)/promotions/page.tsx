import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Megaphone, Plus, Sparkles } from "lucide-react";

import { PromotionsGrid } from "@/components/admin/promotions-grid";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Admin Promoções | Cris das Passagens",
  description: "Gerencie promoções e campanhas no painel administrativo.",
  robots: {
    index: false,
    follow: false,
  },
};

type AdminPromotionsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminPromotionsPage({ searchParams }: AdminPromotionsPageProps) {
  const params = (await searchParams) ?? {};

  if (params.done === "1") {
    redirect("/admin/promotions");
  }

  const promotions = await prisma.promotion.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      image: true,
      title: true,
      link: true,
      active: true,
      createdAt: true,
    },
  });

  const activeCount = promotions.filter((promotion) => promotion.active).length;

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
            Promoções
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Controle campanhas com foco em impacto visual, conversão e facilidade de operação.
          </p>
        </div>
        <Button asChild className="rounded-xl">
          <Link href="/admin/promotions/new">
            <Plus className="size-4" aria-hidden />
            Nova promoção
          </Link>
        </Button>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="size-4 text-brand" aria-hidden />
              Total
            </CardTitle>
            <CardDescription>Campanhas cadastradas no painel.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tracking-tight text-foreground">
            {promotions.length}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-brand" aria-hidden />
              Ativas
            </CardTitle>
            <CardDescription>Promoções visíveis para visitantes.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tracking-tight text-foreground">
            {activeCount}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="size-4 text-brand" aria-hidden />
              Inativas
            </CardTitle>
            <CardDescription>Campanhas pausadas ou em preparação.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tracking-tight text-foreground">
            {promotions.length - activeCount}
          </CardContent>
        </Card>
      </div>

      <PromotionsGrid
        promotions={promotions.map((promotion) => ({
          ...promotion,
          createdAt: promotion.createdAt.toISOString(),
        }))}
      />
    </section>
  );
}
