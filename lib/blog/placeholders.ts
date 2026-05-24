import type { HomeBlogPostPreview } from "@/lib/blog/queries";

export const HOME_BLOG_EMPTY_MESSAGE =
  "Novos conteúdos e dicas de viagem estão sendo preparados.";

export const HOME_BLOG_PLACEHOLDER_POSTS: HomeBlogPostPreview[] = [
  {
    id: "placeholder-1",
    title: "Dicas para economizar na sua próxima viagem",
    slug: "placeholder-1",
    excerpt:
      "Conteúdo editorial premium em preparação para inspirar suas escolhas.",
    coverImage:
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=900&q=80",
    href: "/blog",
  },
  {
    id: "placeholder-2",
    title: "Quando comprar passagens com melhor custo-benefício",
    slug: "placeholder-2",
    excerpt: "Em breve, orientações práticas para planejar com tranquilidade.",
    coverImage:
      "https://images.unsplash.com/photo-1586441133374-ed1cb4007a47?auto=format&fit=crop&w=900&q=80",
    href: "/blog",
  },
  {
    id: "placeholder-3",
    title: "Como viajar com suporte do início ao fim",
    slug: "placeholder-3",
    excerpt: "Artigos pensados para facilitar cada etapa da sua experiência.",
    coverImage:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=900&q=80",
    href: "/blog",
  },
];
