import { prisma } from "@/lib/prisma";

/** Pacotes públicos: ativos e dentro da janela de duração (se definida). */
export function publicPackageScheduleWhere(now = new Date()) {
  return {
    active: true as const,
    AND: [
      {
        OR: [{ activatesAt: null }, { activatesAt: { lte: now } }],
      },
      {
        OR: [{ deactivatesAt: null }, { deactivatesAt: { gt: now } }],
      },
    ],
  };
}

/**
 * Desativa pacotes cuja data de desativação já passou.
 * Retorna quantos registros foram atualizados.
 */
export async function syncExpiredPackageSchedules(now = new Date()): Promise<number> {
  const result = await prisma.package.updateMany({
    where: {
      active: true,
      deactivatesAt: { lte: now },
    },
    data: { active: false },
  });

  return result.count;
}
