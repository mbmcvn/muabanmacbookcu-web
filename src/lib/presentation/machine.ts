import type {
  MachineAvailability,
  MachineConditionGrade,
  Money,
} from "@/models";

export function formatCurrencyVnd(money: Money): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: money.currency,
    maximumFractionDigits: 0,
  }).format(money.amount);
}

export function formatMachineAvailability(value: MachineAvailability): string {
  const labels: Record<MachineAvailability, string> = {
    available: "Đang có sẵn",
    reserved: "Đang được giữ máy",
    sold: "Đã bán",
    unavailable: "Tạm thời không có sẵn",
  };
  return labels[value];
}

export function formatConditionGrade(value: MachineConditionGrade): string {
  const labels: Record<MachineConditionGrade, string> = {
    excellent: "Xuất sắc",
    "very-good": "Rất tốt",
    good: "Tốt",
    fair: "Khá",
  };
  return labels[value];
}

export function formatBatteryHealth(value?: number): string {
  return value === undefined ? "Chưa có dữ liệu" : `${value}%`;
}

export function formatCycleCount(value?: number): string {
  return value === undefined ? "Chưa có dữ liệu" : `${value} lần sạc`;
}

export function formatWarranty(months?: number): string {
  return months === undefined ? "Liên hệ để xác nhận" : `${months} tháng`;
}

export function formatStorage(gigabytes: number): string {
  return gigabytes >= 1024
    ? `${Number((gigabytes / 1024).toFixed(1))} TB`
    : `${gigabytes} GB`;
}

export function formatCompactStorage(gigabytes: number): string {
  return gigabytes >= 1024 && gigabytes % 1024 === 0
    ? `${gigabytes / 1024}TB`
    : `${gigabytes}GB`;
}

const PUBLIC_TITLE_PROCESSOR_TOKENS = [
  /\s*(?:[-–—·|,/]\s*)?\b(?:Apple\s+)?M\d+(?:\s+(?:Pro|Max|Ultra))?\b(?:\s*[-–—·|,/])?/gi,
  /\s*(?:[-–—·|,/]\s*)?\bIntel\s+(?:Core\s+)?i[3579]\b(?:\s*[-–—·|,/])?/gi,
];

export function formatPublicMachineDisplayName(displayName: string): string {
  return PUBLIC_TITLE_PROCESSOR_TOKENS
    .reduce((name, processor) => name.replace(processor, " "), displayName)
    .replace(/\s*([-–—·|,/])\s*(?=\1|$)/g, " ")
    .replace(/^\s*[-–—·|,/]+\s*|\s*[-–—·|,/]+\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatPublicMachineSpecs(input: {
  chip: string | null;
  ramGb: number | null;
  storageGb: number | null;
  color?: string | null;
}): string {
  return [
    input.chip,
    input.ramGb === null ? null : `${input.ramGb}GB`,
    input.storageGb === null ? null : `${formatCompactStorage(input.storageGb)} SSD`,
    input.color ?? null,
  ].filter((value): value is string => Boolean(value)).join(" · ");
}

export function formatMachineConfiguration(input: {
  chip: string;
  ramGb: number;
  storageGb: number;
}): string {
  return `${input.chip} · ${input.ramGb} GB RAM · ${formatStorage(input.storageGb)} SSD`;
}

export function formatPublicDate(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}
