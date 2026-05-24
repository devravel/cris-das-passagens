import { z } from "zod";

export const blogPostSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Titulo deve ter no minimo 3 caracteres.")
      .max(140, "Titulo deve ter no maximo 140 caracteres."),
    slug: z
      .string()
      .trim()
      .min(3, "Slug deve ter no minimo 3 caracteres.")
      .max(160, "Slug deve ter no maximo 160 caracteres.")
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use apenas letras minusculas, numeros e hifens."),
    excerpt: z
      .string()
      .trim()
      .min(10, "Resumo deve ter no minimo 10 caracteres.")
      .max(320, "Resumo deve ter no maximo 320 caracteres."),
    content: z
      .string()
      .trim()
      .min(20, "Conteudo deve ter no minimo 20 caracteres."),
    coverImage: z.string().trim().url("Informe uma URL valida para a capa."),
    published: z.boolean(),
    featuredOnHomepage: z.boolean(),
  })
  .refine((data) => !data.featuredOnHomepage || data.published, {
    message: "Apenas posts publicados podem ser destacados na homepage.",
    path: ["featuredOnHomepage"],
  });

export type BlogPostInput = z.infer<typeof blogPostSchema>;
