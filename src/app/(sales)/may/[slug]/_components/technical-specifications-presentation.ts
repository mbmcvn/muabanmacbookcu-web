import type { PublicMachineDetailV1 } from "../../../../../lib/public-projection/contracts.ts";
import {
  buildPublicMachineSpecifications,
  type PublicMachineSpecifications,
} from "../../../../../lib/public-machine-specifications.ts";

export type PublicSpecificationRow = { label: string; value: string };
export type PublicSpecificationGroup = {
  title: string;
  rows: PublicSpecificationRow[];
};

const legacyTrustedTechnicalLabels: Record<string, string> = {
  display: "Màn hình",
  camera: "Camera",
  ports: "Cổng kết nối",
  touchId: "Touch ID",
  weight: "Trọng lượng",
};

function row(
  label: string,
  value: string | string[] | number | boolean | null | undefined,
): PublicSpecificationRow | null {
  if (value === null || value === undefined || value === "") return null;
  if (Array.isArray(value)) {
    return value.length ? { label, value: value.join(" · ") } : null;
  }
  return {
    label,
    value:
      typeof value === "boolean"
        ? value
          ? "Có"
          : "Không"
        : String(value),
  };
}

function rows(
  candidates: Array<PublicSpecificationRow | null>,
): PublicSpecificationRow[] {
  return candidates.filter(
    (candidate): candidate is PublicSpecificationRow => candidate !== null,
  );
}

// Retained for the versioned DTO's legacy allow-listed field. New detail UI
// uses the typed machine/model boundary below.
export function buildPublicSpecificationRows(
  machine: PublicMachineDetailV1,
): PublicSpecificationRow[] {
  return Object.entries(legacyTrustedTechnicalLabels).flatMap(([key, label]) => {
    const candidate = row(label, machine.technicalSpecifications[key]);
    return candidate ? [candidate] : [];
  });
}

export function specificationsForMachine(
  machine: PublicMachineDetailV1,
): PublicMachineSpecifications {
  const summary = machine.summary;
  return buildPublicMachineSpecifications({
    machine: {
      chip: summary.chip,
      ram: summary.ramGb === null ? null : `${summary.ramGb} GB`,
      storage: summary.ssdGb === null ? null : `${summary.ssdGb} GB`,
      color: summary.color,
    },
    // model_text is a display label, not a stable model identifier.
    exactModelIdentifier: null,
  });
}

export function buildSpecificationSummary(
  specifications: PublicMachineSpecifications,
): PublicSpecificationRow[] {
  return rows([
    row("Chip", specifications.machine.chip),
    row("RAM", specifications.machine.ram),
    row("SSD", specifications.machine.storage),
    row("Màn hình", specifications.model?.displaySize),
    row("Màu sắc", specifications.machine.color),
  ]);
}

export function buildSpecificationGroups(
  specifications: PublicMachineSpecifications,
): PublicSpecificationGroup[] {
  const machine = specifications.machine;
  const model = specifications.model;
  return [
    {
      title: "Hiệu năng",
      rows: rows([
        row("Chip", machine.chip),
        row("CPU", machine.cpu),
        row("GPU", machine.gpu),
        row("RAM", machine.ram),
        row("SSD", machine.storage),
      ]),
    },
    {
      title: "Màn hình",
      rows: rows([
        row("Kích thước", model?.displaySize),
        row("Loại màn hình", model?.displayType),
        row("Độ phân giải", model?.displayResolution),
      ]),
    },
    {
      title: "Kết nối",
      rows: rows([
        row("Cổng kết nối", model?.ports),
        row("Wi-Fi", model?.wifi),
        row("Bluetooth", model?.bluetooth),
      ]),
    },
    {
      title: "Thiết kế và tiện ích",
      rows: rows([
        row("Màu sắc", machine.color),
        row("Bàn phím", machine.keyboardLayout),
        row("Camera", model?.camera),
        row("Touch ID", model?.touchId),
        row("Khối lượng", model?.weight),
        row("Bộ sạc tương thích", model?.compatibleCharger),
        row("Hệ điều hành hiện tại", machine.currentOs),
      ]),
    },
  ].filter((group) => group.rows.length > 0);
}
