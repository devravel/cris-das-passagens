"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionResult } from "@/lib/admin/action-result";
import { getCurrentAdminSession } from "@/lib/auth/admin-auth";
import { normalizeRichTextValue } from "@/lib/blog/content";
import { normalizeBlogImageUrl } from "@/lib/blog/image-url";
import { uploadBlogImageToStorage } from "@/lib/blog/storage";
import { normalizeSlug } from "@/lib/blog/utils";
import { FEATURED_HOME_ITINERARIES_LIMIT } from "@/lib/itinerary/constants";
import {
  itineraryCategorySchema,
  itinerarySchema,
  type ItineraryInput,
} from "@/lib/itinerary/schemas";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getCurrentAdminSession();

  if (!session) {
    throw new Error("Não autorizado.");
  }
}

function revalidateItineraryPaths(slug: string) {
  revalidatePath("/admin/roteiros");
  revalidatePath("/roteiros");
  revalidatePath(`/roteiros/${slug}`);
  revalidatePath("/");
}

function revalidateCategoryPaths() {
  revalidatePath("/admin/roteiros");
  revalidatePath("/roteiros");
}

function normalizeInput(input: ItineraryInput) {
  const published = input.published;

  return {
    title: input.title,
    seller: input.seller?.trim() || null,
    slug: input.slug,
    coverImage: normalizeBlogImageUrl(input.coverImage),
    gallery: input.gallery.map((url) => normalizeBlogImageUrl(url)),
    duration: input.duration,
    priceFrom: input.priceFrom || null,
    description: input.description,
    includedItems: input.includedItems,
    videoUrl: input.videoUrl || null,
    mapUrl: input.mapUrl || null,
    itinerary: normalizeRichTextValue(input.itinerary ?? ""),
    optionals: normalizeRichTextValue(input.optionals ?? ""),
    included: normalizeRichTextValue(input.included ?? ""),
    notIncluded: normalizeRichTextValue(input.notIncluded ?? ""),
    payment: normalizeRichTextValue(input.payment ?? ""),
    departures: normalizeRichTextValue(input.departures ?? ""),
    insurance: normalizeRichTextValue(input.insurance ?? ""),
    notes: normalizeRichTextValue(input.notes ?? ""),
    hotels: input.hotels.map((hotel) => ({
      ...hotel,
      image: hotel.image ? normalizeBlogImageUrl(hotel.image) : undefined,
      description: normalizeRichTextValue(hotel.description ?? "") ?? undefined,
    })),
    published,
    featuredOnHomepage: published ? input.featuredOnHomepage : false,
    categoryIds: input.categoryIds,
  };
}

async function featuredLimitMessage(excludeId?: string): Promise<string | null> {
  const count = await prisma.itinerary.count({
    where: {
      published: true,
      featuredOnHomepage: true,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
  });

  return count >= FEATURED_HOME_ITINERARIES_LIMIT
    ? `A homepage mostra no máximo ${FEATURED_HOME_ITINERARIES_LIMIT} roteiros em destaque. Remova um destaque antes.`
    : null;
}

async function hasSlugConflict(slug: string, excludeId?: string) {
  const row = await prisma.itinerary.findFirst({
    where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
    select: { id: true },
  });

  return Boolean(row);
}

export async function createItineraryAction(
  input: ItineraryInput,
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    await requireAdmin();
    const parsed = itinerarySchema.safeParse(input);

    if (!parsed.success) {
      return {
        ok: false,
        message: "Revise os campos obrigatórios.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const { categoryIds, ...values } = normalizeInput(parsed.data);

    if (values.featuredOnHomepage) {
      const limit = await featuredLimitMessage();
      if (limit) {
        return { ok: false, message: limit, fieldErrors: { featuredOnHomepage: [limit] } };
      }
    }

    if (await hasSlugConflict(values.slug)) {
      return {
        ok: false,
        message: "Já existe um roteiro com este slug.",
        fieldErrors: { slug: ["Escolha outro slug."] },
      };
    }

    const created = await prisma.itinerary.create({
      data: { ...values, categories: { connect: categoryIds.map((id) => ({ id })) } },
      select: { id: true, slug: true },
    });

    revalidateItineraryPaths(created.slug);

    return {
      ok: true,
      message: values.published ? "Roteiro criado e publicado." : "Rascunho do roteiro criado.",
      data: created,
    };
  } catch (error) {
    console.error("createItineraryAction failed:", error);
    return { ok: false, message: "Não foi possível criar o roteiro agora." };
  }
}

export async function updateItineraryAction(
  id: string,
  input: ItineraryInput,
): Promise<ActionResult<{ slug: string }>> {
  try {
    await requireAdmin();
    const parsed = itinerarySchema.safeParse(input);

    if (!parsed.success) {
      return {
        ok: false,
        message: "Revise os campos obrigatórios.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const { categoryIds, ...values } = normalizeInput(parsed.data);
    const existing = await prisma.itinerary.findUnique({ where: { id }, select: { slug: true } });

    if (!existing) {
      return { ok: false, message: "Roteiro não encontrado." };
    }

    if (values.featuredOnHomepage) {
      const limit = await featuredLimitMessage(id);
      if (limit) {
        return { ok: false, message: limit, fieldErrors: { featuredOnHomepage: [limit] } };
      }
    }

    if (await hasSlugConflict(values.slug, id)) {
      return {
        ok: false,
        message: "Já existe um roteiro com este slug.",
        fieldErrors: { slug: ["Escolha outro slug."] },
      };
    }

    const updated = await prisma.itinerary.update({
      where: { id },
      data: { ...values, categories: { set: categoryIds.map((categoryId) => ({ id: categoryId })) } },
      select: { slug: true },
    });

    revalidateItineraryPaths(existing.slug);
    if (existing.slug !== updated.slug) {
      revalidateItineraryPaths(updated.slug);
    }

    return {
      ok: true,
      message: values.published ? "Roteiro atualizado e publicado." : "Roteiro salvo como rascunho.",
      data: updated,
    };
  } catch (error) {
    console.error("updateItineraryAction failed:", error);
    return { ok: false, message: "Não foi possível atualizar o roteiro agora." };
  }
}

export async function deleteItineraryAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const deleted = await prisma.itinerary.delete({ where: { id }, select: { slug: true } });
    revalidateItineraryPaths(deleted.slug);
    return { ok: true, message: "Roteiro excluído." };
  } catch {
    return { ok: false, message: "Não foi possível excluir o roteiro agora." };
  }
}

export async function setItineraryPublishedAction(
  id: string,
  published: boolean,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const updated = await prisma.itinerary.update({
      where: { id },
      data: { published, ...(published ? {} : { featuredOnHomepage: false }) },
      select: { slug: true },
    });
    revalidateItineraryPaths(updated.slug);
    return { ok: true, message: published ? "Roteiro publicado." : "Roteiro despublicado." };
  } catch {
    return { ok: false, message: "Não foi possível atualizar o status do roteiro." };
  }
}

export async function setItineraryFeaturedAction(
  id: string,
  featured: boolean,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const row = await prisma.itinerary.findUnique({
      where: { id },
      select: { slug: true, published: true },
    });

    if (!row) {
      return { ok: false, message: "Roteiro não encontrado." };
    }

    if (featured && !row.published) {
      return { ok: false, message: "Publique o roteiro antes de destacá-lo." };
    }

    if (featured) {
      const limit = await featuredLimitMessage(id);
      if (limit) {
        return { ok: false, message: limit };
      }
    }

    await prisma.itinerary.update({ where: { id }, data: { featuredOnHomepage: featured } });
    revalidateItineraryPaths(row.slug);
    return {
      ok: true,
      message: featured ? "Roteiro destacado na homepage." : "Destaque removido.",
    };
  } catch {
    return { ok: false, message: "Não foi possível atualizar o destaque." };
  }
}

