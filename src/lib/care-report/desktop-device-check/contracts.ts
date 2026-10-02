export const DESKTOP_DEVICE_CHECK_SCHEMA_V1 =
  "mbmc.desktop-device-check.v1" as const;
export const DESKTOP_DEVICE_CHECK_SCHEMA_V2 =
  "mbmc.desktop-device-check.v2" as const;
export const DESKTOP_DEVICE_CHECK_SCHEMA_V3 =
  "mbmc.desktop-device-check.v3" as const;
export const DESKTOP_DEVICE_CHECK_SCHEMA_V4 =
  "mbmc.desktop-device-check.v4" as const;
export const DESKTOP_DEVICE_CHECK_SCHEMA = DESKTOP_DEVICE_CHECK_SCHEMA_V1;
export const DESKTOP_DEVICE_CHECK_BODY_LIMIT = 262_144;
export const DESKTOP_DIAGNOSTIC_IDS = [
  "system_overview",
  "display",
  "keyboard",
  "trackpad",
  "battery",
  "storage",
  "camera",
  "microphone",
  "speakers",
  "wifi",
  "bluetooth",
  "touch_id",
  "ports",
  "charging",
] as const;
export type DesktopDiagnosticId = (typeof DESKTOP_DIAGNOSTIC_IDS)[number];
export const DESKTOP_DIAGNOSTIC_OUTCOMES = [
  "passed",
  "warning",
  "failed",
  "unknown",
] as const;
export type DesktopDiagnosticOutcome =
  (typeof DESKTOP_DIAGNOSTIC_OUTCOMES)[number];
export const DESKTOP_INSPECTION_TERMINAL_STATES = [
  "completed",
  "unsupported",
  "not_testable",
  "system_intercepted",
] as const;
export type DesktopInspectionTerminalState =
  (typeof DESKTOP_INSPECTION_TERMINAL_STATES)[number];
export const DESKTOP_INSPECTION_SOURCES = [
  "automatic",
  "manual",
  "hybrid",
] as const;
export type DesktopInspectionSource =
  (typeof DESKTOP_INSPECTION_SOURCES)[number];
export const DESKTOP_SNAPSHOT_AVAILABILITY = [
  "available",
  "partial",
  "unavailable",
] as const;
export type DesktopSnapshotAvailability =
  (typeof DESKTOP_SNAPSHOT_AVAILABILITY)[number];
export const DESKTOP_DIAGNOSTIC_TITLES: Readonly<
  Record<DesktopDiagnosticId, Readonly<{ vi: string; en: string }>>
> = {
  system_overview: { vi: "Tổng quan hệ thống", en: "System overview" },
  display: { vi: "Màn hình", en: "Display" },
  keyboard: { vi: "Bàn phím", en: "Keyboard" },
  trackpad: { vi: "Trackpad", en: "Trackpad" },
  battery: { vi: "Pin", en: "Battery" },
  storage: { vi: "Lưu trữ", en: "Storage" },
  camera: { vi: "Camera", en: "Camera" },
  microphone: { vi: "Micrô", en: "Microphone" },
  speakers: { vi: "Loa", en: "Speakers" },
  wifi: { vi: "Wi-Fi", en: "Wi-Fi" },
  bluetooth: { vi: "Bluetooth", en: "Bluetooth" },
  touch_id: { vi: "Touch ID", en: "Touch ID" },
  ports: { vi: "Cổng kết nối", en: "Ports" },
  charging: { vi: "Sạc", en: "Charging" },
};
export const DESKTOP_OUTCOME_LABELS: Readonly<
  Record<DesktopDiagnosticOutcome, Readonly<{ vi: string; en: string }>>
