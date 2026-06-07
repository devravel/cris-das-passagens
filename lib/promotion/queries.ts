import { cache } from "react";

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
