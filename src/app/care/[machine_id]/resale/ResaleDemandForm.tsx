"use client";
import { useState } from "react";
import styles from "../support/support.module.css";
export function ResaleDemandForm({ machineCode }: { machineCode: string }) {
  const [note, setNote] = useState(""),
    [submissionKey] = useState(() => crypto.randomUUID());
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [receipt, setReceipt] = useState<string | null>(null);
  async function submit() {
    if (busy || note.length > 2000) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(
        `/api/care/${encodeURIComponent(machineCode)}/resale`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ note, submissionKey }),
        },
      );
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error("failed");
      setReceipt(data.submissionId);
    } catch {
      setError("Chưa thể gửi yêu cầu. Vui lòng thử lại.");
    } finally {
      setBusy(false);
    }
  }
  if (receipt)
    return (
      <section className={styles.card} aria-live="polite">
        <p className={styles.eyebrow}>Yêu cầu đã gửi</p>
        <h1>MBMC đã nhận nhu cầu của bạn</h1>
        <p>
          Mã yêu cầu: <strong>{receipt}</strong>
        </p>
        <p>MBMC sẽ liên hệ qua số điện thoại đã xác thực trong Care.</p>
      </section>
    );
  return (
    <section className={styles.card}>
      <h2>Nhận định giá cho chiếc Mac này</h2>
      <p>Thông tin máy và số điện thoại Care đã được điền từ hồ sơ xác thực.</p>
      <label className={styles.field}>
        <strong>Ghi chú thêm (không bắt buộc)</strong>
        <span>
          Bạn có thể cho MBMC biết nhu cầu đổi máy hoặc thời gian thuận tiện để
          liên hệ.
        </span>
        <textarea
          rows={6}
          maxLength={2000}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <small>{note.length}/2000</small>
      </label>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <div className={styles.actions}>
        <button
          className={styles.primary}
          type="button"
          disabled={busy}
          onClick={submit}
        >
          {busy ? "Đang gửi…" : "Gửi yêu cầu định giá"}
        </button>
      </div>
    </section>
  );
}