> = {
  passed: { vi: "Đạt", en: "Passed" },
  warning: { vi: "Cần chú ý", en: "Needs attention" },
  failed: { vi: "Không đạt", en: "Failed" },
  unknown: { vi: "Chưa thể xác định", en: "Could not determine" },
};
export const DESKTOP_SPEAKER_FINDING_IDS = [
  "speaker_left",
  "speaker_right",
] as const;
export const DESKTOP_TRACKPAD_FINDING_IDS = [
  "trackpad_movement",
  "trackpad_click",
  "trackpad_scroll",
] as const;
export const DESKTOP_PORT_FINDING_IDS = [
  "magsafe",
  "hdmi",
  "sdxc",
  "headphone_3_5mm",
  "usb_c_left_rear",
  "usb_c_left_front",
  "usb_c_right_rear",
  "usb_c_right_front",
  "usb_c_right_single",
] as const;
export const DESKTOP_FINDING_IDS = [
  "keyboard_keys",
  "keyboard_backlight",
  "touch_bar",
  "lid_sleep",
  "display_visual",
  ...DESKTOP_SPEAKER_FINDING_IDS,
  ...DESKTOP_TRACKPAD_FINDING_IDS,
  ...DESKTOP_PORT_FINDING_IDS,
] as const;
export type DesktopFindingId = (typeof DESKTOP_FINDING_IDS)[number];
export const DESKTOP_FINDING_PARENT: Readonly<
  Record<DesktopFindingId, DesktopDiagnosticId>
> = {
  keyboard_keys: "keyboard",
  keyboard_backlight: "keyboard",
  touch_bar: "keyboard",
  lid_sleep: "system_overview",
  display_visual: "display",
  speaker_left: "speakers",
  speaker_right: "speakers",
  trackpad_movement: "trackpad",
  trackpad_click: "trackpad",
  trackpad_scroll: "trackpad",
  magsafe: "ports",
  hdmi: "ports",
  sdxc: "ports",
  headphone_3_5mm: "ports",
  usb_c_left_rear: "ports",
  usb_c_left_front: "ports",
  usb_c_right_rear: "ports",
  usb_c_right_front: "ports",
  usb_c_right_single: "ports",
};
export const DESKTOP_FINDING_TITLES: Readonly<
  Record<DesktopFindingId, Readonly<{ vi: string; en: string }>>
> = {
  keyboard_keys: { vi: "Các phím", en: "Keyboard keys" },
  keyboard_backlight: { vi: "Đèn bàn phím", en: "Keyboard backlight" },
  touch_bar: { vi: "Touch Bar", en: "Touch Bar" },
  lid_sleep: { vi: "Phản hồi khi đóng nắp", en: "Lid-close response" },
  display_visual: {
    vi: "Kiểm tra hình ảnh màn hình",
    en: "Display visual inspection",
  },
  speaker_left: { vi: "Loa trái", en: "Left speaker" },
  speaker_right: { vi: "Loa phải", en: "Right speaker" },
  trackpad_movement: { vi: "Di chuyển con trỏ", en: "Pointer movement" },
  trackpad_click: { vi: "Nhấn Trackpad", en: "Trackpad click" },
  trackpad_scroll: { vi: "Cuộn Trackpad", en: "Trackpad scroll" },
  magsafe: { vi: "MagSafe", en: "MagSafe" },
  hdmi: { vi: "HDMI", en: "HDMI" },
  sdxc: { vi: "Khe thẻ SDXC", en: "SDXC card slot" },
  headphone_3_5mm: {
    vi: "Cổng tai nghe 3,5 mm",
    en: "3.5 mm headphone jack",
  },
  usb_c_left_rear: {
    vi: "USB-C trái phía sau",
    en: "Left rear USB-C port",
  },
  usb_c_left_front: {
    vi: "USB-C trái phía trước",
    en: "Left front USB-C port",
  },
  usb_c_right_rear: {
    vi: "USB-C phải phía sau",
    en: "Right rear USB-C port",
  },
  usb_c_right_front: {
    vi: "USB-C phải phía trước",
    en: "Right front USB-C port",
  },
  usb_c_right_single: {
    vi: "USB-C bên phải",
    en: "Right-side USB-C port",
  },
};
export const DESKTOP_PORT_FINDING_SCOPES = [
  ["usb_c_left_rear", "usb_c_left_front", "headphone_3_5mm"],
  [
    "usb_c_left_rear",
    "usb_c_left_front",
    "usb_c_right_rear",
    "usb_c_right_front",
    "headphone_3_5mm",
  ],
  ["magsafe", "usb_c_left_rear", "usb_c_left_front", "headphone_3_5mm"],
  [
    "magsafe",
    "usb_c_left_rear",
    "usb_c_left_front",
    "headphone_3_5mm",
    "hdmi",
    "usb_c_right_single",
    "sdxc",
  ],
  [
    "magsafe",
    "usb_c_left_rear",
    "usb_c_left_front",
    "headphone_3_5mm",
    "hdmi",
    "sdxc",
  ],
] as const satisfies readonly (readonly DesktopFindingId[])[];
type DesktopResultBase = Readonly<{
  diagnostic_id: DesktopDiagnosticId;
  outcome: DesktopDiagnosticOutcome;
  summary: string | null;
  observations: readonly Readonly<{
    key: string;
    value: string;
    unit: string | null;
  }>[];
}>;
type DesktopDeviceCheckPayloadBase<TResult extends DesktopResultBase> =
  Readonly<{
    diagnostic_session_id: string;
    client_submission_id: string;
    client_session_id: string;
    authorization_id: string;
    device_subject_id: string;
    device_observation_id: string;
    feature_id: "full_device_check";
    run_mode: "full";
    completed_at: string;
    identity:
      | Readonly<{ role: "user"; technician_shop_id: null }>
      | Readonly<{ role: "technician_shop"; technician_shop_id: string }>;
    device: Readonly<{ model_identifier: string }>;
    expected_diagnostic_ids: readonly DesktopDiagnosticId[];
    completed_diagnostic_ids: readonly DesktopDiagnosticId[];
    results: readonly TResult[];
    preflight: Readonly<{ completed: true; warnings: readonly string[] }>;
  }>;
