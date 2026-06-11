import type { GoogleReview } from "@/config/google-reviews-fallback";

const AVATAR_COLORS = [
  "bg-[#1a73e8]",
  "bg-[#34a853]",
  "bg-[#ea4335]",
  "bg-[#fbbc04]",
  "bg-[#9334e6]",
  "bg-[#e8710a]",
  "bg-brand",
] as const;

export const GOOGLE_REVIEW_TEXT_PREVIEW_MAX = 120;

export function getReviewInitials(name: string): string {
  const parts = name
    .replace(/\./g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export function getAvatarColorClass(name: string): string {
  let hash = 0;

  for (let index = 0; index < name.length; index += 1) {
    hash = name.charCodeAt(index) + ((hash << 5) - hash);
  }

  const colorIndex = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[colorIndex];
}

export function formatReviewDate(date: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const parsed = new Date(`${date}T12:00:00`);

    if (!Number.isNaN(parsed.getTime())) {
      return new Intl.DateTimeFormat("pt-BR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(parsed);
    }
  }

  return date;
}

export function shouldTruncateReviewText(text: string): boolean {
  return text.length > GOOGLE_REVIEW_TEXT_PREVIEW_MAX;
}

export function getReviewPreviewText(text: string): string {
  if (!shouldTruncateReviewText(text)) {
    return text;
  }

  const truncated = text.slice(0, GOOGLE_REVIEW_TEXT_PREVIEW_MAX).trimEnd();
  const lastSpace = truncated.lastIndexOf(" ");

  if (lastSpace > GOOGLE_REVIEW_TEXT_PREVIEW_MAX * 0.6) {
    return `${truncated.slice(0, lastSpace)}…`;
  }

  return `${truncated}…`;
}

export function formatAverageRating(average: number): string {
  return average.toFixed(1);
}

export function findReviewIndex(reviews: readonly GoogleReview[], reviewId: string): number {
  return reviews.findIndex((review) => review.id === reviewId);
}
