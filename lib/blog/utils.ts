export function normalizeSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** @deprecated Use makeBlogStoragePath from lib/blog/storage.ts */
export function makeCoverImagePath(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase() || "jpg";
  const safeExtension = extension.replace(/[^a-z0-9]/g, "") || "jpg";
  const randomPart = crypto.randomUUID();

  return `covers/${Date.now()}-${randomPart}.${safeExtension}`;
}
