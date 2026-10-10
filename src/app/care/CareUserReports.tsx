"use client";

import { useState } from "react";
import { parseCareUserReports, type CareReportLink, type CareUserReports } from "@/data/care/public-care-contract";
import styles from "./lookup.module.css";

export default function CareUserReports({ loadReports, count }: { loadReports: () => Promise<CareUserReports>; count: number }) {
  const [expanded, setExpanded] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "loaded" | "error">("idle");
  const [reports, setReports] = useState<CareReportLink[]>([]);
  if (count === 0) return null;

  async function load() {
    setExpanded(true);
    setState("loading");
    try {
      setReports(parseCareUserReports(await loadReports()).reports);
      setState("loaded");
    } catch { setState("error"); }
  }

  return <section className={styles.userReports} aria-label="Kết quả tự kiểm tra của người dùng">
    <p>Có {count} kết quả tự kiểm tra của người dùng</p>
    <button type="button" aria-expanded={expanded} aria-controls="care-user-reports" disabled={state === "loading"}
      onClick={() => { if (!expanded && (state === "idle" || state === "error")) void load(); else setExpanded(!expanded); }}>
      {expanded ? "Ẩn kết quả" : "Xem kết quả"}
    </button>
    <div id="care-user-reports" hidden={!expanded} aria-busy={state === "loading"}>
      {state === "loading" && <p role="status">Đang tải kết quả…</p>}
      {state === "error" && <div role="alert"><p>Không thể tải kết quả lúc này.</p><button type="button" onClick={() => void load()}>Thử lại</button></div>}
      {state === "loaded" && (reports.length ? <ul>
        {reports.map(report => <li key={report.report_id}>
          <p>{report.display_name} · Người dùng tự kiểm tra</p>
          <time dateTime={report.accepted_at}>{new Date(report.accepted_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</time>{" · "}
          <a href={report.report_path} rel="nofollow">Xem báo cáo</a>
        </li>)}
      </ul> : <p>Chưa có kết quả tự kiểm tra của người dùng.</p>)}
    </div>
  </section>;
}
