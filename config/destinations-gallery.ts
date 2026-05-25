import { siteConfig } from "@/config/site";

export const destinationsGalleryConfig = {
  title: "Galeria de Destinos",
  subtitle:
    "Inspire-se com destinos reais atendidos pela Cris das Passagens e visualize experiências compartilhadas no perfil Google da empresa.",
  emptyMessage:
    "A galeria está sendo preparada. Em breve você verá fotos dos destinos por aqui.",
  googleBusinessProfileUrl: "https://share.google/KJPSDMuCaGAzMqGKn",
  textQuery: `${siteConfig.name}, ${siteConfig.addressDetails.city}, ${siteConfig.addressDetails.state}, Brasil`,
  maxPhotos: 24,
  photoMaxSizePx: 1600,
} as const;
