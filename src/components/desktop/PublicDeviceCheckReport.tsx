import Link from "next/link";
import PublicDisplayEvidence from "./PublicDisplayEvidence";
import type { PublicDesktopDeviceCheckReport } from "@/lib/care-report/desktop-public-report";
import type { DesktopReportHighlight } from "@/lib/care-report/desktop-report-presentation";
import { desktopDiagnosticSummaryVi } from "@/lib/care-report/desktop-report-copy";
import {
  groupPublicDesktopDiagnostics,
  publicAuthorityExplanation,
  publicDeviceCapacity,
  publicInspectionDisplayName,
  publicInspectionTypeLabel,
  publicPhysicalInspectionPresentation,
  publicReportDecision,
  publicReportPublicationType,
  publicStorageCapacity,
} from "@/lib/care-report/desktop-public-report-view";
import CopyReportLinkButton from "./CopyReportLinkButton";
import {
  desktopAssessmentVi,
  desktopBatteryStatusVi,
  desktopEnumVi,
  formatDesktopCapacity,
  formatDesktopInteger,
  formatPublicPercentagePoints,
  formatDesktopPercent,
} from "@/lib/care-report/desktop-report-format";

type Report = PublicDesktopDeviceCheckReport;
type Diagnostic = Report["diagnostics"][number];

const statusStyle = {
  passed:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
  warning:
    "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200",
  failed:
    "border-red-300 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200",
  unknown:
    "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
} as const;

function time(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(value));
}

function historicalHighlights(report: Report) {
  if ("issues" in report && "undetermined" in report)
    return {
      issues: report.issues as DesktopReportHighlight[],
      undetermined: report.undetermined as DesktopReportHighlight[],
    };
  const asHighlight = (diagnostic: Diagnostic): DesktopReportHighlight => ({
    diagnostic_id: diagnostic.diagnostic_id,
    finding_id: null,
    title: diagnostic.title,
    outcome: diagnostic.outcome as "warning" | "failed" | "unknown",
    outcome_label: diagnostic.outcome_label,
  });
  return {
    issues: report.diagnostics
      .filter((item) => item.outcome === "warning" || item.outcome === "failed")
      .map(asHighlight),
    undetermined: report.diagnostics
      .filter((item) => item.outcome === "unknown")
      .map(asHighlight),
  };
}

function summaryFor(report: Report, highlight: DesktopReportHighlight) {
  const diagnostic = report.diagnostics.find(
    (item) => item.diagnostic_id === highlight.diagnostic_id,
  );
  if (!diagnostic) return null;
  if (highlight.finding_id === null)
    return desktopDiagnosticSummaryVi(
      diagnostic.diagnostic_id,
      diagnostic.summary,
    );
  if (!("findings" in diagnostic)) return null;
  const summary = (diagnostic.findings as Array<{finding_id: string; summary: string | null}>).find(
    (item) => item.finding_id === highlight.finding_id,
  )?.summary;
  return desktopDiagnosticSummaryVi(diagnostic.diagnostic_id, summary);
}

