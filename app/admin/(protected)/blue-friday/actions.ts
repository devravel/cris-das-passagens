"use server";

import { getActionErrorMessage } from "@/lib/admin/action-error";
import type { ActionResult } from "@/lib/admin/action-result";
import { getCurrentAdminSession } from "@/lib/auth/admin-auth";
import { toBlueFridayRequestRow, type BlueFridayRequestRow } from "@/lib/blue-friday/format";
import { exportBlueFridayRequests } from "@/lib/blue-friday/service";

export async function exportBlueFridayRequestsAction(): Promise<ActionResult<BlueFridayRequestRow[]>> {
  try {
    if (!(await getCurrentAdminSession())) {
      throw new Error("Não autorizado.");
    }

    const requests = await exportBlueFridayRequests();

    return { ok: true, message: "Exportação gerada com sucesso.", data: requests.map(toBlueFridayRequestRow) };
  } catch (error) {
    return { ok: false, message: getActionErrorMessage(error, "Não foi possível exportar os pedidos.") };
  }
}
