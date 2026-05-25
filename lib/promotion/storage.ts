import "server-only";

import { isValidBlogImageUrl, normalizeBlogImageUrl } from "@/lib/blog/image-url";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const PROMOTION_IMAGES_BUCKET = "promotion-images";
export const PROMOTION_IMAGES_FOLDER = "promotion-images";

export const ALLOWED_PROMOTION_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export const MAX_PROMOTION_IMAGE_BYTES = 5 * 1024 * 1024;

const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

function getSafeExtension(fileName: string, mimeType: string) {
  const fromName = fileName.split(".").pop()?.toLowerCase()?.replace(/[^a-z0-9]/g, "") ?? "";

  if (fromName && fromName.length <= 5) {
    return fromName;
  }

  return MIME_TO_EXTENSION[mimeType.toLowerCase()] ?? "jpg";
}

export function makePromotionStoragePath(fileName: string, mimeType: string) {
  const safeExtension = getSafeExtension(fileName, mimeType);
  const randomPart = crypto.randomUUID();

  return `${PROMOTION_IMAGES_FOLDER}/${Date.now()}-${randomPart}.${safeExtension}`;
}

export async function uploadPromotionImageToStorage(
  file: File,
): Promise<{ publicUrl: string }> {
  const mimeType = (file.type || "image/jpeg").toLowerCase();

  if (!ALLOWED_PROMOTION_IMAGE_MIME_TYPES.has(mimeType)) {
    throw new Error("Formato inválido. Use JPG, PNG, WEBP ou AVIF.");
  }

  if (file.size > MAX_PROMOTION_IMAGE_BYTES) {
    throw new Error("A imagem deve ter no máximo 5MB.");
  }

  const path = makePromotionStoragePath(file.name, mimeType);
  const supabaseAdmin = createSupabaseAdminClient();
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabaseAdmin.storage
    .from(PROMOTION_IMAGES_BUCKET)
    .upload(path, fileBuffer, {
      contentType: mimeType,
      upsert: false,
      cacheControl: "3600",
    });

  if (uploadError) {
    throw new Error(`Falha no upload: ${uploadError.message}`);
  }

  const { data } = supabaseAdmin.storage.from(PROMOTION_IMAGES_BUCKET).getPublicUrl(path);
  const publicUrl = normalizeBlogImageUrl(data.publicUrl);

  if (!isValidBlogImageUrl(publicUrl)) {
    throw new Error("Não foi possível gerar a URL pública da imagem.");
  }

  return { publicUrl };
}