export type DesktopManualCheck = Readonly<{
  check_id: "repair_history_components";
  inspection_state: "not_opened" | "opened";
  observation:
    | null
    | "no_visible_repair_signs"
    | "intervention_signs_found"
    | "inconclusive";
  note: string | null;
}>;
export type DesktopDeviceCheckPayloadV1 =
  DesktopDeviceCheckPayloadBase<DesktopResultBase> &
    Readonly<{
      schema_version: typeof DESKTOP_DEVICE_CHECK_SCHEMA_V1;
    }>;
export type DesktopDeviceCheckPayloadV2 =
  DesktopDeviceCheckPayloadBase<DesktopResultBase> &
    Readonly<{
      schema_version: typeof DESKTOP_DEVICE_CHECK_SCHEMA_V2;
      manual_checks: readonly DesktopManualCheck[];
    }>;
export type DesktopDiagnosticFinding = Readonly<{
  finding_id: DesktopFindingId;
  outcome: DesktopDiagnosticOutcome;
  summary: string | null;
}>;
export type DesktopDeviceCheckResultV3 = DesktopResultBase &
  Readonly<{
    finding_scope: readonly DesktopFindingId[];
    findings: readonly DesktopDiagnosticFinding[];
  }>;
export type DesktopDeviceCheckPayloadV3 =
  DesktopDeviceCheckPayloadBase<DesktopDeviceCheckResultV3> &
    Readonly<{
      schema_version: typeof DESKTOP_DEVICE_CHECK_SCHEMA_V3;
      manual_checks: readonly DesktopManualCheck[];
    }>;
