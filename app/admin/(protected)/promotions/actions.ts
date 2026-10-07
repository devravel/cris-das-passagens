"use server";

import { revalidatePath } from "next/cache";

import { getActionErrorMessage } from "@/lib/admin/action-error";
import type { ActionFailure, ActionResult } from "@/lib/admin/action-result";
import { getCurrentAdminSession } from "@/lib/auth/admin-auth";
import { normalizeBlogImageUrl } from "@/lib/blog/image-url";
import { parseOptionalDatetimeLocalInput } from "@/lib/package/dates";
import { prisma } from "@/lib/prisma";
import { promotionFormSchema, type PromotionFormValues } from "@/lib/promotion/schemas";
import { uploadPromotionImageToStorage } from "@/lib/promotion/storage";

async function requireAdmin() {
  const session = await getCurrentAdminSession();

  if (!session) {
    throw new Error("Não autorizado.");
  }
}

function normalizeInput(input: PromotionFormValues) {
  return {
    name: input.name,
    slug: input.slug,
    image: normalizeBlogImageUrl(input.image),
    ctaLabel: input.ctaLabel,
    // O schema já garantiu que as duas datas são válidas.
    startsAt: parseOptionalDatetimeLocalInput(input.startsAt)!,
    endsAt: parseOptionalDatetimeLocalInput(input.endsAt)!,
  };
}

function revalidatePromotionPaths(...slugs: string[]) {
  revalidatePath("/admin/promotions");
  for (const slug of slugs) {
    revalidatePath(`/promocoes/${slug}`);
  }
}

const slugInUse: ActionFailure = {
  ok: false,
  message: "Esse link já é de outra promoção.",
  fieldErrors: { slug: ["Escolha outro link para a página."] },
};

export async function createPromotionAction(
  input: PromotionFormValues,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
    const parsed = promotionFormSchema.safeParse(input);

    if (!parsed.success) {
      return {
        ok: false,
        message: "Revise os campos obrigatórios.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const values = normalizeInput(parsed.data);
    const existing = await prisma.promotion.findUnique({
      where: { slug: values.slug },
      select: { id: true },
    });

    if (existing) {
      return slugInUse;
    }

    const promotion = await prisma.promotion.create({ data: values, select: { id: true } });
    revalidatePromotionPaths(values.slug);

    return { ok: true, message: "Promoção criada.", data: promotion };
  } catch (error) {
    return {
      ok: false,
      message: getActionErrorMessage(error, "Não foi possível criar a promoção agora."),
    };
  }
}

export async function updatePromotionAction(
  id: string,
  input: PromotionFormValues,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = promotionFormSchema.safeParse(input);

    if (!parsed.success) {
      return {
        ok: false,
        message: "Revise os campos obrigatórios.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const values = normalizeInput(parsed.data);
    const current = await prisma.promotion.findUnique({ where: { id }, select: { slug: true } });

    if (!current) {
      return { ok: false, message: "Promoção não encontrada." };
    }

    const conflict = await prisma.promotion.findFirst({
      where: { slug: values.slug, NOT: { id } },
      select: { id: true },
    });

    if (conflict) {
      return slugInUse;
    }

    await prisma.promotion.update({ where: { id }, data: values });
    revalidatePromotionPaths(current.slug, values.slug);

    return { ok: true, message: "Promoção atualizada." };
  } catch (error) {
    return {
      ok: false,
      message: getActionErrorMessage(error, "Não foi possível atualizar a promoção agora."),
    };
  }
}

/** Os pacotes vinculados continuam no site; só perdem o vínculo (FK com SET NULL). */
export async function deletePromotionAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const promotion = await prisma.promotion.delete({ where: { id }, select: { slug: true } });
    revalidatePromotionPaths(promotion.slug);
    revalidatePath("/admin/packages");

    return { ok: true, message: "Promoção excluída." };
  } catch {
    return { ok: false, message: "Não foi possível excluir a promoção agora." };
  }
}

export async function uploadPromotionImageAction(
  formData: FormData,
): Promise<ActionResult<{ imageUrl: string }>> {
  try {
    await requireAdmin();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return { ok: false, message: "Arquivo inválido." };
    }

    // Formato e tamanho (até 5MB) são conferidos no upload.
    const { publicUrl } = await uploadPromotionImageToStorage(file);

    return { ok: true, message: "Imagem enviada.", data: { imageUrl: publicUrl } };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Não foi possível enviar a imagem agora.",
    };
  }
}
