import { normalizeSlug } from "@/lib/blog/utils";

export const MAX_TAGS_PER_POST = 8;

export function parseTagNames(raw: string[]): string[] {
  const unique = new Map<string, string>();

  for (const value of raw) {
    const trimmed = value.trim().replace(/\s+/g, " ");

    if (trimmed.length < 2 || trimmed.length > 32) {
      continue;
    }

    const key = normalizeSlug(trimmed);
    if (!key) continue;

    unique.set(key, trimmed);
  }

  return Array.from(unique.values()).slice(0, MAX_TAGS_PER_POST);
}

export function parseTagsFromInput(input: string): string[] {
  return parseTagNames(
    input
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean),
  );
}
