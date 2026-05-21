import { content, contentLinks } from "@/config/content";

export const siteConfig = {
  name: "Cris das Passagens",
  legalName: content.contact.legalName,
  description: content.meta.tagline,
  url: "https://crisdaspassagens.com.br",

  logo: "/cris-das-passagens-logo.png",

  phone: content.contact.phone,
  phoneHref: content.contact.phoneHref,
  whatsapp: contentLinks.whatsapp,
  email: "",

  address: content.contact.formattedAddress,
  addressDetails: {
    street: content.contact.street,
    neighborhood: content.contact.neighborhood,
    city: content.contact.city,
    state: content.contact.state,
    cnpj: content.contact.cnpj,
  },

  links: {
    blog: contentLinks.blog,
    quote: contentLinks.quote,
    whatsapp: contentLinks.whatsapp,
    cadastur: contentLinks.cadastur,
    instagram: "",
    facebook: "",
  },
} as const;

export type SiteConfig = typeof siteConfig;
