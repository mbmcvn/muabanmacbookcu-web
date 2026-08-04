const MBMC_PUBLIC_IMAGE_HOSTNAME = "img.mbmc.vn";

/** True only for absolute URLs served by MBMC's public machine-image host. */
export function isMbmcPublicImage(url: unknown): boolean {
  if (typeof url !== "string" || url.trim() === "") return false;
  try {
    return new URL(url).hostname === MBMC_PUBLIC_IMAGE_HOSTNAME;
  } catch {
    return false;
  }
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
