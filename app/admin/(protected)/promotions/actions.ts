"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionResult } from "@/lib/admin/action-result";
import { getCurrentAdminSession } from "@/lib/auth/admin-auth";
import { prisma } from "@/lib/prisma";
import { promotionSchema, type PromotionInput } from "@/lib/promotion/schemas";
import { normalizePromotionImageUrl } from "@/lib/promotion/image-url";
import { uploadPromotionImageToStorage } from "@/lib/promotion/storage";

const uploadImageSchema = z.object({
  fileName: z.string().min(1),
  fileType: z.string().min(1),
  fileSize: z.number().max(5 * 1024 * 1024, "A imagem deve ter no máximo 5MB."),
});

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
]);


async function requireAdmin() {
  const session = await getCurrentAdminSession();

  if (!session) {
    throw new Error("Não autorizado.");
  }
}

function toFieldErrors(error: z.ZodError<PromotionInput>) {
  return error.flatten().fieldErrors;
}

function normalizeInput(input: PromotionInput) {
  return {
    image: normalizePromotionImageUrl(input.image.trim()),
    title: input.title.trim() || null,
    link: input.link.trim() || null,
    active: input.active,
  };
}

function revalidatePromotionPaths() {
  revalidatePath("/admin/promotions");
  revalidatePath("/");
}

export async function createPromotionAction(
  input: PromotionInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
    const parsed = promotionSchema.safeParse(input);

    if (!parsed.success) {
      return {
        ok: false,
        message: "Revise os campos obrigatórios.",
        fieldErrors: toFieldErrors(parsed.error),
      };
    }

    const values = normalizeInput(parsed.data);

    const promotion = await prisma.promotion.create({
      data: values,
      select: { id: true },
    });

    revalidatePromotionPaths();

    return {
      ok: true,
      message: values.active
        ? "Promoção criada e ativada com sucesso."
        : "Promoção criada como inativa.",
      data: promotion,
    };
  } catch {
    return {
      ok: false,
      message: "Não foi possível criar a promoção agora.",
    };
  }
}

export async function updatePromotionAction(
  id: string,
  input: PromotionInput,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = promotionSchema.safeParse(input);

    if (!parsed.success) {
      return {
        ok: false,
        message: "Revise os campos obrigatórios.",
        fieldErrors: toFieldErrors(parsed.error),
      };
    }

    const values = normalizeInput(parsed.data);

    const existing = await prisma.promotion.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return {
        ok: false,
        message: "Promoção não encontrada.",
      };
    }

    await prisma.promotion.update({
      where: { id },
      data: values,
    });

    revalidatePromotionPaths();

    return {
      ok: true,
      message: values.active
        ? "Promoção atualizada e ativa."
        : "Promoção atualizada como inativa.",
    };
  } catch {
    return {
      ok: false,
      message: "Não foi possível atualizar a promoção agora.",
    };
  }
}

export async function deletePromotionAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();

    const promotion = await prisma.promotion.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!promotion) {
      return {
        ok: false,
        message: "Promoção não encontrada.",
      };
    }

    await prisma.promotion.delete({
      where: { id },
    });

    revalidatePromotionPaths();

    return {
      ok: true,
      message: "Promoção excluída com sucesso.",
    };
  } catch {
    return {
      ok: false,
      message: "Não foi possível excluir a promoção agora.",
    };
  }
}

export async function setPromotionActiveAction(
  id: string,
  active: boolean,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    await prisma.promotion.update({
      where: { id },
      data: { active },
    });

    revalidatePromotionPaths();

    return {
      ok: true,
      message: active ? "Promoção ativada com sucesso." : "Promoção desativada com sucesso.",
    };
  } catch {
    return {
      ok: false,
      message: "Não foi possível atualizar o status da promoção.",
    };
  }
}

export async function uploadPromotionImageAction(
  formData: FormData,
): Promise<ActionResult<{ imageUrl: string }>> {
  try {
    await requireAdmin();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return {
        ok: false,
        message: "Arquivo inválido.",
      };
    }

    const parsedUpload = uploadImageSchema.safeParse({
      fileName: file.name,
      fileType: file.type || "image/jpeg",
      fileSize: file.size,
    });

    if (!parsedUpload.success) {
      return {
        ok: false,
        message: parsedUpload.error.issues[0]?.message ?? "Arquivo inválido.",
      };
    }

    if (!allowedMimeTypes.has(parsedUpload.data.fileType.toLowerCase())) {
      return {
        ok: false,
        message: "Formato inválido. Use JPG, PNG, WEBP ou AVIF.",
      };
    }

    const { publicUrl } = await uploadPromotionImageToStorage(file);

    return {
      ok: true,
      message: "Imagem enviada com sucesso.",
      data: {
        imageUrl: publicUrl,
      },
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Não foi possível enviar a imagem agora.",
    };
  }
}
