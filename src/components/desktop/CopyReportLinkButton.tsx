"use client";

import { useEffect, useRef, useState } from "react";
import { canonicalPublicReportPath } from "@/lib/care-report/desktop-public-report-view";

export default function CopyReportLinkButton({
  reportId,
  deviceName,
}: {
  reportId: string;
  deviceName: string;
}) {
  const path = canonicalPublicReportPath(reportId);
  const [message, setMessage] = useState("");
  const [qrOpen, setQrOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  function stableUrl() {
    return `https://mbmc.vn${path}`;
  }

  useEffect(() => {
    if (!qrOpen || !canvasRef.current) return;
    let active = true;
    void fetch(`https://app.mbmc.vn/api/public/desktop/report/${reportId}/qr`).then(r => r.blob()).then(createImageBitmap).then((bitmap) => {
      if (!active || !canvasRef.current) return;
      const canvas = canvasRef.current; canvas.width = 184; canvas.height = 184; canvas.getContext("2d")?.drawImage(bitmap, 0, 0, 184, 184); bitmap.close();
    });
    return () => {
      active = false;
    };
  }, [reportId, qrOpen]);

  async function copy(value: string, confirmation: string) {
    try {
      await navigator.clipboard.writeText(value);
      setMessage(confirmation);
    } catch {
      setMessage("Không thể sao chép");
    }
  }

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${deviceName} · Báo cáo kiểm tra MBMC`,
          text: "Báo cáo kiểm tra thiết bị MBMC",
          url: stableUrl(),
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
      }
    }
    await copy(stableUrl(), "Đã sao chép liên kết");
  }

  return (
    <div className="space-y-3">
      <p className="break-all font-mono text-[11px] leading-5 text-slate-300">
        {path}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void share()}
          className="rounded-full bg-blue-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
        >
          Chia sẻ báo cáo
        </button>
        <button
          type="button"
          onClick={() => void copy(stableUrl(), "Đã sao chép liên kết")}
          className="rounded-full border border-white/25 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Sao chép liên kết
        </button>
        <button
          type="button"
          onClick={() => void copy(reportId, "Đã sao chép mã báo cáo")}
          className="rounded-full border border-white/25 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Sao chép mã
        </button>
        <button
          type="button"
          aria-expanded={qrOpen}
          onClick={() => setQrOpen((value) => !value)}
          className="rounded-full border border-white/25 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          {qrOpen ? "Ẩn mã QR" : "Hiện mã QR"}
        </button>
      </div>
      <p aria-live="polite" className="min-h-5 text-xs text-blue-200">
        {message}
      </p>
      {qrOpen && (
        <div className="w-fit rounded-2xl bg-white p-3 text-center">
          <canvas ref={canvasRef} aria-label="Mã QR dẫn đến báo cáo này" />
          <p className="mt-1 text-[10px] font-semibold text-slate-700">
            Quét để mở báo cáo
          </p>
        </div>
      )}
    </div>
  );
}
