import { content, contentLinks } from "@/config/content";
import { getQuoteWhatsAppUrl } from "@/lib/coupon/whatsapp";

export type NavItem = {
  label: string;
  href: string;
};

export type BreadcrumbItem = {
  name: string;
  path: string;
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

/**
 * Páginas principais da marca — usadas no footer e como base da navegação global.
 * Ordem intencional: reforça hierarquia para o Google (Home → seções de conversão).
 */
export const brandPrimaryPages: NavItem[] = [
  { label: "Início", href: "/" },
  { label: "REI DA COPA", href: "/rei-da-copa" },
  { label: "Pacotes", href: "/pacotes" },
  { label: "Blog", href: contentLinks.blog },
  { label: "Sobre", href: "/sobre" },
  { label: "Contato", href: "/contato" },
];

/** Páginas institucionais extras — reservado para itens secundários futuros. */
export const secondaryNavItems: NavItem[] = [];

/** Links institucionais exibidos apenas no rodapé (não entram na navbar). */
export const footerInstitutionalLinks: NavItem[] = [
  { label: "Política de Privacidade", href: "/politica-de-privacidade" },
];

/** Links da navbar — páginas principais primeiro, depois institucionais. */
export const navigation: NavItem[] = [
  ...brandPrimaryPages,
  ...secondaryNavItems,
];

export const brandPageBreadcrumbs = {
  pacotes: [
    { name: "Início", path: "/" },
    { name: "Pacotes", path: "/pacotes" },
  ],
  blog: [
    { name: "Início", path: "/" },
    { name: "Blog", path: "/blog" },
  ],
  contato: [
    { name: "Início", path: "/" },
    { name: "Contato", path: "/contato" },
  ],
  reiDaCopa: [
    { name: "Início", path: "/" },
    { name: "Rei da Copa", path: "/rei-da-copa" },
  ],
  sobre: [
    { name: "Início", path: "/" },
    { name: "Sobre", path: "/sobre" },
  ],
} as const satisfies Record<string, BreadcrumbItem[]>;

/** CTA da navbar — cotação (referência visual). */
export const navbarCta = {
  label: content.hero.primaryCta.label,
  href: getQuoteWhatsAppUrl(),
  external: true,
} as const;

export type NavbarCtaConfig = typeof navbarCta;
