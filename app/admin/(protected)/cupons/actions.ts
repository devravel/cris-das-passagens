"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getActionErrorMessage } from "@/lib/admin/action-error";
import type { ActionResult } from "@/lib/admin/action-result";
import { getCurrentAdminSession } from "@/lib/auth/admin-auth";
import { couponPersistSchema, type CouponFormValues } from "@/lib/coupon/schemas";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getCurrentAdminSession();

  if (!session) {
    throw new Error("Não autorizado.");
  }
}

function toFieldErrors(error: z.ZodError) {
  return error.flatten().fieldErrors;
}

function revalidateCouponPaths() {
  revalidatePath("/admin/cupons");
  revalidatePath("/");
}

export async function createCouponAction(
  input: CouponFormValues,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
    const parsed = couponPersistSchema.safeParse(input);

    if (!parsed.success) {
      return {
        ok: false,
        message: "Revise os campos obrigatórios.",
        fieldErrors: toFieldErrors(parsed.error),
      };
    }

    const values = parsed.data;

    const existingCode = await prisma.coupon.findUnique({
      where: { code: values.code },
      select: { id: true },
    });

    if (existingCode) {
      return {
        ok: false,
        message: "Este código já está em uso.",
        fieldErrors: { code: ["Escolha outro código para o cupom."] },
      };
    }

    const coupon = await prisma.coupon.create({
      data: values,
      select: { id: true },
    });

    revalidateCouponPaths();

    return {
      ok: true,
      message: values.isActive
        ? "Cupom criado e ativado com sucesso."
        : "Cupom criado como inativo.",
      data: coupon,
    };
  } catch (error) {
    return {
      ok: false,
      message: getActionErrorMessage(error, "Não foi possível criar o cupom agora."),
    };
  }
}

export async function updateCouponAction(
  id: string,
  input: CouponFormValues,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = couponPersistSchema.safeParse(input);

    if (!parsed.success) {
      return {
        ok: false,
        message: "Revise os campos obrigatórios.",
        fieldErrors: toFieldErrors(parsed.error),
      };
    }

    const values = parsed.data;

    const existing = await prisma.coupon.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return {
        ok: false,
        message: "Cupom não encontrado.",
      };
    }

    const codeConflict = await prisma.coupon.findFirst({
      where: {
        code: values.code,
        NOT: { id },
      },
      select: { id: true },
    });

    if (codeConflict) {
      return {
        ok: false,
        message: "Este código já está em uso.",
        fieldErrors: { code: ["Escolha outro código para o cupom."] },
      };
    }

    await prisma.coupon.update({
      where: { id },
      data: values,
    });

    revalidateCouponPaths();

    return {
      ok: true,
      message: values.isActive ? "Cupom atualizado e ativo." : "Cupom atualizado como inativo.",
    };
  } catch (error) {
    return {
      ok: false,
      message: getActionErrorMessage(error, "Não foi possível atualizar o cupom agora."),
    };
  }
}

export async function deleteCouponAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();

    const coupon = await prisma.coupon.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!coupon) {
      return {
        ok: false,
        message: "Cupom não encontrado.",
      };
    }

    await prisma.coupon.delete({
      where: { id },
    });

    revalidateCouponPaths();

    return {
      ok: true,
      message: "Cupom excluído com sucesso.",
    };
  } catch {
    return {
      ok: false,
      message: "Não foi possível excluir o cupom agora.",
    };
  }
}

export async function setCouponActiveAction(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    await prisma.coupon.update({
      where: { id },
      data: { isActive },
    });

    revalidateCouponPaths();

    return {
      ok: true,
      message: isActive ? "Cupom ativado com sucesso." : "Cupom desativado com sucesso.",
    };
  } catch {
    return {
      ok: false,
      message: "Não foi possível atualizar o status do cupom.",
    };
  }
}
