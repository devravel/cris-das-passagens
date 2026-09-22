import bcrypt from "bcryptjs";

import { ADMIN_LOGIN_DUMMY_BCRYPT_HASH } from "@/lib/auth/admin-login-timing";
import { prisma } from "@/lib/prisma";

export async function validateAdminCredentials(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const admin = await prisma.adminUser.findUnique({
    where: { email: normalizedEmail },
  });

  const passwordHash = admin?.passwordHash ?? ADMIN_LOGIN_DUMMY_BCRYPT_HASH;
  const isPasswordValid = await bcrypt.compare(password, passwordHash);

  if (!admin || !isPasswordValid) {
    return null;
  }

  return {
    id: admin.id,
    email: admin.email,
  };
}

/** Usuário logado com o nome, pra pré-preencher o vendedor do roteiro. */
export async function getAdminUserById(id: string) {
  return prisma.adminUser.findUnique({
    where: { id },
    select: { id: true, email: true, name: true },
  });
}
