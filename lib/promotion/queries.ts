import { cache } from "react";

import { normalizeBlogImageUrl } from "@/lib/blog/image-url";
import { getPromotionPackages, type PublicPackage } from "@/lib/package/queries";
import { publicPackageScheduleWhere } from "@/lib/package/schedule";
import { prisma } from "@/lib/prisma";
import {
  PROMOTION_STATUS_LABELS,
  getPromotionStatus,
  type LivePromotion,
} from "@/lib/promotion/schemas";

export type AdminPromotion = {
  id: string;
  name: string;
  slug: string;
  image: string;
  ctaLabel: string;
  startsAt: string;
  endsAt: string;
  packageCount: number;
};

const adminPromotionSelect = {
  id: true,
  name: true,
  slug: true,
  image: true,
  ctaLabel: true,
  startsAt: true,
  endsAt: true,
  _count: { select: { packages: true } },
} as const;

function mapAdminPromotion(promotion: {
  id: string;
  name: string;
  slug: string;
  image: string;
  ctaLabel: string;
  startsAt: Date;
  endsAt: Date;
  _count: { packages: number };
}): AdminPromotion {
  return {
    id: promotion.id,
    name: promotion.name,
    slug: promotion.slug,
    image: normalizeBlogImageUrl(promotion.image),
    ctaLabel: promotion.ctaLabel,
    startsAt: promotion.startsAt.toISOString(),
    endsAt: promotion.endsAt.toISOString(),
    packageCount: promotion._count.packages,
  };
}

export async function getAdminPromotions(): Promise<AdminPromotion[]> {
  const promotions = await prisma.promotion.findMany({
    orderBy: { startsAt: "desc" },
    select: adminPromotionSelect,
  });

  return promotions.map(mapAdminPromotion);
}

export async function getAdminPromotionById(id: string): Promise<AdminPromotion | null> {
  const promotion = await prisma.promotion.findUnique({
    where: { id },
    select: adminPromotionSelect,
  });

  return promotion ? mapAdminPromotion(promotion) : null;
}

/** Opções do campo "Promoção" no formulário de pacote. */
export async function getPromotionOptions(): Promise<{ value: string; label: string }[]> {
  const promotions = await prisma.promotion.findMany({
    orderBy: { startsAt: "desc" },
    select: { id: true, name: true, startsAt: true, endsAt: true },
  });

  return promotions.map((promotion) => {
    const status = getPromotionStatus(promotion.startsAt, promotion.endsAt);

    return {
      value: promotion.id,
      label:
        status === "live"
          ? promotion.name
          : `${promotion.name} (${PROMOTION_STATUS_LABELS[status].toLowerCase()})`,
    };
  });
}

/**
 * Promoção que o pop-up e o menu mostram: dentro do período e com pelo menos
 * um pacote público vinculado (sem pacote, o botão levaria a uma página vazia).
 * Duas no ar ao mesmo tempo: vale a que começou por último.
 */
export async function getLivePromotion(now = new Date()): Promise<LivePromotion | null> {
  const promotion = await prisma.promotion.findFirst({
    where: {
      startsAt: { lte: now },
      endsAt: { gt: now },
      packages: { some: publicPackageScheduleWhere(now) },
    },
    orderBy: { startsAt: "desc" },
    select: { slug: true, name: true, image: true, ctaLabel: true },
  });

  return promotion ? { ...promotion, image: normalizeBlogImageUrl(promotion.image) } : null;
}

export type PromotionPageData = {
  name: string;
  slug: string;
  image: string;
  endsAt: string;
  packages: PublicPackage[];
};

/**
 * Página da promoção: abre do momento em que é criada até o fim do período
 * (antes do início serve de prévia — fora do menu e sem pop-up ninguém chega).
 * Depois do fim, `null` e a rota manda pra /pacotes.
 */
export const getPromotionPageData = cache(
  async (slug: string): Promise<PromotionPageData | null> => {
    const promotion = await prisma.promotion.findUnique({
      where: { slug },
      select: { id: true, name: true, slug: true, image: true, endsAt: true },
    });

    if (!promotion || promotion.endsAt <= new Date()) {
      return null;
    }

    return {
      name: promotion.name,
      slug: promotion.slug,
      image: normalizeBlogImageUrl(promotion.image),
      endsAt: promotion.endsAt.toISOString(),
      packages: await getPromotionPackages(promotion.id),
    };
  },
);
