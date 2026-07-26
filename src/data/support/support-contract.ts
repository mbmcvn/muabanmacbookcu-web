export const SUPPORT_INTAKE_SCHEMA = "public-support-ticket-intake.v1" as const;
export const SUPPORT_MACHINE_SCHEMA =
  "public-support-machine-context.v1" as const;
export const SUPPORT_RECEIPT_SCHEMA =
  "public-support-ticket-receipt.v1" as const;

export const SUPPORT_CATEGORIES = [
  ["power_charging", "Nguồn / Sạc"],
  ["display", "Màn hình"],
  ["battery_performance", "Pin / Hiệu năng"],
  ["keyboard_trackpad_ports", "Bàn phím / Trackpad / Cổng kết nối"],
  ["software_account_data", "Phần mềm / Tài khoản / Dữ liệu"],
  ["physical_liquid_damage", "Ngoại hình / Rơi vỡ / Vào nước"],
  ["other", "Khác"],
] as const;

export type SupportCategory = (typeof SUPPORT_CATEGORIES)[number][0];
export type SupportMachineContext = Readonly<{
  schemaVersion: typeof SUPPORT_MACHINE_SCHEMA;
  machineCode: string;
  displayName: string;
  configuration: string;
}>;
export type SupportReceipt = Readonly<{
  schemaVersion: typeof SUPPORT_RECEIPT_SCHEMA;
  ticketCode: string;
  status: "submitted";
  createdAt: string;
}>;
export type SupportErrorCode =
  | "invalid_request"
  | "unsupported_attachment"
  | "too_many_attachments"
  | "payload_too_large"
  | "rate_limited"
  | "not_found"
  | "unauthorized"
  | "temporarily_unavailable";

function exactKeys(value: Record<string, unknown>, keys: readonly string[]) {
  return (
    Object.keys(value).length === keys.length &&
    keys.every((key) => key in value)
  );
}
export function parseSupportMachine(
  value: unknown,
): SupportMachineContext | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    !exactKeys(row, [
      "schemaVersion",
      "machineCode",
      "displayName",
      "configuration",
    ]) ||
    row.schemaVersion !== SUPPORT_MACHINE_SCHEMA ||
    ![row.machineCode, row.displayName, row.configuration].every(
      (item) => typeof item === "string",
    )
  )
    return null;
  return row as SupportMachineContext;
}
export function parseSupportReceipt(value: unknown): SupportReceipt | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    !exactKeys(row, ["schemaVersion", "ticketCode", "status", "createdAt"]) ||
    row.schemaVersion !== SUPPORT_RECEIPT_SCHEMA ||
    row.status !== "submitted" ||
    typeof row.ticketCode !== "string" ||
    typeof row.createdAt !== "string"
  )
    return null;
  return row as SupportReceipt;
}
export const SUPPORT_ERROR_COPY: Record<SupportErrorCode, string> = {
  invalid_request: "Kiểm tra lại thông tin đã nhập.",
  unsupported_attachment: "Ảnh này chưa được hỗ trợ.",
  too_many_attachments: "Chỉ gửi tối đa 5 ảnh.",
  payload_too_large: "Tổng dung lượng ảnh quá lớn.",
  rate_limited: "Bạn đã gửi quá nhiều lần. Hãy thử lại sau.",
  not_found: "Không tìm thấy máy này.",
  unauthorized: "Yêu cầu chưa được xác thực.",
  temporarily_unavailable: "Hệ thống đang bận. Hãy thử lại sau.",
};
