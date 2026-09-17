import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheck, Map, Plus, Star } from "lucide-react";

import { ItinerariesTable } from "@/components/admin/itineraries-table";
import { ItineraryCategoriesPanel } from "@/components/admin/itinerary-categories-panel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FEATURED_HOME_ITINERARIES_LIMIT } from "@/lib/itinerary/constants";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Admin Roteiros | Cris das Passagens",
  description: "Gerencie os roteiros de viagem no painel administrativo.",
  robots: { index: false, follow: false },
};

export default async function AdminRoteirosPage() {
  const [itineraries, categories] = await Promise.all([
    prisma.itinerary.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        duration: true,
        published: true,
        featuredOnHomepage: true,
        updatedAt: true,
        categories: { select: { name: true }, orderBy: { order: "asc" } },
      },
    }),
    prisma.itineraryCategory.findMany({
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        order: true,
        _count: { select: { itineraries: true } },
      },
    }),
  ]);

  const stats = [
    {
      icon: Map,
      title: "Total de roteiros",
      description: "Cadastrados no painel.",
      value: itineraries.length,
    },
    {
      icon: CircleCheck,
      title: "Publicados",
      description: "Visíveis em /roteiros.",
      value: itineraries.filter((item) => item.published).length,
    },
    {
      icon: Star,
      title: "Destaques na homepage",
      description: `Seção de roteiros da home (máx. ${FEATURED_HOME_ITINERARIES_LIMIT}).`,
      value: itineraries.filter((item) => item.published && item.featuredOnHomepage).length,
    },
  ];

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
            Roteiros
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Viagens prontas com itinerário, hotéis e saídas. Organize em divisórias e
            escolha os destaques da home.
          </p>
        </div>
        <Button asChild className="rounded-xl">
          <Link href="/admin/roteiros/new">
            <Plus className="size-4" aria-hidden />
            Novo roteiro
          </Link>
        </Button>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map(({ icon: Icon, title, description, value }) => (
          <Card key={title} className="rounded-2xl border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className="size-4 text-brand" aria-hidden />
                {title}
              </CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="text-3xl font-semibold tracking-tight text-foreground">
              {value}
            </CardContent>
          </Card>
        ))}
      </div>

      <ItineraryCategoriesPanel
        categories={categories.map(({ _count, ...category }) => ({
          ...category,
          count: _count.itineraries,
        }))}
      />

      <ItinerariesTable
        itineraries={itineraries.map((item) => ({
          ...item,
          categories: item.categories.map((category) => category.name),
          updatedAt: item.updatedAt.toISOString(),
        }))}
      />
    </section>
  );
}