export type DesktopDeviceSnapshotV4 = Readonly<{
  serial: string;
  model_identifier: string;
  marketing_model: string | null;
  family: string | null;
  chip: string | null;
  memory_gb: number | null;
  storage_nominal_capacity_bytes: number | null;
  storage_actual_capacity_bytes: number | null;
  part_number: string | null;
  regional_suffix: string | null;
  macos_version: string | null;
  architecture: string | null;
}>;
export type DesktopBatterySnapshotV4 = Readonly<{
  availability: DesktopSnapshotAvailability;
  source: string | null;
  unavailable_reason: string | null;
  current_capacity_mah: number | null;
  design_capacity_mah: number | null;
  health_percent: number | null;
  system_reported_health_percent: number | null;
  raw_capacity_health_percent: number | null;
  health_deviation_points: number | null;
  health_deviation_assessment: "normal" | "warning" | "high_risk" | null;
  cycle_count: number | null;
  condition: string | null;
  status: string | null;
}>;
export type DesktopSsdHealthSnapshotV4 = Readonly<{
  availability: DesktopSnapshotAvailability;
  source: string | null;
  unavailable_reason: string | null;
  percentage_used: number | null;
  data_units_written: number | null;
  total_bytes_written: number | null;
  critical_warning: number | null;
  available_spare_percent: number | null;
  media_errors: number | null;
  data_integrity_errors: number | null;
  smart_state: string | null;
  estimated_health_percent: number | null;
  power_on_hours: number | null;
  power_cycles: number | null;
  unsafe_shutdowns: number | null;
}>;
export type DesktopSsdSnapshotV4 = Readonly<{
  nominal_capacity_bytes: number | null;
  actual_capacity_bytes: number | null;
  protocol: string | null;
  is_internal: boolean | null;
  is_solid_state: boolean | null;
  trim_enabled: boolean | null;
  health_data: DesktopSsdHealthSnapshotV4;
}>;
export type DesktopDiagnosticFindingV4 = Readonly<{
  finding_id: DesktopFindingId;
  outcome: DesktopDiagnosticOutcome;
  terminal_state: DesktopInspectionTerminalState;
  source: DesktopInspectionSource;
  observation: string | null;
  summary: string | null;
  note: string | null;
}>;
export type DesktopDeviceCheckResultV4 = Readonly<{
  diagnostic_id: DesktopDiagnosticId;
  outcome: DesktopDiagnosticOutcome;
  terminal_state: DesktopInspectionTerminalState;
  source: DesktopInspectionSource;
  observation: string | null;
  summary: string | null;
  note: string | null;
  observations: readonly Readonly<{
    key: string;
    value: string;
    unit: string | null;
    source: DesktopInspectionSource;
  }>[];
  finding_scope: readonly DesktopFindingId[];
  findings: readonly DesktopDiagnosticFindingV4[];
}>;
export type DesktopManualCheckV4 = DesktopManualCheck &
  Readonly<{ source: "manual" }>;
export type DesktopDeviceCheckPayloadV4 = Readonly<{
  schema_version: typeof DESKTOP_DEVICE_CHECK_SCHEMA_V4;
  diagnostic_session_id: string;
  client_submission_id: string;
  client_session_id: string;
  authorization_id: string;
  device_subject_id: string;
  device_observation_id: string;
  feature_id: "full_device_check";
  run_mode: "full";
  completed_at: string;
  identity:
    | Readonly<{ role: "user"; technician_shop_id: null }>
    | Readonly<{ role: "technician_shop"; technician_shop_id: string }>;
  app: Readonly<{ version: string; build: number }>;
  device: DesktopDeviceSnapshotV4;
  battery: DesktopBatterySnapshotV4;
  ssd: DesktopSsdSnapshotV4;
  expected_diagnostic_ids: readonly DesktopDiagnosticId[];
  completed_diagnostic_ids: readonly DesktopDiagnosticId[];
  results: readonly DesktopDeviceCheckResultV4[];
  manual_checks: readonly DesktopManualCheckV4[];
  preflight: Readonly<{ completed: true; warnings: readonly string[] }>;
}>;
export type DesktopDeviceCheckPayload =
  | DesktopDeviceCheckPayloadV1
  | DesktopDeviceCheckPayloadV2
  | DesktopDeviceCheckPayloadV3
  | DesktopDeviceCheckPayloadV4;
export type DesktopDeviceCheckErrorCode =
  | import("../desktop-authority/lifecycle-errors").DesktopAuthorityLifecycleErrorCode
  | "invalid_request"
  | "authorization_required"
  | "authorization_invalid"
  | "authorization_expired"
  | "device_observation_required"
  | "device_observation_invalid"
  | "device_observation_mismatch"
  | "report_limit_reached"
  | "feature_not_allowed"
  | "full_check_required"
  | "incomplete_check"
  | "unsupported_schema"
  | "invalid_diagnostic_scope"
  | "invalid_manual_check"
  | "identity_verification_not_available"
  | "partner_not_available"
  | "submission_conflict"
  | "captcha_required"
  | "captcha_invalid"
  | "captcha_unavailable"
  | "server_unavailable";
export class DesktopDeviceCheckError extends Error {
  readonly code: DesktopDeviceCheckErrorCode;
  constructor(code: DesktopDeviceCheckErrorCode) {
    super(code);
    this.code = code;
  }
}
