import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

export async function validateAdminCredentials(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const admin = await prisma.adminUser.findUnique({
    where: { email: normalizedEmail },
  });

  if (!admin) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);

  if (!isPasswordValid) {
    return null;
  }

  return {
    id: admin.id,
    email: admin.email,
  };
}
