"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionResult } from "@/lib/admin/action-result";
import { getCurrentAdminSession } from "@/lib/auth/admin-auth";
import { prisma } from "@/lib/prisma";
import { normalizePackageImageUrl } from "@/lib/package/image-url";
import { packageFormSchema, type PackageFormValues } from "@/lib/package/schemas";
import { uploadPackageImageToStorage } from "@/lib/package/storage";

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

function toFieldErrors(error: z.ZodError<PackageFormValues>) {
  return error.flatten().fieldErrors;
}

function normalizeInput(input: PackageFormValues) {
  return {
    title: input.title.trim(),
    slug: input.slug.trim(),
    shortDescription: input.shortDescription.trim(),
    destination: input.destination.trim(),
    image: normalizePackageImageUrl(input.image.trim()),
    type: input.type,
    category: input.category ?? null,
    price: input.price,
    oldPrice: input.oldPrice ?? null,
    installmentText: input.installmentText?.trim() || null,
    airline: input.airline?.trim() || null,
    hotelName: input.hotelName?.trim() || null,
    includesTickets: input.includesTickets,
    includesHotel: input.includesHotel,
    includesFlight: input.includesFlight,
    includesCruise: input.includesCruise,
    active: input.active,
    featured: input.featured,
  };
}

function revalidatePackagePaths() {
  revalidatePath("/admin/packages");
  revalidatePath("/");
  revalidatePath("/pacotes");
}

export async function createPackageAction(
  input: PackageFormValues,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
    const parsed = packageFormSchema.safeParse(input);

    if (!parsed.success) {
      return {
        ok: false,
        message: "Revise os campos obrigatórios.",
        fieldErrors: toFieldErrors(parsed.error),
      };
    }

    const values = normalizeInput(parsed.data);

    const existingSlug = await prisma.package.findUnique({
      where: { slug: values.slug },
      select: { id: true },
    });

    if (existingSlug) {
      return {
        ok: false,
        message: "Este slug já está em uso.",
        fieldErrors: { slug: ["Escolha outro slug para o pacote."] },
      };
    }

    const pkg = await prisma.package.create({
      data: values,
      select: { id: true },
    });

    revalidatePackagePaths();

    return {
      ok: true,
      message: values.active
        ? "Pacote criado e ativado com sucesso."
        : "Pacote criado como inativo.",
      data: pkg,
    };
  } catch {
    return {
      ok: false,
      message: "Não foi possível criar o pacote agora.",
    };
  }
}

export async function updatePackageAction(
  id: string,
  input: PackageFormValues,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = packageFormSchema.safeParse(input);

    if (!parsed.success) {
      return {
        ok: false,
        message: "Revise os campos obrigatórios.",
        fieldErrors: toFieldErrors(parsed.error),
      };
    }

    const values = normalizeInput(parsed.data);

    const existing = await prisma.package.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return {
        ok: false,
        message: "Pacote não encontrado.",
      };
    }

    const slugConflict = await prisma.package.findFirst({
      where: {
        slug: values.slug,
        NOT: { id },
      },
      select: { id: true },
    });

    if (slugConflict) {
      return {
        ok: false,
        message: "Este slug já está em uso.",
        fieldErrors: { slug: ["Escolha outro slug para o pacote."] },
      };
    }

    await prisma.package.update({
      where: { id },
      data: values,
    });

    revalidatePackagePaths();

    return {
      ok: true,
      message: values.active ? "Pacote atualizado e ativo." : "Pacote atualizado como inativo.",
    };
  } catch {
    return {
      ok: false,
      message: "Não foi possível atualizar o pacote agora.",
    };
  }
}

export async function deletePackageAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();

    const pkg = await prisma.package.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!pkg) {
      return {
        ok: false,
        message: "Pacote não encontrado.",
      };
    }

    await prisma.package.delete({
      where: { id },
    });

    revalidatePackagePaths();

    return {
      ok: true,
      message: "Pacote excluído com sucesso.",
    };
  } catch {
    return {
      ok: false,
      message: "Não foi possível excluir o pacote agora.",
    };
  }
}

export async function setPackageActiveAction(
  id: string,
  active: boolean,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    await prisma.package.update({
      where: { id },
      data: { active },
    });

    revalidatePackagePaths();

    return {
      ok: true,
      message: active ? "Pacote ativado com sucesso." : "Pacote desativado com sucesso.",
    };
  } catch {
    return {
      ok: false,
      message: "Não foi possível atualizar o status do pacote.",
    };
  }
}

export async function setPackageFeaturedAction(
  id: string,
  featured: boolean,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    await prisma.package.update({
      where: { id },
      data: { featured },
    });

    revalidatePackagePaths();

    return {
      ok: true,
      message: featured
        ? "Pacote marcado como destaque."
        : "Pacote removido dos destaques.",
    };
  } catch {
    return {
      ok: false,
      message: "Não foi possível atualizar o destaque do pacote.",
    };
  }
}

export async function uploadPackageImageAction(
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

    const { publicUrl } = await uploadPackageImageToStorage(file);

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
