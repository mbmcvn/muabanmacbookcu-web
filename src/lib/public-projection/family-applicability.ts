import type { PublicMachineFamily } from "./contracts.ts";

export const PUBLIC_STORAGE_TYPES = ["ssd", "fusion", "hdd"] as const;
export type PublicStorageType = (typeof PUBLIC_STORAGE_TYPES)[number];
export type PublicProductLine = "macbook-air" | "macbook-pro" | "imac" | "mac-mini";

export type FamilyApplicabilityReason =
  | "machine_family_invalid" | "storage_type_invalid" | "storage_capacity_invalid"
  | "storage_type_not_applicable" | "product_line_invalid"
  | "battery_facts_not_applicable" | "display_facts_not_applicable"
  | "display_size_invalid";

export function validatePublicMachineFamilyApplicability(input: {
  machineFamily: PublicMachineFamily | null;
  storageType: PublicStorageType | null;
  storageCapacityGb: number | null;
  displaySizeInches: number | null;
  batteryHealthPercent: number | null;
  cycleCount: number | null;
  displayName: string | null;
}): { valid: false; reasons: FamilyApplicabilityReason[]; productLine: null } |
  { valid: true; reasons: []; productLine: PublicProductLine } {
  const reasons: FamilyApplicabilityReason[] = [];
  const { machineFamily: family, storageType } = input;
  if (!family || !["macbook", "imac", "mac-mini"].includes(family)) reasons.push("machine_family_invalid");
  if (!storageType || !PUBLIC_STORAGE_TYPES.includes(storageType)) reasons.push("storage_type_invalid");
  if (!Number.isSafeInteger(input.storageCapacityGb) || (input.storageCapacityGb ?? 0) <= 0) reasons.push("storage_capacity_invalid");
  if (input.displaySizeInches !== null && (!Number.isFinite(input.displaySizeInches) || input.displaySizeInches <= 0)) reasons.push("display_size_invalid");
  if ((family === "macbook" || family === "mac-mini") && storageType !== null && storageType !== "ssd") reasons.push("storage_type_not_applicable");
  if ((family === "imac" || family === "mac-mini") && (input.batteryHealthPercent !== null || input.cycleCount !== null)) reasons.push("battery_facts_not_applicable");
  if (family === "mac-mini" && input.displaySizeInches !== null) reasons.push("display_facts_not_applicable");
  const productLine = family === "macbook"
    ? (/\bmacbook\s+air\b/i.test(input.displayName ?? "") ? "macbook-air" : /\bmacbook\s+pro\b/i.test(input.displayName ?? "") ? "macbook-pro" : null)
    : family === "imac" ? "imac" : family === "mac-mini" ? "mac-mini" : null;
  if (family && productLine === null) reasons.push("product_line_invalid");
  return reasons.length ? { valid: false, reasons: [...new Set(reasons)], productLine: null } : { valid: true, reasons: [], productLine: productLine! };
}
