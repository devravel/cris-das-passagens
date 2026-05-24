import { z } from "zod";

export const promotionSchema = z.object({
  image: z.string().trim().url("Informe uma URL valida para a imagem."),
  title: z
    .string()
    .trim()
    .max(120, "Titulo deve ter no maximo 120 caracteres."),
  link: z
    .string()
    .trim()
    .refine(
      (value) => value.length === 0 || z.string().url().safeParse(value).success,
      "Informe uma URL valida para o link.",
    ),
  active: z.boolean(),
});

export type PromotionInput = z.infer<typeof promotionSchema>;

export type PromotionFormValues = PromotionInput;
