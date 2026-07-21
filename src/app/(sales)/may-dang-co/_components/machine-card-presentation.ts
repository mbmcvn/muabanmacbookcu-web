import { formatPublicMachineDisplayName, formatPublicMachineSpecs } from "../../../../lib/presentation/machine.ts";

export interface MachineCardBatteryFact {
  label: "Pin" | "Lần sạc";
  value: string;
}

export function formatMachineCardDisplayName(displayName: string): string {
  return formatPublicMachineDisplayName(displayName);
}

export function formatMachineCardSpecs(input: {
  chip: string | null;
  ramGb: number | null;
  storageGb: number | null;
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
  batteryHealthPercent: number | null;
  cycleCount: number | null;
  cosmeticGrade: string | null;
}): string {
  const battery = getMachineCardBatteryFact(input.batteryHealthPercent, input.cycleCount);
  return [
    battery ? `${battery.label} ${battery.value}` : null,
    input.cosmeticGrade ? `Ngoại hình ${input.cosmeticGrade}` : null,
  ].filter((value): value is string => value !== null).join(" · ");
}
