export type CareLookupWarranty = { status: "active" | "expired" | null; expiresAt: string | null; durationLabel: string | null };
export type CareReportLink = { report_id: string; accepted_at: string; display_name: string; report_path: string };
export type CareInspectionLink = CareReportLink & { publication_type: "verified_inspection" | "delegated_inspection"; inspector_display_name: string };
export type CareLookupResult = { schema: "mbmc.public-care-lookup.v2"; machine_id: string | null; machine_path: string | null; warranty: CareLookupWarranty | null; inspection_reports: CareInspectionLink[]; user_reports: { count: number } };
export type CareUserReports = { schema: "mbmc.public-care-user-reports.v1"; reports: CareReportLink[] };

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Care temporarily unavailable");
  return value as Record<string, unknown>;
}
function string(value: unknown): string {
  if (typeof value !== "string") throw new Error("Care temporarily unavailable");
  return value;
}
function nullableString(value: unknown) { return value === null ? null : string(value); }
function timestamp(value: unknown) {
  const text = string(value);
  if (!Number.isFinite(Date.parse(text))) throw new Error("Care temporarily unavailable");
  return text;
}
function reportLink(value: unknown): CareReportLink {
  const r = object(value);
  const id = string(r.report_id);
  if (!/^dcr_[A-Za-z0-9_-]{24}$/.test(id) || r.report_path !== `/care/report/${id}`) throw new Error("Care temporarily unavailable");
  // Project only public fields; never forward unknown/private backend fields.
  return { report_id: id, accepted_at: timestamp(r.accepted_at), display_name: string(r.display_name), report_path: `/care/report/${id}` };
}
function array(value: unknown): unknown[] {
  if (!Array.isArray(value)) throw new Error("Care temporarily unavailable");
  return value;
}
export function parseCareLookupResult(value: unknown): CareLookupResult {
  const r = object(value);
  if (r.schema !== "mbmc.public-care-lookup.v2") throw new Error("Care temporarily unavailable");
  const machine_id = nullableString(r.machine_id);
  if (machine_id !== null && !/^MBMC-[A-Z0-9-]{1,35}$/.test(machine_id)) throw new Error("Care temporarily unavailable");
  if (r.machine_path !== (machine_id === null ? null : `/care/${machine_id}`)) throw new Error("Care temporarily unavailable");
  let warranty: CareLookupWarranty | null = null;
  if (r.warranty !== null) {
    const w = object(r.warranty);
    if (w.status !== null && w.status !== "active" && w.status !== "expired") throw new Error("Care temporarily unavailable");
    warranty = { status: w.status, expiresAt: w.expiresAt === null ? null : timestamp(w.expiresAt), durationLabel: nullableString(w.durationLabel) };
  }
  const inspection_reports = array(r.inspection_reports).map(value => {
    const i = object(value);
    if (i.publication_type !== "verified_inspection" && i.publication_type !== "delegated_inspection") throw new Error("Care temporarily unavailable");
    return { ...reportLink(i), publication_type: i.publication_type, inspector_display_name: string(i.inspector_display_name) } as CareInspectionLink;
  });
  const count = object(r.user_reports).count;
  if (typeof count !== "number" || !Number.isSafeInteger(count) || count < 0) throw new Error("Care temporarily unavailable");
  return { schema: r.schema, machine_id, machine_path: machine_id === null ? null : `/care/${machine_id}`, warranty, inspection_reports, user_reports: { count } };
}
export function parseCareUserReports(value: unknown): CareUserReports {
  const r = object(value);
  if (r.schema !== "mbmc.public-care-user-reports.v1") throw new Error("Care temporarily unavailable");
  return { schema: r.schema, reports: array(r.reports).map(reportLink).sort((a, b) => Date.parse(b.accepted_at) - Date.parse(a.accepted_at) || b.report_id.localeCompare(a.report_id)) };
}
