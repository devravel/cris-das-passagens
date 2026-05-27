export function isHighlightedChecklistItem(item: string): boolean {
  const normalized = item.toLowerCase();

  return normalized.includes("pix") || normalized.includes("desconto");
}
