"use client";

import { useEffect, useRef, useState } from "react";
import { useContactChannel } from "@/hooks/useContactChannel";
import { copyMachineShareUrl } from "@/lib/contact-routing";
import { canonicalMachineUrl } from "@/lib/public-machine-url";

type Feedback = "idle" | "copied" | "failed";

export function CopyMachineLink({ slug }: { slug: string }) {
  const { shareReferralCode: referralCode } = useContactChannel();
  const [feedback, setFeedback] = useState<Feedback>("idle");
  const resetTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    },
    [],
  );

  const copy = async () => {
    const copied = await copyMachineShareUrl(
      canonicalMachineUrl(slug),
      referralCode,
      (value) => navigator.clipboard.writeText(value),
    );
    setFeedback(copied ? "copied" : "failed");
    if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setFeedback("idle"), 2200);
  };

  const label =
    feedback === "copied"
      ? "Đã sao chép liên kết"
      : feedback === "failed"
        ? "Không thể sao chép"
        : "Sao chép liên kết";

  return (
    <button className="machine-share-action" type="button" onClick={copy}>
      <span aria-live="polite">{label}</span>
    </button>
  );
}
