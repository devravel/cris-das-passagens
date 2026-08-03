import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { CircleUser } from "lucide-react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminLogoutButton } from "@/components/admin/logout-button";
import { getCurrentAdminSession } from "@/lib/auth/admin-auth";
import { buildAdminLoginRedirect } from "@/lib/auth/admin-redirect";
import { createNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = createNoIndexMetadata({
  title: "Admin",
  description: "Painel administrativo privado da Cris das Passagens.",
});

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await getCurrentAdminSession();

  if (!session) {
    redirect(buildAdminLoginRedirect("/admin"));
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-brand-soft/20 to-background">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-card/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <AdminSidebar mode="mobile" />
            <div className="flex size-10 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <CircleUser className="size-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                Admin Dashboard
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {session.email}
              </p>
            </div>
          </div>

          <AdminLogoutButton />
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[18rem_1fr] lg:py-8">
        <AdminSidebar mode="desktop" />
        <div className="min-w-0">{children}</div>
      </main>
    </div>
  );
}
