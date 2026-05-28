import { content, contentLinks } from "@/config/content";

export type NavItem = {
  label: string;
  href: string;
};

/** ID da seção de blogs em destaque na landing page (âncora de retorno em /blog). */
export const HOME_BLOG_SECTION_ID = "blog-preview";

/** ID da seção de avaliações/depoimentos na landing page. */
export const HOME_TESTIMONIALS_SECTION_ID = "depoimentos";

/** Destinos — oculto no site; reativar em navigation quando a galeria for publicada. */
export const destinationsNavItem: NavItem = {
  label: "Destinos",
  href: "/destinos",
};

/** Links principais — referência: Pacotes, Sobre, Blog. */
export const navigation: NavItem[] = [
  { label: "Início", href: "/" },
  { label: "Avaliações", href: `/#${HOME_TESTIMONIALS_SECTION_ID}` },
  { label: "Pacotes", href: "/pacotes" },
  { label: "Sobre", href: "/#sobre" },
  { label: "Blog", href: contentLinks.blog },
];

/** CTA da navbar — conversão via WhatsApp (referência visual). */
export const navbarCta = {
  label: content.ctas.whatsapp.label,
  href: contentLinks.whatsapp,
  external: true,
} as const;

export type NavbarCtaConfig = typeof navbarCta;
