import type { PublicImage } from "@/models";

const MBMC_PUBLIC_IMAGE_HOSTNAME = "img.mbmc.vn";

export type PublicMachineImageVariant = "thumb" | "card" | "display" | "full";
export type ResolvedPublicMachineImage = { url: string; width: number | null; height: number | null };

const VARIANT_FALLBACKS: Record<PublicMachineImageVariant, PublicMachineImageVariant[]> = {
  thumb: ["thumb", "card", "display"],
  card: ["card", "display", "thumb"],
  display: ["display", "full", "card"],
  full: ["full", "display", "card"],
};

/** True only for absolute URLs served by MBMC's public machine-image host. */
export function isMbmcPublicImage(url: unknown): boolean {
  if (typeof url !== "string" || url.trim() === "") return false;
  try {
    return new URL(url).hostname === MBMC_PUBLIC_IMAGE_HOSTNAME;
  } catch {
    return false;
  }
}

export function isSafePublicMachineImageUrl(url: unknown): url is string {
  if (typeof url !== "string" || url.trim() === "") return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname === MBMC_PUBLIC_IMAGE_HOSTNAME;
  } catch {
    return false;
  }
}

export function resolvePublicMachineImage(
  image: PublicImage | null | undefined,
  requestedVariant: PublicMachineImageVariant,
): ResolvedPublicMachineImage | null {
  if (!image) return null;
  for (const key of VARIANT_FALLBACKS[requestedVariant]) {
    const variant = image.variants?.[key];
    if (variant && isSafePublicMachineImageUrl(variant.url)) {
      return { url: variant.url, width: variant.width, height: variant.height };
    }
  }
  return isSafePublicMachineImageUrl(image.url)
    ? { url: image.url, width: image.width, height: image.height }
    : null;
}

export function isSafeImageSource(url: unknown): url is string {
  if (typeof url !== "string" || url.trim() === "") return false;
  if (url.startsWith("/")) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:" || parsed.protocol === "blob:";
  } catch {
    return false;
  }
}
