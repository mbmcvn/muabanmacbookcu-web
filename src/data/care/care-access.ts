import { createHmac } from "node:crypto";
import { normalizeMachineCode } from "./care-contract.ts";
import { normalizeVietnamesePhone } from "../../lib/customer-phone.ts";
export { normalizeVietnamesePhone } from "../../lib/customer-phone.ts";
import type { CareAccessContext } from "./care-session.ts";
import type { CareOwnershipReason } from "./care-ownership.ts";

export const CARE_VERIFICATION_ERROR =
  "Th\u00f4ng tin ch\u01b0a kh\u1edbp. Ki\u1ec3m tra l\u1ea1i s\u1ed1 \u0111i\u1ec7n tho\u1ea1i \u0111\u00e3 d\u00f9ng khi k\u00edch ho\u1ea1t b\u1ea3o h\u00e0nh.";

type CurrentOwnership = CareAccessContext & Readonly<{
  phone: string | null;
  saleLifecycle?: string | null;
  ownershipActivated?: boolean;
}>;
type CurrentOwnershipResolution = Readonly<{
  ownership: CurrentOwnership | null;
  reasonCode: CareOwnershipReason | null;
}>;
export type CareVerificationReason =
  | CareOwnershipReason
  | "CARE_OWNER_PHONE_INVALID"
  | "CARE_SUBMITTED_PHONE_INVALID"
  | "CARE_PHONE_MISMATCH"
  | "CARE_VERIFY_SUCCESS";

export type CareAccessStore = {
  consumeAttempt(keyHash: string): Promise<boolean>;
  findCurrentOwnership(machineCode: string): Promise<CurrentOwnership | null>;
  findCurrentOwnershipResolution?(
    machineCode: string,
  ): Promise<CurrentOwnershipResolution>;
  contextIsCurrent(access: CareAccessContext): Promise<boolean>;
};

export function careContextMatches(
  access: CareAccessContext,
  current: CareAccessContext | null,
) {
  return Boolean(
    current &&
    current.machineCode === access.machineCode &&
    current.saleId === access.saleId &&
    current.ownershipId === access.ownershipId,
  );
}
export function careAttemptKey(machineCode: string, origin: string) {
  const secret = process.env.CARE_SESSION_SECRET;
  if (!secret || secret.length < 32)
    throw new Error("CARE_SESSION_SECRET is not configured.");
  return createHmac("sha256", secret)
    .update(`${normalizeMachineCode(machineCode)}\n${origin || "unknown"}`)
    .digest("hex");
}

export async function verifyCareAccessDetailed(
  input: { machineCode: string; phone: string; origin: string },
  store: CareAccessStore,
) {
  const machineCode = normalizeMachineCode(input.machineCode);
  const keyHash = careAttemptKey(machineCode, input.origin);
  const submittedPhone = normalizeVietnamesePhone(input.phone);
  if (!(await store.consumeAttempt(keyHash))) {
    return verificationResult(null, "CARE_NO_EFFECTIVE_OWNERSHIP", null, submittedPhone);
  }
  if (!submittedPhone) {
    return verificationResult(null, "CARE_SUBMITTED_PHONE_INVALID", null, null);
  }
  const resolved = store.findCurrentOwnershipResolution
    ? await store.findCurrentOwnershipResolution(machineCode)
    : {
        ownership: await store.findCurrentOwnership(machineCode),
        reasonCode: null,
      };
  if (!resolved.ownership) {
    return verificationResult(
      null,
      resolved.reasonCode ?? "CARE_NO_EFFECTIVE_OWNERSHIP",
      null,
      submittedPhone,
    );
  }
  const storedPhone = normalizeVietnamesePhone(resolved.ownership.phone ?? "");
  if (!storedPhone) {
    return verificationResult(
      null,
      "CARE_OWNER_PHONE_INVALID",
      resolved.ownership,
      submittedPhone,
    );
  }
  if (storedPhone !== submittedPhone) {
    return verificationResult(
      null,
      "CARE_PHONE_MISMATCH",
      resolved.ownership,
      submittedPhone,
      false,
    );
  }
  const access = Object.freeze({
    machineCode: resolved.ownership.machineCode,
    saleId: resolved.ownership.saleId,
    ownershipId: resolved.ownership.ownershipId,
  });
  return verificationResult(
    access,
    "CARE_VERIFY_SUCCESS",
    resolved.ownership,
    submittedPhone,
    true,
  );
}

function verificationResult(
  access: CareAccessContext | null,
  reasonCode: CareVerificationReason,
  ownership: CurrentOwnership | null,
  submittedPhone: string | null,
  normalizedMatch = false,
) {
  return Object.freeze({
    access,
    diagnostic: Object.freeze({
      machineCode: access?.machineCode ?? null,
      selectedOwnershipId: ownership?.ownershipId ?? null,
      selectedSaleId: ownership?.saleId ?? null,
      saleLifecycle: ownership?.saleLifecycle ?? null,
      ownershipActivated: ownership?.ownershipActivated ?? null,
      storedPhoneValid: ownership
        ? normalizeVietnamesePhone(ownership.phone ?? "") !== null
        : null,
      submittedPhoneValid: submittedPhone !== null,
      normalizedMatch,
      reasonCode,
    }),
  });
}

export async function verifyCareAccess(
  input: { machineCode: string; phone: string; origin: string },
  store: CareAccessStore,
): Promise<CareAccessContext | null> {
  return (await verifyCareAccessDetailed(input, store)).access;
}



