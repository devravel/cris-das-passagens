import type { PackageTypeValue } from "@/lib/package/constants";

export const DEFAULT_DEPARTURE_CITY = "São Paulo";

export type PackageShowcaseConfig = {
  type: PackageTypeValue;
  sectionId: string;
  icon: "suitcase" | "plane" | "bed" | "ticket" | "anchor";
  reverse: boolean;
  heading: {
    before?: string;
    highlight?: string;
    after?: string;
    full?: string;
  };
};

export const packageShowcaseSections: PackageShowcaseConfig[] = [
  {
    type: "PACKAGE_COMPLETE",
    sectionId: "pacotes-completos",
    icon: "suitcase",
    reverse: false,
    heading: {
      before: "O pacote ",
      highlight: "ideal",
      after: " para sua viagem",
    },
  },
  {
    type: "FLIGHT",
    sectionId: "passagens-aereas",
    icon: "plane",
    reverse: true,
    heading: {
      full: "Passagens com preços imbatíveis",
    },
  },
  {
    type: "HOTEL",
    sectionId: "hospedagem",
    icon: "bed",
    reverse: false,
    heading: {
      before: "As melhores ",
      highlight: "diárias",
      after: " para sua estadia",
    },
  },
  {
    type: "TICKET",
    sectionId: "ingressos",
    icon: "ticket",
    reverse: true,
    heading: {
      before: "Ingressos para ",
      highlight: "experiências",
      after: " inesquecíveis",
    },
  },
  {
    type: "CRUISE",
    sectionId: "cruzeiros",
    icon: "anchor",
    reverse: false,
    heading: {
      before: "Navegue em ",
      highlight: "cruzeiros",
      after: " selecionados",
    },
  },
];
