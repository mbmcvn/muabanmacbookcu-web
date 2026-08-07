"use client";

import { useEffect, useRef, useState } from "react";
import type { InventoryUrlState } from "@/data/machines/public-inventory-query";
import {
  copyInventoryShareUrl,
  inventoryShareLabel,
} from "@/data/machines/public-inventory-query";
import { useContactChannel } from "@/hooks/useContactChannel";

export function CopyInventoryLink({ state }: { state: InventoryUrlState }) {
  const { referralCode } = useContactChannel();
  const [feedback, setFeedback] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const resetTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    },
    [],
  );

  const copy = async () => {
    const copied = await copyInventoryShareUrl(
      window.location.origin,
      state,
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
        : inventoryShareLabel(state.facets);

  return (
    <button className="copy-inventory-link" type="button" onClick={copy}>
      <span aria-live="polite">{label}</span>
    </button>
  );
}
