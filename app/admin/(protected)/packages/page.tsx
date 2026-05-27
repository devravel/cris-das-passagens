import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Package, Plus, Star } from "lucide-react";

import { PackagesGrid } from "@/components/admin/packages-grid";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAdminPackages } from "@/lib/package/queries";

export const metadata: Metadata = {
  title: "Admin Pacotes | Cris das Passagens",
  description: "Gerencie pacotes turísticos premium no painel administrativo.",
  robots: {
    index: false,
    follow: false,
  },
};

type AdminPackagesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminPackagesPage({ searchParams }: AdminPackagesPageProps) {
  const params = (await searchParams) ?? {};

  if (params.done === "1") {
    redirect("/admin/packages");
  }

  const packages = await getAdminPackages();
  const activeCount = packages.filter((pkg) => pkg.active).length;
  const featuredCount = packages.filter((pkg) => pkg.featured).length;

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
            Pacotes turísticos
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Cadastre pacotes premium com cards padronizados gerados automaticamente pelo sistema.
          </p>
        </div>
        <Button asChild className="rounded-xl">
          <Link href="/admin/packages/new">
            <Plus className="size-4" aria-hidden />
            Novo pacote
          </Link>
        </Button>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="size-4 text-brand" aria-hidden />
              Total
            </CardTitle>
            <CardDescription>Pacotes cadastrados no painel.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tracking-tight text-foreground">
            {packages.length}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-brand" aria-hidden />
              Ativos
            </CardTitle>
            <CardDescription>Pacotes visíveis para visitantes.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tracking-tight text-foreground">
            {activeCount}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="size-4 text-brand" aria-hidden />
              Destaques
            </CardTitle>
            <CardDescription>Pacotes marcados como destaque.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tracking-tight text-foreground">
            {featuredCount}
          </CardContent>
        </Card>
      </div>

      <PackagesGrid packages={packages} />
    </section>
  );
}
