import type { PackageTypeValue } from "@/lib/package/constants";

export type PackagesPageSectionConfig = {
  type: PackageTypeValue;
  sectionId: string;
  title: string;
  description: string;
  hasCategoryFilter: boolean;
};

export const packagesPageSections: PackagesPageSectionConfig[] = [
  {
    type: "FLIGHT",
    sectionId: "passagens-aereas",
    title: "Passagens aéreas",
    description:
      "Voos selecionados com condições especiais, parcelamento facilitado e suporte completo para sua viagem.",
    hasCategoryFilter: true,
  },
  {
    type: "PACKAGE_COMPLETE",
    sectionId: "pacotes-completos",
    title: "Pacotes completos",
    description:
      "Experiências completas com voo, hospedagem e benefícios exclusivos para viajar com tranquilidade.",
    hasCategoryFilter: true,
  },
  {
    type: "HOTEL",
    sectionId: "hospedagem",
    title: "Hospedagem",
    description:
      "Hotéis selecionados com diárias competitivas e atendimento personalizado em destinos nacionais e internacionais.",
    hasCategoryFilter: true,
  },
  {
    type: "TICKET",
    sectionId: "ingressos",
    title: "Ingressos",
    description:
      "Ingressos para parques, eventos e atrações com curadoria premium e condições especiais de pagamento.",
    hasCategoryFilter: false,
  },
  {
    type: "CRUISE",
    sectionId: "cruzeiros",
    title: "Cruzeiros",
    description:
      "Navegue com conforto e exclusividade em roteiros selecionados para uma viagem inesquecível.",
    hasCategoryFilter: false,
  },
];

export const packagesPageContent = {
  title: "Pacotes turísticos",
  subtitle: "Passagens, pacotes completos, hospedagem, ingressos e cruzeiros.",
  emptyCategoryMessage: "Nenhuma oferta disponível nesta categoria no momento.",
  emptySectionMessage: "Novas ofertas serão publicadas em breve.",
} as const;
