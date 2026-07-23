export const PUBLIC_CARE_EVENT_TYPES = [
  "activated",
  "warranty_activated",
  "support_ticket",
  "support_ticket_created",
  "support_requested",
  "support_in_progress",
  "repair_completed",
  "support_resolved",
  "returned_to_customer",
  "handover_completed",
] as const;

type PublicCareEventType = (typeof PUBLIC_CARE_EVENT_TYPES)[number];

const PUBLIC_EVENT_TITLES: Record<PublicCareEventType, string> = {
  activated: "Bảo hành điện tử đã được kích hoạt",
  warranty_activated: "Bảo hành điện tử đã được kích hoạt",
  support_ticket: "Đã tiếp nhận yêu cầu hỗ trợ",
  support_ticket_created: "Đã tiếp nhận yêu cầu hỗ trợ",
  support_requested: "Đã tiếp nhận yêu cầu hỗ trợ",
  support_in_progress: "Thiết bị đang được kiểm tra",
  repair_completed: "Đã hoàn tất sửa chữa",
  support_resolved: "Yêu cầu hỗ trợ đã hoàn tất",
  returned_to_customer: "Thiết bị đã được bàn giao lại",
  handover_completed: "Thiết bị đã được bàn giao lại",
};

export type PublicCareEvent = Readonly<{
  id: string;
  title: string;
  createdAt: string | null;
}>;

export type PublicCarePassport = Readonly<{
  machineCode: string;
  model: string | null;
  configuration: Readonly<{
    chip: string | null;
    ramGb: number | null;
    ssdGb: number | null;
  }>;
  color: string | null;
  condition: string | null;
  ownershipState: "not_sold" | "awaiting_activation" | "activated";
  activatedAt: string | null;
  events: readonly PublicCareEvent[];
}>;

export function normalizeMachineCode(value: string) {
  return value.trim().toUpperCase();
}

export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.startsWith("84") && digits.length === 11
    ? `0${digits.slice(2)}`
    : digits;
}

export function prepareActivationName(value: string) {
  const trimmed = value.trim();
  const length = Array.from(trimmed).length;
  if (length < 2 || length > 100 || /[\u0000-\u001f\u007f]/u.test(trimmed)) {
    return null;
  }
  return trimmed;
}

export function mapPublicCareEvent(row: {
  id: string;
  event_type: string;
  created_at: string | null;
}): PublicCareEvent | null {
  if (!Object.prototype.hasOwnProperty.call(PUBLIC_EVENT_TITLES, row.event_type)) {
    return null;
  }
  const eventType = row.event_type as PublicCareEventType;
  return Object.freeze({
    id: row.id,
    title: PUBLIC_EVENT_TITLES[eventType],
    createdAt: row.created_at,
  });
}
