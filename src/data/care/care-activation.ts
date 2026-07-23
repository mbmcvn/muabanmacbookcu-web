import {
  normalizeMachineCode,
  normalizePhone,
  prepareActivationName,
} from "./care-contract.ts";

export type ActivationResult =
  | "activated"
  | "already_activated"
  | "invalid_input"
  | "not_found"
  | "not_sold"
  | "details_mismatch"
  | "failed";

type MachineIdentity = Readonly<{ id: string; machineCode: string }>;
type SaleVerification = Readonly<{ id: string; buyerPhone: string | null }>;

export type CareActivationStore = {
  findMachine(machineCode: string): Promise<MachineIdentity | null | "failed">;
  findLatestSale(machineId: string): Promise<SaleVerification | null | "failed">;
  hasOwner(saleId: string): Promise<boolean | "failed">;
  insertOwner(input: {
    saleId: string;
    machineCode: string;
    customerName: string;
    phone: string;
  }): Promise<boolean>;
  insertActivationEvent(machineCode: string): Promise<boolean>;
};

export function activationRedirectStatus(result: ActivationResult) {
  if (result === "activated" || result === "already_activated") return "success";
  if (result === "details_mismatch") return "mismatch";
  if (result === "invalid_input") return "invalid";
  return "failed";
}
export async function activateCarePassportWithStore(
  input: { machineCode: string; customerName: string; phone: string },
  store: CareActivationStore,
): Promise<ActivationResult> {
  const machineCode = normalizeMachineCode(input.machineCode);
  const customerName = prepareActivationName(input.customerName);
  const phone = normalizePhone(input.phone);
  if (!customerName || !/^0\d{9}$/.test(phone)) return "invalid_input";

  const machine = await store.findMachine(machineCode);
  if (machine === "failed") return "failed";
  if (!machine) return "not_found";

  const sale = await store.findLatestSale(machine.id);
  if (sale === "failed") return "failed";
  if (!sale) return "not_sold";

  const hasOwner = await store.hasOwner(sale.id);
  if (hasOwner === "failed") return "failed";
  if (hasOwner) return "already_activated";

  if (phone !== normalizePhone(sale.buyerPhone ?? "")) {
    return "details_mismatch";
  }

  const ownerInserted = await store.insertOwner({
    saleId: sale.id,
    machineCode: machine.machineCode,
    customerName,
    phone,
  });
  if (!ownerInserted) return "failed";

  await store.insertActivationEvent(machine.machineCode);
  return "activated";
}
