"use client";

import { useState } from "react";
import { canonicalPublicReportPath } from "@/lib/care-report/desktop-public-report-view";
import { copyText } from "@/lib/copy-text";

export default function CopyReportLinkButton({
  reportId,
  deviceName,
  qrDataUrl,
}: {
  reportId: string;
  deviceName: string;
  qrDataUrl?: string;
}) {
  const path = canonicalPublicReportPath(reportId);
  const [message, setMessage] = useState("");
  function stableUrl() {
    return `https://mbmc.vn${path}`;
  }

  async function copy(value: string, confirmation: string) {
    try {
      await copyText(value);
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
        {stableUrl()}
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
      </div>
      <p aria-live="polite" className="min-h-5 text-xs text-blue-200">
        {message}
      </p>
      {qrDataUrl && <div className="w-fit max-w-full rounded-2xl bg-white p-4 text-center text-slate-950">
        {/* A local PNG with a fixed white quiet zone preserves contrast in either theme. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrDataUrl} width={232} height={232} alt="Mã QR để mở báo cáo công khai này" className="mx-auto h-auto max-w-full" />
        <p className="mt-2 text-sm font-semibold">Quét mã để mở báo cáo</p>
        <p className="mt-2 max-w-72 select-text break-all text-xs">{stableUrl()}</p>
      </div>}
    </div>
  );
}
