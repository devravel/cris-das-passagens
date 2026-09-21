import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminUsersPanel } from "@/components/admin/admin-users-panel";
import { getCurrentAdminSession } from "@/lib/auth/admin-auth";
import { buildAdminLoginRedirect } from "@/lib/auth/admin-redirect";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Admin Usuários | Cris das Passagens",
  description: "Gerencie quem tem acesso ao painel administrativo.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminUsersPage() {
  const session = await getCurrentAdminSession();

  if (!session) {
    redirect(buildAdminLoginRedirect("/admin/usuarios"));
  }

  const users = await prisma.adminUser.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
          Usuários do painel
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Cada vendedor entra com o próprio e-mail e senha. Todos enxergam o mesmo painel — o
          nome cadastrado aqui é o que aparece como vendedor nos roteiros.
        </p>
      </header>

      <AdminUsersPanel users={users} currentUserId={session.adminId} />
    </section>
  );
}
