import type { PackageTypeValue } from "@/lib/package/constants";

export type PackagesPageSectionConfig = {
  type: PackageTypeValue;
  sectionId: string;
  title: string;
};

export const packagesPageSections: PackagesPageSectionConfig[] = [
  {
    type: "PACKAGE_COMPLETE",
    sectionId: "pacotes-completos",
    title: "Pacotes completos",
  },
  {
    type: "FLIGHT",
    sectionId: "passagens-aereas",
    title: "Passagens aéreas",
  },
  {
    type: "CIRCUIT",
    sectionId: "circuitos",
    title: "Circuitos",
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
  description:
    "Pacotes completos, passagens aéreas, circuitos, hospedagem, ingressos e cruzeiros nacionais e internacionais.",
  emptyCategoryMessage: "Ofertas dessa categoria sendo adicionadas em breve!",
  emptySectionMessage: "Novas ofertas serão publicadas em breve.",
} as const;
