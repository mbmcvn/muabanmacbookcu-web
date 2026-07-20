import type { NormalizedPublicMachineFacts } from "./kernel.server.ts";

export type PrivacyValidationResult =
  | { valid: true }
  | { valid: false; reason: "privacy_invalid" };

export function validateProjectionPrivacy(
  facts: NormalizedPublicMachineFacts,
): PrivacyValidationResult {
  return facts.privacyValid
    ? { valid: true }
    : { valid: false, reason: "privacy_invalid" };
}
