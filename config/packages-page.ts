import type { PackageTypeValue } from "@/lib/package/constants";

export type PackagesPageSectionConfig = {
  type: PackageTypeValue;
  sectionId: string;
  title: string;
  hasCategoryFilter: boolean;
};

export const packagesPageSections: PackagesPageSectionConfig[] = [
  {
    type: "FLIGHT",
    sectionId: "passagens-aereas",
    title: "Passagens aéreas",
    hasCategoryFilter: true,
  },
  {
    type: "PACKAGE_COMPLETE",
    sectionId: "pacotes-completos",
    title: "Pacotes completos",
    hasCategoryFilter: true,
  },
  {
    type: "HOTEL",
    sectionId: "hospedagem",
    title: "Hospedagem",
    hasCategoryFilter: true,
  },
  {
    type: "TICKET",
    sectionId: "ingressos",
    title: "Ingressos",
    hasCategoryFilter: false,
  },
  {
    type: "CRUISE",
    sectionId: "cruzeiros",
    title: "Cruzeiros",
    hasCategoryFilter: false,
  },
];

export const packagesPageContent = {
  title: "Pacotes turísticos",
  subtitle: "Passagens, pacotes completos, hospedagem, ingressos e cruzeiros.",
  emptyCategoryMessage: "Nenhuma oferta disponível nesta categoria no momento.",
  emptySectionMessage: "Novas ofertas serão publicadas em breve.",
} as const;
