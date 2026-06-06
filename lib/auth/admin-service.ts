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
