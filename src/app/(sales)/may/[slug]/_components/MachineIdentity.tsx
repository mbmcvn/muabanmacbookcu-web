"use client";

import { useEffect, useRef, useState } from "react";
import { copyText } from "@/lib/copy-text";
import { copyPublicMachineId, publicMachineId } from "@/lib/public-machine-id";

export function MachineIdentity({ code }: { code?: string | null }) {
  const id = publicMachineId(code);
  const [feedback, setFeedback] = useState<"idle" | "copied" | "failed">("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (resetTimer.current !== null) clearTimeout(resetTimer.current);
  }, []);

  if (!id) return null;
  const copy = async () => {
    const copied = await copyPublicMachineId(id, copyText);
    setFeedback(copied ? "copied" : "failed");
    if (resetTimer.current !== null) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setFeedback("idle"), 2200);
  };
  const status = feedback === "copied" ? "Đã sao chép" : feedback === "failed" ? "Không thể sao chép" : "";
  return (
    <button
      type="button"
      className="machine-id-copy"
      aria-label={"Sao chép Machine ID " + id}
      title="Sao chép Machine ID"
      onClick={copy}
      data-feedback={feedback}
    >
      <span className="public-machine-id">{id}</span>
      <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
        {feedback === "copied" ? <path d="m5 12 4 4L19 6" /> : <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V4H4v12h4" /></>}
      </svg>
      <span className="machine-id-copy-feedback" aria-live="polite" aria-atomic="true">{status}</span>
    </button>
  );
}
