import type {
  PublicMachineDetailV1,
  PublicMachinePassportV1,
  PublicMachineSummaryV1,
} from "./contracts.ts";
import {
  assemblePublicMachineDetailV1,
  assemblePublicMachinePassportV1,
  assemblePublicMachineSummaryV1,
} from "./assemblers.server.ts";
import {
  validatePublicMachineEligibility,
  type ProjectionDenialReason,
} from "./eligibility.server.ts";
import {
  normalizePublicMachineFacts,
  type PublicMachineProjectionInput,
} from "./kernel.server.ts";
import { validateProjectionPrivacy } from "./privacy.server.ts";

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const nested of Object.values(value)) deepFreeze(nested);
    Object.freeze(value);
  }
  return value;
}
export type PublicMachineProjectionV1Result =
  | { eligible: false; reasons: ProjectionDenialReason[] }
  | {
      eligible: true;
      summary: PublicMachineSummaryV1;
      detail: PublicMachineDetailV1;
      passport: PublicMachinePassportV1;
    };

export function projectPublicMachineV1(
  input: PublicMachineProjectionInput,
): PublicMachineProjectionV1Result {
  const normalized = normalizePublicMachineFacts(input);
  const privacy = validateProjectionPrivacy(normalized);
  if (!privacy.valid) {
    return { eligible: false, reasons: [privacy.reason] };
  }

  const eligibility = validatePublicMachineEligibility(normalized);

  if (!eligibility.eligible) return eligibility;

  return deepFreeze({
    eligible: true,
    summary: assemblePublicMachineSummaryV1(eligibility.kernel),
    detail: assemblePublicMachineDetailV1(eligibility.kernel),
    passport: assemblePublicMachinePassportV1(eligibility.kernel),
  });
}
