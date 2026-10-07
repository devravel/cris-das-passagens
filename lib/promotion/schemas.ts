import { z } from "zod";

import { isValidBlogImageUrl } from "@/lib/blog/image-url";
import {
  isValidDatetimeLocalInput,
  parseOptionalDatetimeLocalInput,
} from "@/lib/package/dates";

export const DEFAULT_PROMOTION_CTA_LABEL = "Confira os pacotes em destaque";

/** Proporção do pop-up: a mesma do post do Instagram, então a arte já sai pronta. */
export const RECOMMENDED_PROMOTION_IMAGE_SIZE = "1080 × 1350 px (vertical 4:5)";

const datetimeSchema = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `Informe a data e hora de ${label}.`)
    .refine(isValidDatetimeLocalInput, `Informe uma data e hora de ${label} válidas.`);

export const promotionFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Informe o nome da promoção.")
      .max(60, "O nome deve ter no máximo 60 caracteres."),
    slug: z
      .string()
      .trim()
      .min(2, "Informe o link da página.")
      .max(60, "O link deve ter no máximo 60 caracteres.")
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use só letras minúsculas, números e hífen."),
    image: z
      .string()
      .trim()
      .min(1, "Envie a imagem do pop-up.")
      .refine(isValidBlogImageUrl, "Informe uma URL válida para a imagem."),
    ctaLabel: z
      .string()
      .trim()
      .min(3, "Informe o texto do botão.")
      .max(40, "O texto do botão deve ter no máximo 40 caracteres."),
    startsAt: datetimeSchema("início"),
    endsAt: datetimeSchema("fim"),
  })
  .superRefine((data, ctx) => {
    const startsAt = parseOptionalDatetimeLocalInput(data.startsAt);
    const endsAt = parseOptionalDatetimeLocalInput(data.endsAt);

    if (startsAt && endsAt && endsAt <= startsAt) {
      ctx.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "O fim deve ser depois do início.",
      });
    }
  });

export type PromotionFormValues = z.infer<typeof promotionFormSchema>;

export const EMPTY_PROMOTION_FORM_VALUES: PromotionFormValues = {
  name: "",
  slug: "",
  image: "",
  ctaLabel: DEFAULT_PROMOTION_CTA_LABEL,
  startsAt: "",
  endsAt: "",
};

export type PromotionStatus = "scheduled" | "live" | "ended";

export const PROMOTION_STATUS_LABELS: Record<PromotionStatus, string> = {
  scheduled: "Agendada",
  live: "No ar",
  ended: "Encerrada",
};

export function getPromotionStatus(
  startsAt: Date | string,
  endsAt: Date | string,
  now = new Date(),
): PromotionStatus {
  if (new Date(endsAt) <= now) return "ended";
  if (new Date(startsAt) > now) return "scheduled";
  return "live";
}

/** O que o pop-up e o menu precisam saber da promoção no ar. */
export type LivePromotion = {
  slug: string;
  name: string;
  image: string;
  ctaLabel: string;
};
