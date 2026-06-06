import { getCurrentAdminSession } from "@/lib/auth/admin-auth";
import {
  assertReiDaCopaPermission,
  type ReiDaCopaPermission,
} from "@/lib/rei-da-copa/permissions";

export async function requireReiDaCopaAdmin(permission: ReiDaCopaPermission) {
  const session = await getCurrentAdminSession();

  if (!session) {
    throw new Error("Não autorizado.");
  }

  assertReiDaCopaPermission(permission);

  return session;
}
