import type { PublicSuitableAudienceV0 } from "./contracts.ts";

const PUBLIC_SUITABLE_AUDIENCE_ORDER = [
  "general",
  "developer",
  "creative",
  "heavy",
  "storage_heavy",
] as const satisfies readonly PublicSuitableAudienceV0[];

const publicAudienceByEditorialTag: Readonly<
  Record<string, PublicSuitableAudienceV0>
> = {
  general: "general",
  office: "general",
  student: "general",
  developer: "developer",
  creative: "creative",
  heavy_workload: "heavy",
  storage_heavy: "storage_heavy",
};

export function publicSuitableAudiencesV0(
  tags: readonly string[],
): PublicSuitableAudienceV0[] {
  const mapped = new Set<PublicSuitableAudienceV0>();
  for (const tag of tags) {
    const audience = publicAudienceByEditorialTag[tag];
    if (audience) mapped.add(audience);
  }
  return PUBLIC_SUITABLE_AUDIENCE_ORDER.filter((audience) =>
    mapped.has(audience),
  );
}
