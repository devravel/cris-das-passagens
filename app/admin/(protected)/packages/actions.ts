"use server";

import { revalidatePath, updateTag } from "next/cache";

import { FEATURED_PACKAGES_CACHE_TAG } from "@/lib/package/cache-tags";
import { z } from "zod";

import { getActionErrorMessage } from "@/lib/admin/action-error";
import type { ActionResult } from "@/lib/admin/action-result";
import { getCurrentAdminSession } from "@/lib/auth/admin-auth";
import { prisma } from "@/lib/prisma";
import { parseOptionalPackageDateInput } from "@/lib/package/dates";
import { normalizePackageImageUrl } from "@/lib/package/image-url";
import { packageFormSchema, type PackageFormValues } from "@/lib/package/schemas";
import type { PackageTypeValue } from "@/lib/package/constants";
import {
  DEFAULT_PACKAGE_DEPARTURE_CITY,
  packageTypeShowsDepartureCity,
} from "@/lib/package/departure-city";
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

function normalizeAirlineAndHotel(
  type: PackageTypeValue,
  airline: string | null | undefined,
  hotelName: string | null | undefined,
) {
  const trimmedAirline = airline?.trim() || null;
  const trimmedHotel = hotelName?.trim() || null;

  if (type === "PACKAGE_COMPLETE" || type === "FLIGHT") {
    return { airline: trimmedAirline, hotelName: null };
  }

  if (type === "HOTEL") {
    return { airline: null, hotelName: trimmedHotel };
  }

  if (type === "CRUISE") {
    return { airline: null, hotelName: trimmedHotel };
  }

  return { airline: null, hotelName: null };
}

function normalizeDepartureCity(type: PackageTypeValue, departureCity: string | undefined) {
  if (!packageTypeShowsDepartureCity(type)) {
    return null;
  }

  return departureCity?.trim() || DEFAULT_PACKAGE_DEPARTURE_CITY;
}

function normalizeInput(input: PackageFormValues) {
  const { airline, hotelName } = normalizeAirlineAndHotel(
    input.type,
    input.airline,
    input.hotelName,
  );
  const departureCity = normalizeDepartureCity(input.type, input.departureCity);

  return {
    title: input.title.trim(),
    slug: input.slug.trim(),
    shortDescription: input.shortDescription.trim() || null,
    destination: input.destination.trim(),
    image: normalizePackageImageUrl(input.image.trim()),
    type: input.type,
    category: input.category ?? null,
    price: input.price,
    oldPrice: input.oldPrice ?? null,
    installmentText: input.installmentText?.trim() || null,
    highlightInstallments: input.highlightInstallments,
    airline,
    hotelName,
    departureCity,
    departureDate: parseOptionalPackageDateInput(input.departureDate),
    returnDate: parseOptionalPackageDateInput(input.returnDate),
    includedItems: input.includedItems.map((item) => item.trim()).filter(Boolean),
    daysCount: input.daysCount ?? null,
    nightsCount: input.nightsCount ?? null,
    showOnLandingPage: input.showOnLandingPage,
    active: input.active,
    featured: input.featured,
  };
}

function revalidatePackagePaths() {
  updateTag(FEATURED_PACKAGES_CACHE_TAG);
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
  } catch (error) {
    return {
      ok: false,
      message: getActionErrorMessage(error, "Não foi possível criar o pacote agora."),
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
  } catch (error) {
    return {
      ok: false,
      message: getActionErrorMessage(error, "Não foi possível atualizar o pacote agora."),
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
