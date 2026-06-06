import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

/**
 * Hash bcrypt pré-computado (cost 12, alinhado aos scripts de admin).
 * Usado quando o usuário não existe para manter tempo de compare semelhante.
 */
export const ADMIN_LOGIN_DUMMY_BCRYPT_HASH =
  "$2b$12$avhyrrwtmq/UkiDdiBu2GO6GOMPlgdQsZfuuvWFeBBVEwahFxk0uS";

/**
 * Executa o mesmo trabalho CPU/IO de uma falha de autenticação típica
 * (consulta por e-mail + compare bcrypt) para reduzir vazamento por timing.
 */
export async function runFailedLoginTimingWork(
  email: string,
  password: string,
): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();

  await prisma.adminUser.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  await bcrypt.compare(password, ADMIN_LOGIN_DUMMY_BCRYPT_HASH);
}
