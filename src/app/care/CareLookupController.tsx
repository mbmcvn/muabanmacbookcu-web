"use client";

import { useState, type FormEvent } from "react";
import { CareLookupForm } from "@/components/care/CareLookupForm";
import type { CareMachinePresentation } from "@/data/care/care-machine-presentation.server";
import { parseCareLookupResult, parseCareUserReports, type CareLookupResult } from "@/data/care/public-care-contract";
import { CareLookupSummary, CareReportList } from "./CareLookupResults";
import CareUserReports from "./CareUserReports";
import { PageState } from "@/components/ui/PageState";
import styles from "./lookup.module.css";

export default function CareLookupController({ initialResult, initialMachine, initialLookup, initialMessage }: {
  initialResult: CareLookupResult | null; initialMachine: CareMachinePresentation | null; initialLookup: string; initialMessage: string;
}) {
  const [result, setResult] = useState(initialResult);
  const [machine, setMachine] = useState(initialMachine);
  const [lookup, setLookup] = useState(initialLookup);
  const [message, setMessage] = useState(initialMessage);
  const [loading, setLoading] = useState(false);
  const [generation, setGeneration] = useState(0);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const currentLookup = String(new FormData(form).get("lookup") ?? "");
    setLoading(true); setResult(null); setMachine(null); setMessage("");
    // The lookup stays in memory/request transport, never in URL or returned props.
    const input = form.elements.namedItem("lookup") as HTMLInputElement;
    input.value = "";
    try {
      const response = await fetch("/api/public/care/lookup", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ lookup: currentLookup }), cache: "no-store" });
      if (!response.ok) {
        setMessage(response.status === 400 ? "Vui lòng kiểm tra Serial hoặc MBMC Machine ID đã nhập." : response.status === 404 ? "Không tìm thấy máy hoặc báo cáo kiểm tra công khai." : "Không thể tra cứu lúc này. Vui lòng thử lại.");
        return;
      }
      const body = await response.json();
      const parsed = parseCareLookupResult(body.result);
      setResult(parsed); setMachine(body.machine); setLookup(currentLookup); setGeneration(value => value + 1);
      input.value = parsed.machine_id ?? "";
    } catch { setMessage("Không thể tra cứu lúc này. Vui lòng thử lại."); }
    finally { setLoading(false); }
  }

  async function loadReports() {
    const response = await fetch("/api/public/care/user-reports", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ lookup }), cache: "no-store" });
    if (!response.ok) throw new Error("Care temporarily unavailable");
    return parseCareUserReports(await response.json());
  }

  return <>
    <div className={styles.searchModule}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>MBMC CARE</p><h1>Tra cứu Care</h1>
        <p>Mở hồ sơ máy, bảo hành và báo cáo kiểm tra công khai bằng Serial hoặc MBMC Machine ID.</p>
      </header>
      <CareLookupForm lookup={initialLookup} maxLength={40} autoCapitalize="characters" onSubmit={event => void submit(event)} disabled={loading} />
    </div>
    {message && <PageState className={styles.empty} role="status" description={message} />}
    {loading && <p role="status">Đang tra cứu…</p>}
    {result && <><CareLookupSummary result={result} machine={machine} /><CareReportList reports={result.inspection_reports} />
      <CareUserReports key={generation} count={result.user_reports.count} loadReports={loadReports} />
    </>}
  </>;
}
