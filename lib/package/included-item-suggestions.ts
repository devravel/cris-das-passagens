const DEFAULT_SUGGESTION_LIMIT = 5;

export function buildIncludedItemSuggestions(
  packagesIncludedItems: string[][],
): string[] {
  const counts = new Map<string, { label: string; count: number }>();

  for (const includedItems of packagesIncludedItems) {
    for (const rawItem of includedItems) {
      const trimmed = rawItem.trim();
      if (!trimmed) {
        continue;
      }

      const key = trimmed.toLowerCase();
      const existing = counts.get(key);

      if (existing) {
        existing.count += 1;
      } else {
        counts.set(key, { label: trimmed, count: 1 });
      }
    }
  }

  return [...counts.values()]
    .sort(
      (left, right) =>
        right.count - left.count ||
        left.label.localeCompare(right.label, "pt-BR"),
    )
    .map((entry) => entry.label);
}

export function filterIncludedItemSuggestions(
  suggestions: string[],
  query: string,
  limit = DEFAULT_SUGGESTION_LIMIT,
): string[] {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return [];
  }

  const normalizedQuery = trimmedQuery.toLowerCase();

  return suggestions
    .filter((item) => item.toLowerCase().includes(normalizedQuery))
    .slice(0, limit);
}
