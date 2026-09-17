/** Itens que o Cristian marca no admin; viram a faixa "O roteiro inclui" com ícone. */
export const INCLUDED_ITEM_OPTIONS = [
  { key: "flight", label: "Passagem aérea", icon: "plane" },
  { key: "bus", label: "Ônibus leito", icon: "bus" },
  { key: "hotel", label: "Hospedagem", icon: "bed-double" },
  { key: "transfer", label: "Traslados", icon: "car-front" },
  { key: "breakfast", label: "Café da manhã", icon: "coffee" },
  { key: "meals", label: "Refeições", icon: "utensils" },
  { key: "all-inclusive", label: "All inclusive", icon: "concierge-bell" },
  { key: "guide", label: "Guia acompanhante", icon: "user-round" },
  { key: "tours", label: "Passeios", icon: "map-pinned" },
  { key: "tickets", label: "Ingressos", icon: "ticket" },
  { key: "insurance", label: "Seguro viagem", icon: "shield-check" },
  { key: "cruise", label: "Cruzeiro", icon: "ship" },
] as const;

export type IncludedItemKey = (typeof INCLUDED_ITEM_OPTIONS)[number]["key"];

export const INCLUDED_ITEM_KEYS = INCLUDED_ITEM_OPTIONS.map((item) => item.key) as [
  IncludedItemKey,
  ...IncludedItemKey[],
];
