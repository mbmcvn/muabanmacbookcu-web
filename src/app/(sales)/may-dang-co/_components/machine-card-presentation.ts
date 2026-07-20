import { formatCompactStorage } from "../../../../lib/presentation/machine.ts";

export interface MachineCardBatteryFact {
  label: "Pin" | "Lần sạc";
  value: string;
}

const PROCESSOR_TOKENS = [
  /\s*(?:[-–—·|,/]\s*)?\b(?:Apple\s+)?M[1-3](?:\s+(?:Pro|Max|Ultra))?\b(?:\s*[-–—·|,/])?/gi,
  /\s*(?:[-–—·|,/]\s*)?\bIntel\s+(?:Core\s+)?i[3579]\b(?:\s*[-–—·|,/])?/gi,
];

export function formatMachineCardDisplayName(displayName: string): string {
  return PROCESSOR_TOKENS
    .reduce((name, processor) => name.replace(processor, " "), displayName)
    .replace(/\s*([-–—·|,/])\s*(?=\1|$)/g, " ")
    .replace(/^\s*[-–—·|,/]+\s*|\s*[-–—·|,/]+\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatMachineCardSpecs(input: {
  chip: string | null;
  ramGb: number | null;
  storageGb: number | null;
  color: string | null;
}): string {
  return [
    input.chip ?? "Chưa rõ chip",
    input.ramGb === null ? "Chưa rõ" : `${input.ramGb}GB`,
    input.storageGb === null ? "Chưa rõ" : `${formatCompactStorage(input.storageGb)} SSD`,
    input.color,
  ].filter((value): value is string => value !== null).join(" · ");
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
