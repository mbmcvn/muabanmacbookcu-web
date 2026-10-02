export function formatDesktopDecimal(
  value: unknown,
  maximumFractionDigits = 1,
) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits,
    minimumFractionDigits: 0,
  }).format(value);
}
export function formatDesktopPercent(value: unknown) {
  const formatted = formatDesktopDecimal(value);
  return formatted === "—" ? formatted : `${formatted}%`;
}
export function formatDesktopPercentagePoints(value: unknown) {
  const formatted = formatDesktopDecimal(value);
  return formatted === "—" ? formatted : `${formatted} điểm %`;
}
export function formatPublicPercentagePoints(value: unknown) {
  const formatted = formatDesktopDecimal(value);
  return formatted === "—" ? formatted : `${formatted} điểm phần trăm`;
}
export function formatDesktopInteger(value: unknown, unit = "") {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  return `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(Math.round(value))}${unit}`;
}
export function formatDesktopCapacity(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  const gb = value / 1_000_000_000;
  const amount = gb >= 1000 ? gb / 1000 : gb;
  return `${formatDesktopDecimal(amount)} ${gb >= 1000 ? "TB" : "GB"}`;
}
export const desktopTerminalStateVi: Record<string, string> = {
  completed: "Hoàn tất",
  unsupported: "Không hỗ trợ",
  not_testable: "Không thể kiểm tra",
  system_intercepted: "Bị hệ thống chặn",
};
export const desktopInspectionSourceVi: Record<string, string> = {
  manual: "Thủ công",
  automatic: "Tự động",
  hybrid: "Kết hợp",
};
export const desktopAvailabilityVi: Record<string, string> = {
  available: "Khả dụng",
  unavailable: "Không khả dụng",
  partial: "Một phần",
};
export const desktopBatteryStatusVi: Record<string, string> = {
  discharging: "Đang xả",
  charging: "Đang sạc",
  charged: "Đã sạc đầy",
  full: "Đã sạc đầy",
  unknown: "Không xác định",
};
export const desktopAssessmentVi: Record<string, string> = {
  normal: "Bình thường",
  warning: "Cảnh báo",
  high_risk: "Nguy cơ cao",
};
export function desktopEnumVi(value: unknown, labels: Record<string, string>) {
  if (typeof value !== "string" || !value) return "—";
  return labels[value] ?? value;
}
