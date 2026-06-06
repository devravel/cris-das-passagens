import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Plus, Tag, TicketPercent } from "lucide-react";

import { CouponsGrid } from "@/components/admin/coupons-grid";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAdminCoupons } from "@/lib/coupon/queries";

export const metadata: Metadata = {
  title: "Admin Cupons | Cris das Passagens",
  description: "Gerencie cupons promocionais no painel administrativo.",
  robots: {
    index: false,
    follow: false,
  },
};

type AdminCouponsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminCouponsPage({ searchParams }: AdminCouponsPageProps) {
  const params = (await searchParams) ?? {};

  if (params.done === "1") {
    redirect("/admin/cupons");
  }

  const coupons = await getAdminCoupons();
  const activeCount = coupons.filter((coupon) => coupon.isActive).length;
  const totalUses = coupons.reduce((sum, coupon) => sum + coupon.currentUses, 0);

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
            Cupons promocionais
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Crie e gerencie cupons divulgados por parceiros. O desconto é considerado pela equipe
            comercial no atendimento via WhatsApp.
          </p>
        </div>
        <Button asChild className="rounded-xl">
          <Link href="/admin/cupons/new">
            <Plus className="size-4" aria-hidden />
            Novo cupom
          </Link>
        </Button>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="size-4 text-brand" aria-hidden />
              Total
            </CardTitle>
            <CardDescription>Cupons cadastrados no painel.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tracking-tight text-foreground">
            {coupons.length}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-brand" aria-hidden />
              Ativos
            </CardTitle>
            <CardDescription>Cupons disponíveis para aplicação.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tracking-tight text-foreground">
            {activeCount}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TicketPercent className="size-4 text-brand" aria-hidden />
              Utilizações
            </CardTitle>
            <CardDescription>Total de usos registrados via WhatsApp.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tracking-tight text-foreground">
            {totalUses}
          </CardContent>
        </Card>
      </div>

      <CouponsGrid coupons={coupons} />
    </section>
  );
}
