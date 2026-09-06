import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { renderOgImage } from "@/lib/seo/og-image";
import { resolvePublicOgImageUrl } from "@/lib/seo/og-image-url";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug")?.trim();

  if (!slug) {
    return new Response("Missing slug", { status: 400 });
  }

  let imageUrl: string | null = null;

  try {
    const post = await prisma.post.findFirst({
      where: { slug, published: true },
      select: { coverImage: true },
    });

    if (post) {
      imageUrl = resolvePublicOgImageUrl(post.coverImage);
    }
  } catch {
    // cai na imagem padrão da marca
  }

  return renderOgImage(imageUrl);
}
