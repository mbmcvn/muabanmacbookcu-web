import "server-only";
import type { PublicDesktopDeviceCheckReport } from "@/lib/care-report/desktop-public-report";
const ORIGIN = "https://app.mbmc.vn";
export async function getPublicInspectionReport(id: string): Promise<PublicDesktopDeviceCheckReport | null> {
  if (!/^dcr_[A-Za-z0-9_-]{24}$/.test(id)) return null;
  const response = await fetch(ORIGIN + "/api/public/desktop/report/" + id, { cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Report temporarily unavailable");
  return response.json();
}
export type CareLookupWarranty = { status: "active" | "expired" | null; expiresAt: string | null; durationLabel: string | null };
export type CareLookupResult = { warranty?: CareLookupWarranty | null; machine_id: string | null; machine_path: string | null; reports: Array<{report_id: string; accepted_at: string; display_name: string; report_path: string}> };
export class InvalidCareLookupError extends Error {}

function isCareLookupResult(value: unknown): value is CareLookupResult {
  if (!value || typeof value !== "object") return false;
  const result = value as CareLookupResult;
  const nullableString = (field: unknown) => field === null || typeof field === "string";
  const warranty = result.warranty;
  const validWarranty = warranty == null || (typeof warranty === "object" &&
    (warranty.status === null || warranty.status === "active" || warranty.status === "expired") &&
    nullableString(warranty.durationLabel) &&
    (warranty.expiresAt === null || (typeof warranty.expiresAt === "string" && Number.isFinite(Date.parse(warranty.expiresAt)))));
  return validWarranty && nullableString(result.machine_id) &&
    nullableString(result.machine_path) &&
    (result.machine_id === null ? result.machine_path === null : typeof result.machine_path === "string") &&
    Array.isArray(result.reports) && result.reports.every(report =>
      report && typeof report === "object" &&
      typeof report.report_id === "string" &&
      typeof report.accepted_at === "string" &&
      typeof report.display_name === "string" &&
      typeof report.report_path === "string"
    );
}

export async function lookupCare(lookup: string): Promise<CareLookupResult | null> {
  const response = await fetch(ORIGIN + "/api/public/care/lookup", { method: "POST", headers: {"content-type":"application/json"}, body: JSON.stringify({lookup}), cache: "no-store" });
  // A host/router HTML 404 is an outage, not a lookup miss. Only the
  // operational endpoint's JSON error contract determines public lookup states.
  if (!/^application\/json(?:\s*;|$)/i.test(response.headers.get("content-type") ?? ""))
    throw new Error("Care temporarily unavailable");
  let body: unknown;
  try { body = await response.json(); }
  catch { throw new Error("Care temporarily unavailable"); }
  const errorCode = body && typeof body === "object" && "error" in body ? body.error : null;
  if (response.status === 404 && errorCode === "not_found") return null;
  if (response.status === 400 && errorCode === "invalid_lookup")
    throw new InvalidCareLookupError("Invalid lookup");
  if (!response.ok || !isCareLookupResult(body))
    throw new Error("Care temporarily unavailable");
  return body;
}
