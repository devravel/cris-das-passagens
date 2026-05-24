import { z } from "zod";

export const promotionSchema = z.object({
  image: z.string().trim().url("Informe uma URL válida para a imagem."),
  title: z
    .string()
    .trim()
    .max(120, "Título deve ter no máximo 120 caracteres."),
  link: z
    .string()
    .trim()
    .refine(
      (value) => value.length === 0 || z.string().url().safeParse(value).success,
      "Informe uma URL válida para o link.",
    ),
  active: z.boolean(),
});

export type PromotionInput = z.infer<typeof promotionSchema>;

export type PromotionFormValues = PromotionInput;
