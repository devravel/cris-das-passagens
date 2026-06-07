import type { PackageTypeValue } from "@/lib/package/constants";

export type PackagesPageSectionConfig = {
  type: PackageTypeValue;
  sectionId: string;
  title: string;
};

export const packagesPageSections: PackagesPageSectionConfig[] = [
  {
    type: "FLIGHT",
    sectionId: "passagens-aereas",
    title: "Passagens aéreas",
  },
  {
    type: "PACKAGE_COMPLETE",
    sectionId: "pacotes-completos",
    title: "Pacotes completos",
  },
  {
    type: "HOTEL",
    sectionId: "hospedagem",
    title: "Hospedagem",
  },
  {
    type: "TICKET",
    sectionId: "ingressos",
    title: "Ingressos",
  },
  {
    type: "CRUISE",
    sectionId: "cruzeiros",
    title: "Cruzeiros",
  },
];

export const packagesPageContent = {
  title: "Pacotes turísticos",
  subtitle:
    "Passagens aéreas, pacotes completos, hospedagem, ingressos e cruzeiros.",
  emptyCategoryMessage: "Nenhuma oferta disponível nesta categoria no momento.",
  emptySectionMessage: "Novas ofertas serão publicadas em breve.",
} as const;
