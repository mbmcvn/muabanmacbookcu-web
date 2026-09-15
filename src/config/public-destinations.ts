const DEFAULT_OPERATIONAL_ORIGIN = "https://app.mbmc.vn";

function operationalOrigin(): string {
  const configured = process.env.MBMC_OPERATIONAL_API_BASE_URL?.trim();
  if (!configured) return DEFAULT_OPERATIONAL_ORIGIN;

  try {
    const url = new URL(configured);
    if (url.protocol !== "https:") return DEFAULT_OPERATIONAL_ORIGIN;
    return url.origin;
  } catch {
    return DEFAULT_OPERATIONAL_ORIGIN;
  }
}

export function publicDeviceCheckUrl(): string {
  return new URL("/device-check", operationalOrigin()).toString();
}
