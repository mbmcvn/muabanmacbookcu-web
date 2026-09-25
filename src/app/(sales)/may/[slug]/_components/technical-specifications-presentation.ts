import type { PublicMachineDetailV3 } from "../../../../../lib/public-projection/contracts.ts";
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
      typeof value === "boolean" ? (value ? "Có" : "Không") : String(value),
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
  machine: PublicMachineDetailV3,
): PublicSpecificationRow[] {
  return Object.entries(legacyTrustedTechnicalLabels).flatMap(
    ([key, label]) => {
      const candidate = row(label, machine.technicalSpecifications[key]);
      return candidate ? [candidate] : [];
    },
  );
}

export function specificationsForMachine(
  machine: PublicMachineDetailV3,
): PublicMachineSpecifications {
  const summary = machine.summary;
  return buildPublicMachineSpecifications({
    machine: {
      chip: summary.chip,
      ram: summary.ramGb === null ? null : `${summary.ramGb} GB`,
      storage: `${summary.storage.capacityGb} GB ${summary.storage.type === "ssd" ? "SSD" : summary.storage.type === "fusion" ? "Fusion Drive" : "HDD"}`,
      color: summary.color,
    },
    exactModelIdentifier: machine.modelSpecKey,
  });
}

export function buildSpecificationSummary(
  specifications: PublicMachineSpecifications,
  machineFamily: "macbook" | "imac" | "mac-mini" = "macbook",
): PublicSpecificationRow[] {
  return rows([
    row("Chip", specifications.machine.chip),
    row("RAM", specifications.machine.ram),
    row("Lưu trữ", specifications.machine.storage),
    machineFamily === "mac-mini" ? null : row("Màn hình", specifications.model?.displaySize),
    row("Màu sắc", specifications.machine.color),
  ]);
}

export function buildSpecificationGroups(
  specifications: PublicMachineSpecifications,
  machineFamily: "macbook" | "imac" | "mac-mini" = "macbook",
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
        row("Lưu trữ", machine.storage),
      ]),
    },
    machineFamily === "mac-mini" ? null : {
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
        machineFamily === "macbook" ? row("Bàn phím", machine.keyboardLayout) : null,
        machineFamily === "mac-mini" ? null : row("Camera", model?.camera),
        machineFamily === "macbook" ? row("Touch ID", model?.touchId) : null,
        row("Khối lượng", model?.weight),
        machineFamily === "macbook" ? row("Bộ sạc tương thích", model?.compatibleCharger) : null,
        row("Hệ điều hành hiện tại", machine.currentOs),
      ]),
    },
  ].filter((group): group is PublicSpecificationGroup => group !== null && group.rows.length > 0);
}
