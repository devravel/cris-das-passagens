import { cache } from "react";

import { normalizePromotionImageUrl } from "@/lib/promotion/image-url";

export type PublicPromotion = {
  id: string;
  image: string;
  title: string | null;
  link: string | null;
};

/** Legacy homepage promotions — public package UI not implemented yet. */
export const getActivePromotions = cache(async (): Promise<PublicPromotion[]> => {
  return [];
});

export function mapLegacyPromotionImage(url: string) {
  return normalizePromotionImageUrl(url);
}
