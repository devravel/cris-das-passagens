import { content, contentLinks } from "@/config/content";
import { REI_DA_COPA_CAMPAIGN_ENABLED } from "@/config/rei-da-copa-campaign";
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

/** ID da seção de newsletter na landing page. */
export const HOME_NEWSLETTER_SECTION_ID = "newsletter";

/** Link âncora exclusivo da navbar — não entra no footer nem no sitemap. */
export const navbarAnchorNavItems: NavItem[] = [
  {
    label: "Avaliações",
    href: `/#${HOME_TESTIMONIALS_SECTION_ID}`,
  },
];

/** Destinos — oculto no site; reativar em navigation quando a galeria for publicada. */
export const destinationsNavItem: NavItem = {
  label: "Destinos",
  href: "/destinos",
};

/** Campanha Rei da Copa — mantido no código; só entra na navegação quando habilitado. */
export const reiDaCopaNavItem: NavItem = {
  label: "REI DA COPA",
  href: "/rei-da-copa",
};

/**
 * Páginas principais da marca — usadas no footer e como base da navegação global.
 * Ordem intencional: reforça hierarquia para o Google (Home → seções de conversão).
 */
export const brandPrimaryPages: NavItem[] = [
  { label: "Início", href: "/" },
  ...(REI_DA_COPA_CAMPAIGN_ENABLED ? [reiDaCopaNavItem] : []),
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

/** Links da navbar — páginas principais, âncoras exclusivas e institucionais. */
export const navigation: NavItem[] = [
  ...brandPrimaryPages.slice(0, -1),
  ...navbarAnchorNavItems,
  brandPrimaryPages[brandPrimaryPages.length - 1],
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
  politicaDePrivacidade: [
    { name: "Início", path: "/" },
    { name: "Política de Privacidade", path: "/politica-de-privacidade" },
  ],
} as const satisfies Record<string, BreadcrumbItem[]>;

/** CTA da navbar — cotação (referência visual). */
export const navbarCta = {
  label: content.hero.primaryCta.label,
  href: getQuoteWhatsAppUrl(),
  external: true,
} as const;

export type NavbarCtaConfig = typeof navbarCta;
