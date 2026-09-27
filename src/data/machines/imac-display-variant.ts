export const imacDisplayFacetValues = [
  "21.5",
  "21.5-4k",
  "24-4.5k",
  "27-5k",
] as const;

export type ImacDisplayFacet = (typeof imacDisplayFacetValues)[number];

const IMAC_DISPLAY_BY_MODEL_SPEC_KEY: Readonly<Record<string, ImacDisplayFacet>> = {
  "imac-21-5-intel-i5-2017": "21.5",
  "imac-21-5-4k-intel-i5-2017": "21.5-4k",
  "imac-21-5-4k-intel-i7-2017": "21.5-4k",
  "imac-21-5-4k-intel-i3-2019": "21.5-4k",
  "imac-21-5-4k-intel-i5-2019": "21.5-4k",
  "imac-21-5-4k-intel-i7-2019": "21.5-4k",
  "imac-24-45k-2port-m1-2021": "24-4.5k",
  "imac-24-45k-4port-m1-2021": "24-4.5k",
  "imac-24-45k-2port-m3-2023": "24-4.5k",
  "imac-24-45k-4port-m3-2023": "24-4.5k",
  "imac-24-45k-2port-m4-2024": "24-4.5k",
  "imac-24-45k-4port-m4-2024": "24-4.5k",
  "imac-27-5k-intel-i5-2017": "27-5k",
  "imac-27-5k-intel-i7-2017": "27-5k",
  "imac-27-5k-intel-i5-2019": "27-5k",
  "imac-27-5k-intel-i9-2019": "27-5k",
  "imac-27-5k-intel-i5-2020": "27-5k",
  "imac-27-5k-intel-i7-2020": "27-5k",
  "imac-27-5k-intel-i9-2020": "27-5k",
};

export function imacDisplayVariantForModelSpecKey(
  modelSpecKey: string | null | undefined,
): ImacDisplayFacet | null {
  return modelSpecKey ? (IMAC_DISPLAY_BY_MODEL_SPEC_KEY[modelSpecKey] ?? null) : null;
}
