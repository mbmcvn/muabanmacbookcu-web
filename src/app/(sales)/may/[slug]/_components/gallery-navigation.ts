export function wrapGalleryIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return (index % length + length) % length;
}

export function clampGalleryIndex(index: number, length: number): number {
  return Math.max(0, Math.min(Math.max(0, length - 1), index));
}

export function resistGalleryDrag(index: number, length: number, distanceX: number): number {
  const beyondStart = index === 0 && distanceX > 0;
  const beyondEnd = index === length - 1 && distanceX < 0;
  return beyondStart || beyondEnd ? distanceX * 0.28 : distanceX;
}

export function resolveGalleryDragIndex(input: {
  index: number;
  length: number;
  distanceX: number;
  velocityX: number;
  viewportWidth: number;
}): number {
  const distancePassed = Math.abs(input.distanceX) >= input.viewportWidth * 0.18;
  const velocityPassed = Math.abs(input.velocityX) >= 0.45;
  if (!distancePassed && !velocityPassed) return input.index;
  return clampGalleryIndex(input.index + (input.distanceX < 0 ? 1 : -1), input.length);
}

export function galleryIndexAfterSwipe(
  index: number,
  length: number,
  distanceX: number,
  threshold = 40,
): number {
  if (Math.abs(distanceX) < threshold) return index;
  return wrapGalleryIndex(index + (distanceX < 0 ? 1 : -1), length);
}
