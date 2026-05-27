import type { PackageTypeValue } from "@/lib/package/constants";

export const DEFAULT_DEPARTURE_CITY = "São Paulo";

export type PackageShowcaseConfig = {
  type: PackageTypeValue;
  sectionId: string;
  icon: "suitcase" | "plane" | "bed";
  reverse: boolean;
  showDisclaimer: boolean;
  heading: {
    before?: string;
    highlight?: string;
    after?: string;
    full?: string;
  };
  originLabel?: boolean;
};

export const packageShowcaseSections: PackageShowcaseConfig[] = [
  {
    type: "PACKAGE_COMPLETE",
    sectionId: "pacotes-completos",
    icon: "suitcase",
    reverse: false,
    showDisclaimer: true,
    heading: {
      before: "Os melhores ",
      highlight: "pacotes",
      after: " para sua viagem",
    },
    originLabel: true,
  },
  {
    type: "FLIGHT",
    sectionId: "passagens-aereas",
    icon: "plane",
    reverse: true,
    showDisclaimer: true,
    heading: {
      full: "Passagens com preços imbatíveis",
    },
    originLabel: true,
  },
  {
    type: "HOTEL",
    sectionId: "hospedagem",
    icon: "bed",
    reverse: false,
    showDisclaimer: false,
    heading: {
      before: "As melhores ",
      highlight: "diárias",
      after: " para sua estadia",
    },
  },
];

export const packageShowcaseDisclaimer =
  "*Taxas de embarque serão cobradas na primeira parcela";
