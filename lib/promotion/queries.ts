import { cache } from "react";

import { prisma } from "@/lib/prisma";

export type PublicPromotion = {
  id: string;
  image: string;
  title: string | null;
  link: string | null;
};

export const getActivePromotions = cache(async (): Promise<PublicPromotion[]> => {
  return prisma.promotion.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      image: true,
      title: true,
      link: true,
    },
  });
});
