import type { PublicDesktopDeviceCheckReport } from "./desktop-public-report";

type Report = PublicDesktopDeviceCheckReport;
type Diagnostic = Report["diagnostics"][number];

const DIAGNOSTIC_GROUPS = [
  {
    id: "device",
    title: "Thiết bị & cấu hình",
    diagnosticIds: ["system_overview"],
  },
  {
    id: "power-storage",
    title: "Pin, sạc & lưu trữ",
    diagnosticIds: ["battery", "charging", "storage"],
  },
  { id: "display", title: "Màn hình", diagnosticIds: ["display"] },
  {
    id: "input",
    title: "Bàn phím & Touch ID",
    diagnosticIds: ["keyboard", "touch_id"],
  },
  { id: "trackpad", title: "Trackpad", diagnosticIds: ["trackpad"] },
  {
    id: "audio",
    title: "Loa & micrô",
    diagnosticIds: ["speakers", "microphone"],
  },
  { id: "camera", title: "Camera", diagnosticIds: ["camera"] },
  {
    id: "wireless",
    title: "Wi-Fi & Bluetooth",
    diagnosticIds: ["wifi", "bluetooth"],
  },
  { id: "ports", title: "Cổng kết nối", diagnosticIds: ["ports"] },
] as const;

export function groupPublicDesktopDiagnostics(diagnostics: Diagnostic[]) {
  const knownIds = new Set(
    DIAGNOSTIC_GROUPS.flatMap((group) => [...group.diagnosticIds]),
  );
  const groups = DIAGNOSTIC_GROUPS.map((group) => ({
    id: group.id,
    title: group.title,
    diagnostics: diagnostics.filter((diagnostic) =>
      (group.diagnosticIds as readonly string[]).includes(
        diagnostic.diagnostic_id,
      ),
    ),
  })).filter((group) => group.diagnostics.length > 0);
  const remaining = diagnostics.filter(
    (diagnostic) => !knownIds.has(diagnostic.diagnostic_id),
  );

  return remaining.length > 0
    ? [
        ...groups,
        { id: "other", title: "Kiểm tra khác", diagnostics: remaining },
      ]
    : groups;
}

export function publicReportDecision(report: Report) {
  if (report.summary.failed > 0) return "Có hạng mục không đạt";
  if (report.summary.warning > 0) return "Có điểm cần lưu ý";
  if (report.summary.unknown > 0) return "Có hạng mục chưa thể xác định";
  return "Không phát hiện vấn đề đáng chú ý trong các bài kiểm tra đã thực hiện";
}

export function publicReportPublicationType(submitter: Report["submitter"]) {
  if ("publication_type" in submitter) return submitter.publication_type;
  return submitter.role === "technician_shop" ? "legacy_partner" : "self_check";
}

export function publicInspectionTypeLabel(submitter: Report["submitter"]) {
  switch (publicReportPublicationType(submitter)) {
    case "verified_inspection":
      return "Kiểm định xác minh";
    case "delegated_inspection":
      return "Kiểm định được ủy quyền";
    default:
      return "Tự kiểm tra";
  }
}

export function publicInspectionDisplayName(submitter: Report["submitter"]) {
  const publicationType = publicReportPublicationType(submitter);
  if (publicationType === "delegated_inspection")
    return (
      ("network_name" in submitter ? submitter.network_name : null) ??
      ("display_name" in submitter ? submitter.display_name : null) ??
      "Mạng lưới MBMC"
    );
  if (publicationType === "verified_inspection")
    return (
      ("display_name" in submitter ? submitter.display_name : null) ??
      "Đối tác MBMC đã xác minh"
    );
  return "Người dùng";
}

export function publicAuthorityExplanation(submitter: Report["submitter"]) {
  switch (publicReportPublicationType(submitter)) {
    case "verified_inspection":
      return "Kiểm tra được thực hiện bởi kỹ thuật viên có quyền kiểm tra tại thời điểm báo cáo được chấp nhận.";
    case "delegated_inspection":
      return "Kiểm tra được thực hiện theo quyền ủy quyền của mạng lưới tại thời điểm báo cáo được chấp nhận.";
    case "legacy_partner":
      return "Báo cáo được gửi theo luồng đối tác cũ; thông tin này không tương đương xác minh kiểm tra vật lý.";
    default:
      return "Báo cáo tự kiểm tra trên thiết bị; không đồng nghĩa với kiểm tra vật lý đã được xác minh.";
  }
}

export function publicPhysicalInspectionPresentation(report: Report) {
  const manual = report.manual_inspection;
  if (!manual) {
    return {
      label: "Không có dữ liệu mở nắp",
      detail: "Báo cáo không công bố kết quả kiểm tra linh kiện bên trong.",
    };
  }
  if (manual.inspection_state === "not_opened") {
    return {
      label: "Chưa mở nắp máy",
      detail:
        "Linh kiện bên trong chưa được quan sát trực tiếp trong lần kiểm tra này.",
    };
  }

  const detailByOutcome: Record<string, string> = {
    no_visible_repair_signs:
      "Không ghi nhận dấu hiệu sửa chữa dễ nhận thấy trong phạm vi quan sát.",
    intervention_signs_found:
      "Ghi nhận dấu hiệu sửa chữa hoặc can thiệp trong phạm vi quan sát.",
    inconclusive: "Chưa đủ cơ sở kết luận sau khi mở nắp kiểm tra.",
  };
  return {
    label: "Đã mở nắp kiểm tra",
    detail:
      detailByOutcome[manual.observation ?? ""] ??
      "Kết quả quan sát được trình bày trong chi tiết báo cáo.",
  };
}

export function publicDeviceCapacity(bytes: number | null | undefined) {
  return bytes == null ? null : `${Math.round(bytes / 1024 ** 3)} GB`;
}

export function publicStorageCapacity(bytes: number | null | undefined) {
  return bytes == null ? null : `${Math.round(bytes / 1_000_000_000)} GB`;
}

export function canonicalPublicReportPath(reportId: string) {
  return `/care/report/${reportId}`;
}

export function publicDesktopReportMetadata(report: Report) {
  const deviceName =
    report.device.display_name ??
    report.device.family ??
    report.device.model_identifier;
  const publicationType = publicReportPublicationType(report.submitter);
  const authority =
    publicationType === "verified_inspection"
      ? "kiểm tra bởi kỹ thuật viên"
      : publicationType === "delegated_inspection"
        ? "kiểm tra theo quyền ủy quyền"
        : "tự kiểm tra";
  return {
    title: `${deviceName} · Báo cáo kiểm tra MBMC`,
    description: `Báo cáo ${authority} với kết quả chẩn đoán được lưu cố định tại thời điểm tiếp nhận.`,
  };
}
