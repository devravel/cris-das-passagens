import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { isValidBlogImageUrl, normalizeBlogImageUrl } from "@/lib/blog/image-url";
import { compressImageForStorage } from "@/lib/storage/compress-image";
import { STORAGE_UPLOAD_CACHE_CONTROL } from "@/lib/storage/media-url";

export const BLOG_COVERS_BUCKET = "blog-covers";
export const BLOG_CONTENT_BUCKET = "blog-covers";

export const ALLOWED_BLOG_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

export const MAX_BLOG_IMAGE_BYTES = 5 * 1024 * 1024;

export type BlogImageFolder = "covers" | "content" | "itineraries";

type UploadBlogImageInput = {
  file: File;
  folder: BlogImageFolder;
};

function getSafeExtension(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase() || "jpg";
  return extension.replace(/[^a-z0-9]/g, "") || "jpg";
}

export function makeBlogStoragePath(folder: BlogImageFolder, fileName: string) {
  const safeExtension = getSafeExtension(fileName);
  const randomPart = crypto.randomUUID();

  return `${folder}/${Date.now()}-${randomPart}.${safeExtension}`;
}

export async function uploadBlogImageToStorage({
  file,
  folder,
}: UploadBlogImageInput): Promise<{ publicUrl: string }> {
  if (!ALLOWED_BLOG_IMAGE_MIME_TYPES.has((file.type || "image/jpeg").toLowerCase())) {
    throw new Error("Formato inválido. Use JPG, PNG, WEBP, AVIF ou GIF.");
  }

  if (file.size > MAX_BLOG_IMAGE_BYTES) {
    throw new Error("A imagem deve ter no máximo 5MB.");
  }

  const bucket = folder === "covers" ? BLOG_COVERS_BUCKET : BLOG_CONTENT_BUCKET;
  const { buffer, contentType, extension } = await compressImageForStorage(file);
  const path = makeBlogStoragePath(folder, `image.${extension}`);
  const supabaseAdmin = createSupabaseAdminClient();

  const { error: uploadError } = await supabaseAdmin.storage.from(bucket).upload(path, buffer, {
    contentType,
    upsert: false,
    cacheControl: STORAGE_UPLOAD_CACHE_CONTROL,
  });

  if (uploadError) {
    throw new Error(`Falha no upload: ${uploadError.message}`);
  }

  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
  const publicUrl = normalizeBlogImageUrl(data.publicUrl);

  if (!isValidBlogImageUrl(publicUrl)) {
    throw new Error("Não foi possível gerar a URL pública da imagem.");
  }

  return { publicUrl };
}
