import "server-only";

import sharp from "sharp";

/** Largura máxima servida no site (lightbox pede 1200px). */
const MAX_WIDTH = 1600;
const WEBP_QUALITY = 80;

/**
 * Reduz o original antes de subir pro Storage. Cada variante do next/image
 * na Vercel baixa o original inteiro do Supabase — com 1–3MB por foto isso
 * estourou o egress do plano free. GIF fica intacto (animação).
 */
export async function compressImageForStorage(
  file: File,
): Promise<{ buffer: Buffer; contentType: string; extension: string }> {
  const original = Buffer.from(await file.arrayBuffer());
  const mimeType = (file.type || "image/jpeg").toLowerCase();

  if (mimeType === "image/gif") {
    return { buffer: original, contentType: mimeType, extension: "gif" };
  }

  const buffer = await sharp(original)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  return { buffer, contentType: "image/webp", extension: "webp" };
}
