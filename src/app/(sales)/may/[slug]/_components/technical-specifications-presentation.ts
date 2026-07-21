import type { PublicMachineDetailV1 } from "../../../../../lib/public-projection/contracts.ts";
import { formatCompactStorage, formatPublicMachineDisplayName } from "../../../../../lib/presentation/machine.ts";

export interface PublicSpecificationRow { label: string; value: string }

const trustedTechnicalLabels: Record<string, string> = {
  display: "Màn hình",
  camera: "Camera",
  ports: "Cổng kết nối",
  touchId: "Touch ID",
  weight: "Trọng lượng",
  releaseYear: "Năm ra mắt",
};

function publicValue(value: string | number | boolean | null): string | null {
  if (value === null || value === "") return null;
  if (typeof value === "boolean") return value ? "Có" : "Không";
  return String(value);
}

export function buildPublicSpecificationRows(machine: PublicMachineDetailV1): PublicSpecificationRow[] {
  const summary = machine.summary;
  const rows: Array<PublicSpecificationRow | null> = [
    { label: "Model", value: formatPublicMachineDisplayName(summary.displayName) },
    summary.chip ? { label: "Chip", value: summary.chip } : null,
    summary.ramGb === null ? null : { label: "RAM", value: `${summary.ramGb}GB` },
    summary.ssdGb === null ? null : { label: "Lưu trữ", value: `${formatCompactStorage(summary.ssdGb)} SSD` },
    summary.screenSizeInches === null ? null : { label: "Màn hình", value: `${summary.screenSizeInches} inch` },
    summary.color ? { label: "Màu", value: summary.color } : null,
    summary.year === null ? null : { label: "Năm ra mắt", value: `${summary.year}` },
  ];
  for (const [key, label] of Object.entries(trustedTechnicalLabels)) {
    if ((key === "display" && summary.screenSizeInches !== null) || (key === "releaseYear" && summary.year !== null)) continue;
    const value = publicValue(machine.technicalSpecifications[key] ?? null);
    if (value !== null) rows.push({ label, value });
  }
  return rows.filter((row): row is PublicSpecificationRow => row !== null);
}
