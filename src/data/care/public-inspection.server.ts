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
export { parseCareLookupResult, parseCareUserReports } from "./public-care-contract";
import { parseCareLookupResult, parseCareUserReports } from "./public-care-contract";
export type { CareLookupResult, CareLookupWarranty } from "./public-care-contract";
import type { CareLookupResult, CareUserReports } from "./public-care-contract";
export class InvalidCareLookupError extends Error {}

export async function lookupCareUserReports(lookup: string): Promise<CareUserReports> {
  const response = await fetch(ORIGIN + "/api/public/care/user-reports", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ lookup }), cache: "no-store" });
  if (!response.ok || !/^application\/json(?:\s*;|$)/i.test(response.headers.get("content-type") ?? "")) throw new Error("Care temporarily unavailable");
  return parseCareUserReports(await response.json());
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
  if (!response.ok)
    throw new Error("Care temporarily unavailable");
  return parseCareLookupResult(body);
}
