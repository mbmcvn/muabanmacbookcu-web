"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
const KEY = "mbmc_experience_ctv_join";
const ACTIVE_CLASS = "experience-mode-active";
export function ExplorationMode() {
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);
  const [fallback, setFallback] = useState(false);
  useEffect(() => {
    if (searchParams.get("experience") === "ctv-join")
      sessionStorage.setItem(KEY, "1");
    queueMicrotask(() => setActive(sessionStorage.getItem(KEY) === "1"));
  }, [searchParams]);
  useEffect(() => {
    if (!active) return;
    document.documentElement.classList.add(ACTIVE_CLASS);
    return () => document.documentElement.classList.remove(ACTIVE_CLASS);
  }, [active]);
  if (!active) return null;
  return (
    <aside className="experience-bar" aria-label="Chế độ trải nghiệm CTV">
      <div className="container experience-bar-inner">
        <div className="experience-bar-copy">
          <strong>Trải nghiệm MBMC · CTV</strong>
          <span>Bạn đang xem website như một khách hàng.</span>
        </div>
        <button
          type="button"
          onClick={() => {
            sessionStorage.removeItem(KEY);
            window.close();
            setTimeout(() => setFallback(true), 150);
          }}
        >
          Đóng trải nghiệm &amp; quay lại bài test
        </button>
        {fallback && (
          <span className="experience-fallback">
            Đóng tab này để quay lại bài test.
          </span>
        )}
      </div>
    </aside>
  );
}
