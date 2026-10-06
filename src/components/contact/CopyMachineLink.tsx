"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useContactChannel } from "@/hooks/useContactChannel";
import { copyMachineShareUrl } from "@/lib/contact-routing";
import { canonicalMachineUrl } from "@/lib/public-machine-url";
import { copyText } from "@/lib/copy-text";

type Feedback = "idle" | "copied" | "failed";

export function CopyMachineLink({ slug, machineId, compact = false }: { slug: string; machineId?: string | null; compact?: boolean }) {
  const { shareReferralCode: referralCode } = useContactChannel();
  const [feedback, setFeedback] = useState<Feedback>("idle");
  const resetTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    },
    [],
  );

  const copy = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const copied = await copyMachineShareUrl(
      canonicalMachineUrl(slug),
      referralCode,
      copyText,
    );
    setFeedback(copied ? "copied" : "failed");
    if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setFeedback("idle"), compact ? 1200 : 2200);
  };

  const label =
    feedback === "copied"
      ? "Đã sao chép liên kết"
      : feedback === "failed"
        ? "Không thể sao chép"
        : "Sao chép liên kết";

  return (
    <button className={compact ? "machine-card-copy" : "machine-share-action"} type="button" data-feedback={feedback} title={label} aria-label={compact ? `Sao chép liên kết máy ${machineId ?? ""}`.trim() : undefined} onClick={copy}>
      {compact ? <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{feedback === "copied" ? <path d="m5 12 4 4L19 6" /> : <path d="m9 15 6-6M11 7l1.5-1.5a4.24 4.24 0 0 1 6 6L17 13M7 11l-1.5 1.5a4.24 4.24 0 0 0 6 6L13 17" />}</svg> : null}
      <span className={compact ? "visually-hidden" : undefined} aria-live="polite">{label}</span>
      {compact && feedback === "failed" ? <span className="machine-card-copy-error">Không thể sao chép</span> : null}
    </button>
  );
}
