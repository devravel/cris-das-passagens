"use server";

import { revalidatePath } from "next/cache";

import { getActionErrorMessage } from "@/lib/admin/action-error";
import type { ActionResult } from "@/lib/admin/action-result";
import { getCurrentAdminSession } from "@/lib/auth/admin-auth";
import { newsletterSubscribersService } from "@/lib/newsletter/subscribers.service";

async function requireAdmin() {
  const session = await getCurrentAdminSession();

  if (!session) {
    throw new Error("Não autorizado.");
  }

  return session;
}

export async function exportNewsletterSubscribersAction(): Promise<
  ActionResult<
    Awaited<ReturnType<typeof newsletterSubscribersService.exportSubscribers>>
  >
> {
  try {
    await requireAdmin();

    const data = await newsletterSubscribersService.exportSubscribers();

    revalidatePath("/admin/newsletter");

    return {
      ok: true,
      message: "Exportação gerada com sucesso.",
      data,
    };
  } catch (error) {
    return {
      ok: false,
      message: getActionErrorMessage(
        error,
        "Não foi possível exportar os inscritos.",
      ),
    };
  }
}