const uploadSchema = z.object({
  fileSize: z.number().max(5 * 1024 * 1024, "A imagem deve ter no máximo 5MB."),
});

export async function uploadItineraryImageAction(
  formData: FormData,
): Promise<ActionResult<{ imageUrl: string }>> {
  try {
    await requireAdmin();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return { ok: false, message: "Arquivo inválido." };
    }

    const parsed = uploadSchema.safeParse({ fileSize: file.size });
    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message ?? "Arquivo inválido." };
    }

    const { publicUrl } = await uploadBlogImageToStorage({ file, folder: "itineraries" });
    return { ok: true, message: "Imagem enviada.", data: { imageUrl: publicUrl } };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Não foi possível enviar a imagem agora.",
    };
  }
}

// Divisórias (categorias dos roteiros)

export type ItineraryCategoryItem = { id: string; name: string; slug: string; order: number };

export async function createItineraryCategoryAction(
  name: string,
): Promise<ActionResult<ItineraryCategoryItem>> {
  try {
    await requireAdmin();
    const parsed = itineraryCategorySchema.safeParse({ name });

    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message ?? "Nome inválido." };
    }

    const slug = normalizeSlug(parsed.data.name);
    const conflict = await prisma.itineraryCategory.findUnique({ where: { slug }, select: { id: true } });

    if (conflict) {
      return { ok: false, message: "Já existe uma divisória com esse nome." };
    }

    const last = await prisma.itineraryCategory.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    });
    const created = await prisma.itineraryCategory.create({
      data: { name: parsed.data.name, slug, order: (last?.order ?? -1) + 1 },
      select: { id: true, name: true, slug: true, order: true },
    });

    revalidateCategoryPaths();
    return { ok: true, message: "Divisória criada.", data: created };
  } catch {
    return { ok: false, message: "Não foi possível criar a divisória agora." };
  }
}

export async function renameItineraryCategoryAction(
  id: string,
  name: string,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = itineraryCategorySchema.safeParse({ name });

    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message ?? "Nome inválido." };
    }

    const slug = normalizeSlug(parsed.data.name);
    const conflict = await prisma.itineraryCategory.findFirst({
      where: { slug, NOT: { id } },
      select: { id: true },
    });

    if (conflict) {
      return { ok: false, message: "Já existe uma divisória com esse nome." };
    }

    await prisma.itineraryCategory.update({ where: { id }, data: { name: parsed.data.name, slug } });
    revalidateCategoryPaths();
    return { ok: true, message: "Divisória renomeada." };
  } catch {
    return { ok: false, message: "Não foi possível renomear a divisória." };
  }
}

export async function deleteItineraryCategoryAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await prisma.itineraryCategory.delete({ where: { id } });
    revalidateCategoryPaths();
    return { ok: true, message: "Divisória excluída. Os roteiros dela continuam existindo." };
  } catch {
    return { ok: false, message: "Não foi possível excluir a divisória." };
  }
}

/** Recebe os ids na nova ordem. */
export async function reorderItineraryCategoriesAction(ids: string[]): Promise<ActionResult> {
  try {
    await requireAdmin();
    await prisma.$transaction(
      ids.map((id, order) => prisma.itineraryCategory.update({ where: { id }, data: { order } })),
    );
    revalidateCategoryPaths();
    return { ok: true, message: "Ordem salva." };
  } catch {
    return { ok: false, message: "Não foi possível reordenar." };
  }
}
