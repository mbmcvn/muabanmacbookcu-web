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
export type CareLookupResult = { machine_id: string | null; machine_path: string | null; reports: Array<{report_id: string; accepted_at: string; display_name: string; report_path: string}> };
export async function lookupCare(lookup: string): Promise<CareLookupResult | null> {
  const response = await fetch(ORIGIN + "/api/public/care/lookup", { method: "POST", headers: {"content-type":"application/json"}, body: JSON.stringify({lookup}), cache: "no-store" });
  if (response.status === 400 || response.status === 404) return null;
  if (!response.ok) throw new Error("Care temporarily unavailable");
  return response.json();
}
