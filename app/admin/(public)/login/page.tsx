import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

import { AdminLoginForm } from "@/components/admin/login-form";
import {
  adminAuthPaths,
  getSafeAdminRedirectTarget,
} from "@/lib/auth/admin-redirect";

type AdminLoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Login Admin | Cris das Passagens",
  description:
    "Acesse o painel administrativo para gerenciar conteúdos e promoções.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const params = await searchParams;
  const redirectParam = params[adminAuthPaths.redirectParamKey];
  const redirectTo = getSafeAdminRedirectTarget(
    Array.isArray(redirectParam) ? redirectParam[0] ?? null : redirectParam ?? null,
  );

  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] items-center justify-center overflow-hidden bg-gradient-to-b from-background via-brand-soft/40 to-background px-4 py-12 sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-28 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-brand/15 blur-3xl"
      />

      <div className="relative w-full max-w-md rounded-3xl border border-border/70 bg-card/95 p-6 shadow-xl shadow-brand/10 backdrop-blur-sm sm:p-8">
        <div className="mb-6 space-y-2 text-center">
          <div className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-brand/10 text-brand">
            <ShieldCheck className="size-5" aria-hidden />
          </div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            Painel administrativo
          </h1>
          <p className="text-sm text-muted-foreground">
            Entre com sua conta para acessar o ambiente seguro da equipe.
          </p>
        </div>

        <AdminLoginForm redirectTo={redirectTo} />
      </div>
    </section>
  );
}
