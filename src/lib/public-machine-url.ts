const PUBLIC_SITE_ORIGIN = "https://mbmc.vn";

export function canonicalMachineUrl(slug: string): string {
  return new URL(
    `/may/${encodeURIComponent(slug)}`,
    PUBLIC_SITE_ORIGIN,
  ).toString();
}
