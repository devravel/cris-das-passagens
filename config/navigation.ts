import { content, contentLinks } from "@/config/content";

export type NavItem = {
  label: string;
  href: string;
};

/** Links principais — referência: Destinos, Pacotes, Sobre, Blog. */
export const navigation: NavItem[] = [
  { label: "Início", href: "/" },
  { label: "Destinos", href: "/destinos" },
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
