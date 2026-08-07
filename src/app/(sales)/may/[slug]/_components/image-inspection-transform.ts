export const MIN_INSPECTION_SCALE = 1;
export const MAX_INSPECTION_SCALE = 4;
export const DOUBLE_TAP_INSPECTION_SCALE = 2;

export interface InspectionTransform {
  scale: number;
  x: number;
  y: number;
}

export interface InspectionImageMetrics {
  viewportWidth: number;
  viewportHeight: number;
  naturalWidth: number;
  naturalHeight: number;
}

export function clampInspectionScale(scale: number): number {
  return Math.min(MAX_INSPECTION_SCALE, Math.max(MIN_INSPECTION_SCALE, scale));
}

export function inspectionPanBounds(scale: number, metrics: InspectionImageMetrics) {
  if (scale <= MIN_INSPECTION_SCALE || metrics.naturalWidth <= 0 || metrics.naturalHeight <= 0) {
    return { x: 0, y: 0 };
  }

  const imageRatio = metrics.naturalWidth / metrics.naturalHeight;
  const viewportRatio = metrics.viewportWidth / metrics.viewportHeight;
  const containedWidth = imageRatio > viewportRatio
    ? metrics.viewportWidth
    : metrics.viewportHeight * imageRatio;
  const containedHeight = imageRatio > viewportRatio
    ? metrics.viewportWidth / imageRatio
    : metrics.viewportHeight;

  return {
    x: Math.max(0, (containedWidth * scale - metrics.viewportWidth) / 2),
    y: Math.max(0, (containedHeight * scale - metrics.viewportHeight) / 2),
  };
}

export function clampInspectionTransform(
  transform: InspectionTransform,
  metrics: InspectionImageMetrics,
): InspectionTransform {
  const scale = clampInspectionScale(transform.scale);
  if (scale === MIN_INSPECTION_SCALE) return { scale, x: 0, y: 0 };
  const bounds = inspectionPanBounds(scale, metrics);
  return {
    scale,
    x: Math.min(bounds.x, Math.max(-bounds.x, transform.x)),
    y: Math.min(bounds.y, Math.max(-bounds.y, transform.y)),
  };
}
