import type { PublicSuitableAudienceV0 } from "@/models";
import { MACHINE_EXPLANATION_AUDIENCES } from "../../../../../lib/machine-explanation-audiences.ts";

export type SuitableAudiencePresentation = {
  code: PublicSuitableAudienceV0;
  label: string;
  description: string;
};

export function presentSuitableAudiences(
  audiences: readonly PublicSuitableAudienceV0[] | undefined,
): SuitableAudiencePresentation[] {
  return (audiences ?? []).map((code) => ({
    code,
    label: MACHINE_EXPLANATION_AUDIENCES[code].label,
    description: MACHINE_EXPLANATION_AUDIENCES[code].description,
  }));
}
