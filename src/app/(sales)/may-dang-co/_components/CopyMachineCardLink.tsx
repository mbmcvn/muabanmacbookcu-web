"use client";

import { useEffect, useRef, useState } from "react";
import { useContactChannel } from "@/hooks/useContactChannel";
import { copyMachineShareUrl } from "@/lib/contact-routing";
import { canonicalMachineUrl } from "@/lib/public-machine-url";

type Feedback = "idle" | "copied" | "failed";

export function CopyMachineCardLink({
  code,
  slug,
}: {
  code: string;
  slug: string;
}) {
  const { referralCode } = useContactChannel();
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
    resetTimer.current = window.setTimeout(() => setFeedback("idle"), 1400);
  };

  const status =
    feedback === "copied"
      ? "Đã sao chép liên kết"
      : feedback === "failed"
        ? "Không thể sao chép liên kết"
        : "";
  return (
    <button
      className="machine-card-copy-link"
      type="button"
      onClick={copy}
      aria-label={`Sao chép liên kết máy ${code}`}
      title="Sao chép liên kết"
      data-feedback={feedback}
    >
      {feedback === "copied" ? (
        <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
          <path d="m5 12 4 4L19 6" />
        </svg>
      ) : (
        <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
          <path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" />
          <path d="M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1" />
        </svg>
      )}
      <span className="sr-only" aria-live="polite">
        {status}
      </span>
    </button>
  );
}
