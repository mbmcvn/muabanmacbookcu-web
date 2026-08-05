const MBMC_PUBLIC_MEDIA_HOSTNAME = "media.mbmc.vn";

/** True only for normalized HTTPS URLs on MBMC's public handover-media host. */
export function isMbmcPublicMediaUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.trim() === "") return false;

  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === MBMC_PUBLIC_MEDIA_HOSTNAME;
  } catch {
    return false;
  }
}