function HighlightList({
  items,
  report,
  tone,
}: {
  items: DesktopReportHighlight[];
  report: Report;
  tone: "issue" | "unknown";
}) {
  return (
    <ul className="mt-4 grid gap-3 sm:grid-cols-2">
      {items.map((item) => {
        const parent = report.diagnostics.find(
          (diagnostic) => diagnostic.diagnostic_id === item.diagnostic_id,
        );
        const summary = summaryFor(report, item);
        return (
          <li
            key={`${item.diagnostic_id}:${item.finding_id ?? "parent"}`}
            className={`rounded-2xl border p-4 ${statusStyle[item.outcome]}`}
          >
            <div className="flex items-start justify-between gap-4">
              <p className="font-bold">{item.title.vi}</p>
              <span className="shrink-0 rounded-full border border-current/20 px-2.5 py-1 text-xs font-bold">
                {item.outcome_label.vi}
              </span>
            </div>
            {item.finding_id && parent && (
              <p className="mt-2 text-xs opacity-75">{parent.title.vi}</p>
            )}
            {summary && <p className="mt-2 text-sm">{summary}</p>}
            {tone === "unknown" && (
              <span className="sr-only">Kết quả chưa xác định</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function PublicDeviceCheckReport({
  report,
}: {
  report: Report;
}) {
  const { issues, undetermined } = historicalHighlights(report);
  const diagnosticGroups = groupPublicDesktopDiagnostics(report.diagnostics);
  const physicalInspection = publicPhysicalInspectionPresentation(report);
  const deviceName =
    report.device.display_name ??
    report.device.family ??
    report.device.model_identifier;
  const memory = publicDeviceCapacity(report.device.memory_bytes);
  const storage = publicStorageCapacity(
    report.device.storage_nominal_capacity_bytes ?? report.device.storage_bytes,
  );
  const identityBase = [
    report.device.serial,
    report.device.model_identifier,
  ].filter(Boolean);
  const identityQualifiers = [
    report.device.part_number,
    report.device.regional_suffix,
  ].filter(Boolean);
  const configurationParts = [
    report.device.chip,
    memory ? `RAM ${memory}` : null,
    storage ? `Lưu trữ ${storage}` : null,
  ].filter(Boolean);
  const publicationType = publicReportPublicationType(report.submitter);
  const authorityIsVerified =
    publicationType === "verified_inspection" ||
    publicationType === "delegated_inspection";
  const networkName =
    "network_name" in report.submitter ? report.submitter.network_name : null;
  const partnerCode =
    "partner_code" in report.submitter ? report.submitter.partner_code : null;
  const partnerPublicId =
    "partner_public_id" in report.submitter
      ? report.submitter.partner_public_id
      : null;
  const inspectionTypeLabel = publicInspectionTypeLabel(report.submitter);
  const inspectorName = publicInspectionDisplayName(report.submitter);
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-950 dark:bg-slate-950 dark:text-slate-100 sm:py-10">
      <article className="mx-auto max-w-4xl space-y-5">
        <header className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl ring-1 ring-white/10 dark:bg-slate-900 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
            MBMC DESKTOP · KIỂM TRA THIẾT BỊ
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{deviceName}</h1>
          {identityBase.length > 0 && (
            <p className="mt-2 text-sm text-slate-300">
              {identityBase.join(" - ")}
              {identityQualifiers.length > 0 &&
                ` · ${identityQualifiers.join(" · ")}`}
            </p>
          )}
          {configurationParts.length > 0 && (
            <p className="mt-1 text-sm font-semibold text-blue-200">
              {configurationParts.join(" - ")}
            </p>
          )}
          {report.device.serial && (
            <Link
              href="/care"
              className="mt-3 inline-flex text-sm font-bold text-blue-200 underline decoration-blue-400 underline-offset-4 hover:text-white"
            >
              Tra cứu lịch sử kiểm định
            </Link>
          )}
          <dl className="mt-6 grid gap-4 border-t border-white/15 pt-5 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-400">Mã báo cáo</dt>
              <dd className="mt-1 break-all font-mono text-xs">
                {report.report_id}
              </dd>
            </div>
            <div>
              <dt className="text-slate-400">Hoàn tất</dt>
              <dd className="mt-1 font-semibold">
                {time(report.completed_at)} (GMT+7)
              </dd>
            </div>
          </dl>
          <div className="mt-5 flex flex-col gap-3 border-t border-white/15 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-xs leading-5 text-slate-300">
              {report.immutable_notice.vi}
            </p>
            <CopyReportLinkButton
              reportId={report.report_id}
              deviceName={deviceName}
            />
          </div>
        </header>

        <section
          aria-labelledby="overview-title"
          className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 sm:p-6"
        >
          <h2 id="overview-title" className="text-2xl font-bold">
            Tóm tắt báo cáo
          </h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Kết luận nhanh
              </p>
              <p className="mt-2 text-lg font-bold">
                {publicReportDecision(report)}
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Đạt {report.summary.passed} · Cần chú ý {report.summary.warning}{" "}
                · Không đạt {report.summary.failed} · Chưa rõ{" "}
                {report.summary.unknown}
              </p>
            </div>
            <div
              className={`rounded-2xl border p-4 ${authorityIsVerified ? "border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30" : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50"}`}
            >
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Kiểm định bởi
              </p>
              <p className="mt-2 text-lg font-bold">{inspectorName}</p>
              <dl className="mt-3 space-y-1 text-sm">
                <div>
                  <dt className="inline text-slate-500">Loại kiểm định: </dt>
                  <dd className="inline font-semibold">
                    {inspectionTypeLabel}
                  </dd>
                </div>
                <div>
                  <dt className="inline text-slate-500">
                    Thời gian kiểm định:{" "}
                  </dt>
                  <dd className="inline font-semibold">
                    {time(report.accepted_at ?? report.completed_at)}
                  </dd>
                </div>
              </dl>
              {report.submitter.display_name &&
                (partnerPublicId ? (
                  <Link
                    href={`https://app.mbmc.vn/inspector/${partnerPublicId}`}
                    className="mt-2 inline-flex font-bold text-blue-700 underline decoration-blue-300 underline-offset-4 hover:text-blue-900 dark:text-blue-200"
                  >
                    {report.submitter.display_name} · Xem hồ sơ công khai
                  </Link>
                ) : (
                  <p className="mt-1 font-semibold">
                    {partnerCode ? `${partnerCode} · ` : ""}
                    {report.submitter.display_name}
                  </p>
                ))}
              {networkName && (
                <p className="mt-1 text-sm">Mạng lưới: {networkName}</p>
              )}
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {publicAuthorityExplanation(report.submitter)}
              </p>
            </div>
            <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-900 dark:bg-violet-950/25">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Kiểm tra vật lý
              </p>
              <p className="mt-2 text-lg font-bold">
                {physicalInspection.label}
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {physicalInspection.detail}
              </p>
            </div>
          </div>
        </section>

        {report.battery && (
          <section
            className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 sm:p-6"
            aria-labelledby="battery-title"
          >
            <h2 id="battery-title" className="text-xl font-bold">
              Pin
            </h2>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <dt className="text-slate-500">
                  Dung lượng hiện tại / thiết kế
                </dt>
                <dd className="mt-1 font-semibold">
                  {formatDesktopInteger(
                    report.battery.current_capacity_mah,
                    " mAh",
                  )}{" "}
                  /{" "}
                  {formatDesktopInteger(
                    report.battery.design_capacity_mah,
                    " mAh",
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Chu kỳ</dt>
                <dd className="mt-1 font-semibold">
                  {formatDesktopInteger(report.battery.cycle_count)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">
                  Dung lượng tối đa hệ thống báo
                </dt>
                <dd className="mt-1 font-semibold">
                  {formatDesktopPercent(
                    report.battery.system_reported_health_percent,
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">
                  Sức khỏe theo dung lượng thực tế
                </dt>
                <dd className="mt-1 font-semibold">
                  {formatDesktopPercent(
                    report.battery.raw_capacity_health_percent,
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Độ lệch</dt>
                <dd className="mt-1 font-semibold">
                  {formatPublicPercentagePoints(
                    report.battery.health_deviation_points,
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Đánh giá độ lệch</dt>
                <dd className="mt-1 font-semibold">
                  {desktopEnumVi(
                    report.battery.health_deviation_assessment,
                    desktopAssessmentVi,
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Tình trạng</dt>
                <dd className="mt-1 font-semibold">
                  {desktopEnumVi(report.battery.status, desktopBatteryStatusVi)}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-slate-500">
              Độ lệch là chênh lệch giữa dung lượng tối đa hệ thống báo và sức
              khỏe theo dung lượng thực tế.
            </p>
          </section>
        )}

        {report.ssd && (
          <section
            className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 sm:p-6"
            aria-labelledby="ssd-title"
          >
            <h2 id="ssd-title" className="text-xl font-bold">
              SSD
            </h2>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <dt className="text-slate-500">Sức khỏe SSD ước tính</dt>
                <dd className="mt-1 font-semibold">
                  {formatDesktopPercent(report.ssd.estimated_health_percent)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Tuổi thọ đã dùng</dt>
                <dd className="mt-1 font-semibold">
                  {formatDesktopPercent(report.ssd.percentage_used)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Tổng dữ liệu đã ghi</dt>
                <dd className="mt-1 font-semibold">
                  {formatDesktopCapacity(report.ssd.total_bytes_written)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Cảnh báo nghiêm trọng</dt>
                <dd className="mt-1 font-semibold">
                  {report.ssd.critical_warning === 0
                    ? "Không"
                    : formatDesktopInteger(report.ssd.critical_warning)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Dung lượng dự phòng</dt>
                <dd className="mt-1 font-semibold">
                  {formatDesktopPercent(report.ssd.available_spare_percent)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Lỗi media / toàn vẹn dữ liệu</dt>
                <dd className="mt-1 font-semibold">
                  {formatDesktopInteger(report.ssd.media_errors)} /{" "}
                  {formatDesktopInteger(report.ssd.data_integrity_errors)}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-slate-500">
              Sức khỏe SSD ước tính dựa trên chỉ số hao mòn NVMe, không phải dự
              đoán chắc chắn khả năng hỏng ổ.
            </p>
          </section>
        )}

        <section
          aria-labelledby="issues-title"
          className={`rounded-3xl border p-5 sm:p-6 ${issues.length ? "border-amber-300 bg-amber-50/80 dark:border-amber-800 dark:bg-amber-950/20" : "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30"}`}
        >
          <h2 id="issues-title" className="text-2xl font-bold">
            Vấn đề phát hiện
          </h2>
          {issues.length ? (
            <HighlightList items={issues} report={report} tone="issue" />
          ) : (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-white/70 p-4 dark:border-emerald-900 dark:bg-slate-900/70">
              <p className="font-semibold">
                Không phát hiện vấn đề cần chú ý trong các hạng mục đã kiểm tra.
              </p>
            </div>
          )}
        </section>

        {undetermined.length > 0 && (
          <section
            aria-labelledby="undetermined-title"
            className="rounded-3xl border border-slate-300 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900 sm:p-6"
          >
            <h2 id="undetermined-title" className="text-2xl font-bold">
              Chưa thể xác định
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
              Các hạng mục dưới đây đã được thực hiện nhưng chưa có đủ bằng
              chứng để kết luận.
            </p>
            <HighlightList
              items={undetermined}
              report={report}
              tone="unknown"
            />
          </section>
        )}

        <section
          aria-labelledby="summary-title"
          className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 sm:p-6"
        >
          <h2 id="summary-title" className="font-bold">
            Tổng hợp theo nhóm kiểm tra
          </h2>
          <p className="mt-3 text-sm font-semibold sm:text-base">
            <span className="text-emerald-700 dark:text-emerald-300">
              Đạt {report.summary.passed}
            </span>
            {" · "}
            <span className="text-amber-700 dark:text-amber-300">
              Cần chú ý {report.summary.warning}
            </span>
            {" · "}
            <span className="text-red-700 dark:text-red-300">
              Không đạt {report.summary.failed}
            </span>
            {" · "}
            <span className="text-slate-600 dark:text-slate-300">
              Chưa thể xác định {report.summary.unknown}
            </span>
          </p>
        </section>

        <section
          aria-labelledby="detail-title"
          className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 sm:p-6"
        >
          <h2 id="detail-title" className="text-2xl font-bold">
            Chi tiết kiểm tra
          </h2>
          <div className="mt-4 space-y-5">
            {diagnosticGroups.map((group) => (
              <section
                key={group.id}
                className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700 sm:p-5"
              >
                <h3 className="text-lg font-bold">{group.title}</h3>
                <div className="mt-3 space-y-3">
                  {group.diagnostics.map((item) => (
                    <details
                      key={item.diagnostic_id}
                      className="rounded-xl bg-slate-50 p-4 open:ring-1 open:ring-slate-200 dark:bg-slate-800/60 dark:open:ring-slate-700"
                    >
                      <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                        <span className="font-bold">{item.title.vi}</span>
                        <span
                          className={`w-fit rounded-full border px-3 py-1 text-xs font-bold ${statusStyle[item.outcome]}`}
                        >
                          {item.outcome_label.vi}
                        </span>
                      </summary>
                      {item.summary && (
                        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                          {desktopDiagnosticSummaryVi(
                            item.diagnostic_id,
                            item.summary,
                          )}
                        </p>
                      )}
                      {"findings" in item && item.findings.length > 0 && (
                        <ul className="mt-4 space-y-2 border-l-2 border-slate-200 pl-3 dark:border-slate-700 sm:pl-5">
                          {item.findings.map((finding) => (
                            <li
                              key={finding.finding_id}
                              className="flex flex-col gap-1 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                            >
                              <div>
                                <p className="font-semibold">
                                  {finding.title.vi}
                                </p>
                                {finding.summary && (
                                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                    {desktopDiagnosticSummaryVi(
                                      item.diagnostic_id,
                                      finding.summary,
                                    )}
                                  </p>
                                )}
                              </div>
                              <span
                                className={`w-fit shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold ${statusStyle[finding.outcome]}`}
                              >
                                {finding.outcome_label.vi}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {item.diagnostic_id === "display" && item.displayEvidence && (
                        <PublicDisplayEvidence evidence={item.displayEvidence} />
                      )}
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>

        {report.manual_inspection && (
          <section
            aria-labelledby="manual-title"
            className="rounded-3xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900 dark:bg-blue-950/30 sm:p-6"
          >
            <h2 id="manual-title" className="text-xl font-bold">
              Kiểm tra trực tiếp
            </h2>
            <p className="mt-3 font-semibold">{report.manual_inspection.vi}</p>
            {report.manual_inspection.supporting_vi && (
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {report.manual_inspection.supporting_vi}
              </p>
            )}
            {report.manual_inspection.note && (
              <p className="mt-3 rounded-xl bg-white/70 p-3 text-sm dark:bg-slate-900/70">
                Ghi chú: {report.manual_inspection.note}
              </p>
            )}
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              {report.submitter.manual_provenance_vi}. Đây là quan sát tại thời
              điểm kiểm tra, không phải bằng chứng về tính nguyên bản hoặc toàn
              bộ lịch sử sửa chữa.
            </p>
          </section>
        )}

        <section
          aria-labelledby="meaning-title"
          className="grid gap-4 rounded-3xl bg-slate-950 p-5 text-white shadow-sm sm:p-6 lg:grid-cols-2"
        >
          <div>
            <h2 id="meaning-title" className="text-xl font-bold">
              Báo cáo này có ý nghĩa gì?
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Đây là ảnh chụp trạng thái thiết bị tại thời điểm kiểm tra. Chẩn
              đoán phần mềm xác nhận được nhiều hành vi của thiết bị, nhưng
              không chứng minh tuyệt đối lịch sử linh kiện hay tính nguyên bản.
              Tình trạng máy có thể thay đổi sau thời điểm này.
            </p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-blue-300">
              Toàn vẹn & lịch sử
            </p>
            <p className="mt-2 font-semibold">{report.immutable_notice.vi}</p>
            <p className="mt-2 text-sm text-slate-300">
              Danh tính và mức Authority được lưu cố định khi báo cáo được tiếp
              nhận.
            </p>
            <dl className="mt-3 space-y-2 text-xs text-slate-300">
              <div>
                <dt className="inline text-slate-400">Thời điểm kiểm tra: </dt>
                <dd className="inline">{time(report.completed_at)} (GMT+7)</dd>
              </div>
              <div>
                <dt className="inline text-slate-400">Mã tham chiếu: </dt>
                <dd className="inline break-all font-mono">
                  {report.report_id}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section
          aria-labelledby="limitations-title"
          className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6"
        >
          <h2 id="limitations-title" className="font-bold">
            Giới hạn của báo cáo
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
            {report.limitations.vi.map((item) => (
              <li key={item}>{item}</li>
            ))}
            <li>
              Một số kết quả tương tác có hướng dẫn không thể chứng minh sự kiện
              phát sinh từ phần cứng tích hợp khi API hệ thống không xác lập
              được nguồn.
            </li>
          </ul>
        </section>
        <footer className="pb-8 text-center text-xs text-slate-500">
          {report.immutable_notice.vi}
        </footer>
      </article>
    </main>
  );
}
