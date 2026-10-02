import Link from "next/link";
import { lookupCare } from "@/data/care/public-inspection.server";
export const dynamic = "force-dynamic";
export const metadata = { title: "Tra cứu Care", robots: { index: false, follow: false } };
export default async function CareLookupPage({ searchParams }: { searchParams: Promise<{lookup?: string}> }) {
  const {lookup} = await searchParams;
  let result = null, unavailable = false;
  if (typeof lookup === "string" && lookup.length <= 40) {
    try { result = await lookupCare(lookup); } catch { unavailable = true; }
  }
  return <main className="mx-auto max-w-3xl space-y-6 px-6 py-12"><h1 className="text-3xl font-semibold">Tra cứu Care</h1><p>Nhập Serial hoặc MBMC Machine ID để xem báo cáo kiểm tra.</p>
    <form action="/care" className="flex gap-3"><label className="flex-1">Serial / MBMC Machine ID<input className="block w-full rounded border p-3" name="lookup" defaultValue={typeof lookup === "string" ? lookup : ""} required maxLength={40} autoCapitalize="characters" /></label><button className="self-end rounded bg-black px-5 py-3 text-white">Tra cứu</button></form>
    {lookup && !result && <p role="status">{unavailable ? "Tra cứu tạm thời không khả dụng. Vui lòng thử lại." : "Không tìm thấy máy hoặc báo cáo kiểm tra công khai."}</p>}
    {result?.machine_id && <p>MBMC Machine ID: <Link className="underline" href={result.machine_path!}>{result.machine_id} · Xem Care của máy</Link></p>}
    {result && <ul className="space-y-4">{result.reports.map(r => <li key={r.report_id} className="rounded border p-4"><Link className="underline" href={r.report_path}>{r.display_name} · {r.report_id}</Link><p>{new Date(r.accepted_at).toLocaleString("vi-VN", {timeZone:"Asia/Ho_Chi_Minh"})}</p></li>)}</ul>}
  </main>;
}
