import sharp from "sharp";

import { absoluteUrl } from "@/lib/seo/site-url";

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

const BRAND_NAVY = { r: 13, g: 27, b: 53 };

/**
 * O WhatsApp descarta a imagem do preview quando ela é pesada demais e cai no
 * ícone do site — foi o que aconteceu com as capas em PNG de 2 MB. Aqui a arte
 * é reduzida para 1200×630 em JPEG leve.
 */
const JPEG_QUALITY = 80;

/**
 * As capas de post e as artes de pacote já são peças fechadas (título, preço,
 * layout) e nem sempre são 1.91:1 — o flyer de pacote é vertical. Cortar comeria
 * informação, e tarja lisa desperdiça metade do card; então a arte entra inteira
 * sobre um fundo desfocado dela mesma. Saída sempre 1200×630, que é o que o
 * `og:image:width/height` declara.
 */
async function toOgJpeg(source: ArrayBuffer) {
  const input = Buffer.from(source);

  const art = await sharp(input)
    .resize(OG_WIDTH, OG_HEIGHT, { fit: "inside" })
    .flatten({ background: BRAND_NAVY })
    .toBuffer();

  const jpeg = await sharp(input)
    .resize(OG_WIDTH, OG_HEIGHT, { fit: "cover" })
    .blur(28)
    .modulate({ brightness: 0.5 })
    .flatten({ background: BRAND_NAVY })
    .composite([{ input: art, gravity: "center" }])
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer();

  return new Response(new Uint8Array(jpeg), {
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Length": String(jpeg.byteLength),
      // Cache na CDN: o crawler do WhatsApp desiste de resposta lenta.
      "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}

/**
 * Sempre devolve uma imagem: sem capa utilizável, cai na imagem padrão da marca.
 */
export async function renderOgImage(imageUrl: string | null): Promise<Response> {
  if (imageUrl) {
    try {
      const source = await fetch(imageUrl);

      if (source.ok) {
        return await toOgJpeg(await source.arrayBuffer());
      }
    } catch {
      // cai no fallback da marca
    }
  }

  return Response.redirect(absoluteUrl("/og-default-logo.jpg"), 307);
}
