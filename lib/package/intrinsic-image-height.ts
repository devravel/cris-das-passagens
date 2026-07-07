export type IntrinsicImageHeightLimits = {
  min: number;
  max: number;
};

export const PACKAGE_CARD_INTRINSIC_IMAGE_HEIGHT_LIMITS: IntrinsicImageHeightLimits =
  {
    min: 140,
    max: 280,
  };

export function computeIntrinsicImageAreaHeight(
  containerWidth: number,
  naturalWidth: number,
  naturalHeight: number,
  limits: IntrinsicImageHeightLimits = PACKAGE_CARD_INTRINSIC_IMAGE_HEIGHT_LIMITS,
): number {
  if (containerWidth <= 0 || naturalWidth <= 0 || naturalHeight <= 0) {
    return limits.min;
  }

  const proportionalHeight = containerWidth * (naturalHeight / naturalWidth);

  return Math.round(
    Math.min(limits.max, Math.max(limits.min, proportionalHeight)),
  );
}
