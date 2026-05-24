export function makePromotionImagePath(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase() || "jpg";
  const safeExtension = extension.replace(/[^a-z0-9]/g, "") || "jpg";
  const randomPart = crypto.randomUUID();

  return `promotion-images/${Date.now()}-${randomPart}.${safeExtension}`;
}
