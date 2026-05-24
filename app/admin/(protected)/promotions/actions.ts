"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionResult } from "@/lib/admin/action-result";
import { getCurrentAdminSession } from "@/lib/auth/admin-auth";
import { prisma } from "@/lib/prisma";
import { promotionSchema, type PromotionInput } from "@/lib/promotion/schemas";
import { makePromotionImagePath } from "@/lib/promotion/utils";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

const uploadImageSchema = z.object({
  fileName: z.string().min(1),
  fileType: z.string().min(1),
  fileSize: z.number().max(5 * 1024 * 1024, "A imagem deve ter no maximo 5MB."),
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
    throw new Error("Nao autorizado.");
  }
}

function toFieldErrors(error: z.ZodError<PromotionInput>) {
  return error.flatten().fieldErrors;
}

function normalizeInput(input: PromotionInput) {
  return {
    image: input.image.trim(),
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
        message: "Revise os campos obrigatorios.",
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
        ? "Promocao criada e ativada com sucesso."
        : "Promocao criada como inativa.",
      data: promotion,
    };
  } catch {
    return {
      ok: false,
      message: "Nao foi possivel criar a promocao agora.",
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
        message: "Revise os campos obrigatorios.",
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
        message: "Promocao nao encontrada.",
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
        ? "Promocao atualizada e ativa."
        : "Promocao atualizada como inativa.",
    };
  } catch {
    return {
      ok: false,
      message: "Nao foi possivel atualizar a promocao agora.",
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
        message: "Promocao nao encontrada.",
      };
    }

    await prisma.promotion.delete({
      where: { id },
    });

    revalidatePromotionPaths();

    return {
      ok: true,
      message: "Promocao excluida com sucesso.",
    };
  } catch {
    return {
      ok: false,
      message: "Nao foi possivel excluir a promocao agora.",
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
      message: active ? "Promocao ativada com sucesso." : "Promocao desativada com sucesso.",
    };
  } catch {
    return {
      ok: false,
      message: "Nao foi possivel atualizar o status da promocao.",
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
        message: "Arquivo invalido.",
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
        message: parsedUpload.error.issues[0]?.message ?? "Arquivo invalido.",
      };
    }

    if (!allowedMimeTypes.has(parsedUpload.data.fileType.toLowerCase())) {
      return {
        ok: false,
        message: "Formato invalido. Use JPG, PNG, WEBP ou AVIF.",
      };
    }

    const supabaseAdmin = createSupabaseAdminClient();
    const path = makePromotionImagePath(parsedUpload.data.fileName);
    const fileArrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(fileArrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from("promotion-images")
      .upload(path, fileBuffer, {
        contentType: parsedUpload.data.fileType,
        upsert: false,
      });

    if (uploadError) {
      return {
        ok: false,
        message: `Falha no upload: ${uploadError.message}`,
      };
    }

    const { data } = supabaseAdmin.storage.from("promotion-images").getPublicUrl(path);

    return {
      ok: true,
      message: "Imagem enviada com sucesso.",
      data: {
        imageUrl: data.publicUrl,
      },
    };
  } catch {
    return {
      ok: false,
      message: "Nao foi possivel enviar a imagem agora.",
    };
  }
}
