"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getActionErrorMessage } from "@/lib/admin/action-error";
import type { ActionResult } from "@/lib/admin/action-result";
import { getCurrentAdminSession } from "@/lib/auth/admin-auth";
import { prisma } from "@/lib/prisma";

/**
 * Usuários do painel. Todo usuário criado aqui tem o mesmo acesso da Cris —
 * o que muda é só saber quem entrou e qual vendedor assina cada roteiro.
 */

const BCRYPT_ROUNDS = 12;

const adminUserSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do vendedor.").max(80),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(160)
    .pipe(z.email("Informe um e-mail válido.")),
  password: z
    .string()
    .min(8, "A senha deve ter no mínimo 8 caracteres.")
    .max(128, "A senha deve ter no máximo 128 caracteres."),
});

export type AdminUserFormValues = z.infer<typeof adminUserSchema>;

async function requireAdminSession() {
  const session = await getCurrentAdminSession();

  if (!session) {
    throw new Error("Não autorizado.");
  }

  return session;
}

export async function createAdminUserAction(
  input: AdminUserFormValues,
): Promise<ActionResult> {
  try {
    await requireAdminSession();
    const parsed = adminUserSchema.safeParse(input);

    if (!parsed.success) {
      return {
        ok: false,
        message: parsed.error.issues[0]?.message ?? "Revise os campos.",
      };
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.adminUser.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      return { ok: false, message: "Já existe um usuário com esse e-mail." };
    }

    await prisma.adminUser.create({
      data: { name, email, passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS) },
    });

    revalidatePath("/admin/usuarios");

    return { ok: true, message: `Usuário de ${name} criado.` };
  } catch (error) {
    return {
      ok: false,
      message: getActionErrorMessage(error, "Não foi possível criar o usuário agora."),
    };
  }
}

export async function renameAdminUserAction(
  id: string,
  name: string,
): Promise<ActionResult> {
  try {
    await requireAdminSession();
    const parsed = adminUserSchema.shape.name.safeParse(name);

    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message ?? "Nome inválido." };
    }

    await prisma.adminUser.update({ where: { id }, data: { name: parsed.data } });

    revalidatePath("/admin/usuarios");

    return { ok: true, message: "Nome atualizado." };
  } catch (error) {
    return {
      ok: false,
      message: getActionErrorMessage(error, "Não foi possível trocar o nome agora."),
    };
  }
}

export async function updateAdminUserPasswordAction(
  id: string,
  password: string,
): Promise<ActionResult> {
  try {
    await requireAdminSession();
    const parsed = adminUserSchema.shape.password.safeParse(password);

    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message ?? "Senha inválida." };
    }

    await prisma.adminUser.update({
      where: { id },
      data: { passwordHash: await bcrypt.hash(parsed.data, BCRYPT_ROUNDS) },
    });

    revalidatePath("/admin/usuarios");

    return { ok: true, message: "Senha trocada." };
  } catch (error) {
    return {
      ok: false,
      message: getActionErrorMessage(error, "Não foi possível trocar a senha agora."),
    };
  }
}

export async function deleteAdminUserAction(id: string): Promise<ActionResult> {
  try {
    const session = await requireAdminSession();

    if (session.adminId === id) {
      return { ok: false, message: "Você não pode excluir o próprio acesso." };
    }

    const total = await prisma.adminUser.count();

    if (total <= 1) {
      return { ok: false, message: "É preciso manter pelo menos um usuário no painel." };
    }

    await prisma.adminUser.delete({ where: { id } });

    revalidatePath("/admin/usuarios");

    return { ok: true, message: "Usuário removido." };
  } catch (error) {
    return {
      ok: false,
      message: getActionErrorMessage(error, "Não foi possível remover o usuário agora."),
    };
  }
}
