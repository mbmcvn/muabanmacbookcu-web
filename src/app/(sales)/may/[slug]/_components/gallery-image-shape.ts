export type GalleryImageShape = "square" | "non-square";

export function classifyGalleryImageShape(width: number, height: number): GalleryImageShape {
  if (width <= 0 || height <= 0) return "non-square";
  const ratio = width / height;
  return ratio >= 0.9 && ratio <= 1.1 ? "square" : "non-square";
}
