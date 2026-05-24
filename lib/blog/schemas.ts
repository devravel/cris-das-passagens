import { z } from "zod";

export const blogPostSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Título deve ter no mínimo 3 caracteres.")
      .max(140, "Título deve ter no máximo 140 caracteres."),
    slug: z
      .string()
      .trim()
      .min(3, "Slug deve ter no mínimo 3 caracteres.")
      .max(160, "Slug deve ter no máximo 160 caracteres.")
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use apenas letras minúsculas, números e hífens."),
    excerpt: z
      .string()
      .trim()
      .min(10, "Resumo deve ter no mínimo 10 caracteres.")
      .max(320, "Resumo deve ter no máximo 320 caracteres."),
    content: z
      .string()
      .trim()
      .min(20, "Conteúdo deve ter no mínimo 20 caracteres."),
    coverImage: z.string().trim().url("Informe uma URL válida para a capa."),
    published: z.boolean(),
    featuredOnHomepage: z.boolean(),
  })
  .refine((data) => !data.featuredOnHomepage || data.published, {
    message: "Apenas posts publicados podem ser destacados na homepage.",
    path: ["featuredOnHomepage"],
  });

export type BlogPostInput = z.infer<typeof blogPostSchema>;
