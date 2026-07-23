import type { PublicMachineDetailV1 } from "../../../../../lib/public-projection/contracts.ts";

export interface PublicSpecificationRow { label: string; value: string }

const trustedTechnicalLabels: Record<string, string> = {
  display: "Màn hình",
  camera: "Camera",
  ports: "Cổng kết nối",
  touchId: "Touch ID",
  weight: "Trọng lượng",
};

function publicValue(value: string | number | boolean | null): string | null {
  if (value === null || value === "") return null;
  if (typeof value === "boolean") return value ? "Có" : "Không";
  return String(value);
}

export function buildPublicSpecificationRows(machine: PublicMachineDetailV1): PublicSpecificationRow[] {
  const rows: PublicSpecificationRow[] = [];
  for (const [key, label] of Object.entries(trustedTechnicalLabels)) {
    const value = publicValue(machine.technicalSpecifications[key] ?? null);
    if (value !== null) rows.push({ label, value });
  }
  return rows;
}
