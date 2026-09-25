import { formatPublicMachineDisplayName, formatPublicMachineSpecs } from "../../../../lib/presentation/machine.ts";

export interface MachineCardBatteryFact {
  label: "Pin" | "Lần sạc" | "Màn hình";
  value: string;
}

export function getMachineCardFamilyFact(
  familyFacts:
    | { machineFamily: "macbook"; batteryHealthPercent: number | null; cycleCount: number | null; displaySizeInches: number | null }
    | { machineFamily: "imac"; displaySizeInches: number | null }
    | { machineFamily: "mac-mini" },
): MachineCardBatteryFact | null {
  if (familyFacts.machineFamily === "macbook") {
    return getMachineCardBatteryFact(familyFacts.batteryHealthPercent, familyFacts.cycleCount);
  }
  if (familyFacts.machineFamily === "imac" && familyFacts.displaySizeInches !== null) {
    return { label: "Màn hình", value: `${familyFacts.displaySizeInches} inch` };
  }
  return null;
}

export function formatMachineCardDisplayName(displayName: string): string {
  return formatPublicMachineDisplayName(displayName);
}

export function formatMachineCardSpecs(input: {
  chip: string | null;
  ramGb: number | null;
  storageGb: number | null;
  storageType?: "ssd" | "fusion" | "hdd";
  color: string | null;
}): string {
  return formatPublicMachineSpecs(input);
}

export function getMachineCardBatteryFact(
  batteryHealthPercent: number | null,
  cycleCount: number | null,
): MachineCardBatteryFact | null {
  if (batteryHealthPercent !== null) {
    return { label: "Pin", value: `${batteryHealthPercent}%` };
  }

  if (cycleCount !== null) {
    return { label: "Lần sạc", value: `${cycleCount}` };
  }

  return null;
}

export function formatMachineCardCondition(input: {
  machineFamily?: "macbook" | "imac" | "mac-mini";
  batteryHealthPercent: number | null;
  cycleCount: number | null;
  cosmeticGrade: string | null;
}): string {
  const battery = input.machineFamily && input.machineFamily !== "macbook" ? null : getMachineCardBatteryFact(input.batteryHealthPercent, input.cycleCount);
  return [
    battery ? `${battery.label} ${battery.value}` : null,
    input.cosmeticGrade ? `Ngoại hình ${input.cosmeticGrade}` : null,
  ].filter((value): value is string => value !== null).join(" · ");
}
