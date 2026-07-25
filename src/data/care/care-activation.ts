import { timingSafeEqual } from "node:crypto";
import { normalizeMachineCode, prepareActivationName } from "./care-contract.ts";
import { normalizeVietnamesePhone } from "./care-access.ts";
import type { CareAccessContext } from "./care-session.ts";

export type ActivationReason =
  | "CARE_MACHINE_NOT_FOUND"
  | "CARE_NO_ELIGIBLE_SALE"
  | "CARE_ACTIVATION_AMBIGUOUS"
  | "CARE_ACTIVATION_NAME_INVALID"
  | "CARE_ACTIVATION_PHONE_INVALID"
  | "CARE_ACTIVATION_PHONE_MISMATCH"
  | "CARE_ALREADY_ACTIVATED"
  | "CARE_ACTIVATION_CREATE_FAILED"
  | "CARE_ACTIVATION_SUCCESS";
export type ActivationResult = Readonly<{
  reasonCode: ActivationReason;
  access: CareAccessContext | null;
}>;

type MachineIdentity = Readonly<{ id: string; machineCode: string }>;
type SaleVerification = Readonly<{ id: string; buyerPhone: string | null }>;
type ActivationResolution =
  | Readonly<{ state: "activation_required"; machine: MachineIdentity; sale: SaleVerification }>
  | Readonly<{ state: "activated"; access: CareAccessContext }>
  | Readonly<{
      state: "unsafe";
      reasonCode:
        | "CARE_MACHINE_NOT_FOUND"
        | "CARE_NO_ELIGIBLE_SALE"
        | "CARE_ACTIVATION_AMBIGUOUS"
        | "CARE_ALREADY_ACTIVATED";
    }>;

export type CareActivationStore = {
  resolve(machineCode: string): Promise<ActivationResolution>;
  insertOwner(input: {
    saleId: string;
    machineCode: string;
    customerName: string;
    phone: string;
  }): Promise<string | null>;
  findOwnerAccess(saleId: string): Promise<CareAccessContext | null>;
  insertActivationEvent(machineCode: string): Promise<boolean>;
};

export function activationRedirectStatus(result: ActivationResult) {
  if (result.reasonCode === "CARE_ACTIVATION_SUCCESS") return "success";
  if (result.reasonCode === "CARE_ACTIVATION_PHONE_MISMATCH") return "mismatch";
  if (
    result.reasonCode === "CARE_ACTIVATION_NAME_INVALID" ||
    result.reasonCode === "CARE_ACTIVATION_PHONE_INVALID"
  ) return "invalid";
  return "failed";
}

export async function activateCarePassportWithStore(
  input: { machineCode: string; customerName: string; phone: string },
  store: CareActivationStore,
): Promise<ActivationResult> {
  const machineCode = normalizeMachineCode(input.machineCode);
  const customerName = prepareActivationName(input.customerName);
  const phone = normalizeVietnamesePhone(input.phone);
  if (!customerName) {
    return { reasonCode: "CARE_ACTIVATION_NAME_INVALID", access: null };
  }
  if (!phone) {
    return { reasonCode: "CARE_ACTIVATION_PHONE_INVALID", access: null };
  }

  const resolved = await store.resolve(machineCode);
  if (resolved.state === "unsafe") {
    return { reasonCode: resolved.reasonCode, access: null };
  }
  if (resolved.state === "activated") {
    return { reasonCode: "CARE_ALREADY_ACTIVATED", access: null };
  }

  const expectedPhone = normalizeVietnamesePhone(resolved.sale.buyerPhone ?? "");
  if (!expectedPhone || !phonesMatch(phone, expectedPhone)) {
    return { reasonCode: "CARE_ACTIVATION_PHONE_MISMATCH", access: null };
  }

  const ownerId = await store.insertOwner({
    saleId: resolved.sale.id,
    machineCode: resolved.machine.machineCode,
    customerName,
    phone,
  });
  const access = ownerId
    ? {
        machineCode: resolved.machine.machineCode,
        saleId: resolved.sale.id,
        ownershipId: ownerId,
      }
    : await store.findOwnerAccess(resolved.sale.id);
  if (!access) {
    return { reasonCode: "CARE_ACTIVATION_CREATE_FAILED", access: null };
  }
  if (ownerId) await store.insertActivationEvent(resolved.machine.machineCode);
  return {
    reasonCode: "CARE_ACTIVATION_SUCCESS",
    access: Object.freeze(access),
  };
}

function phonesMatch(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}
