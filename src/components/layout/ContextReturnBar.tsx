"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const STORAGE_KEY = "mbmc:return-context";
const ACTIVE_CLASS = "return-context-active";

const RETURN_CONTEXTS = {
  kai: {
    label: "Quay lại thẻ Kai",
    href: "https://auryes.vn/kai",
  },
} as const;

type ReturnContextKey = keyof typeof RETURN_CONTEXTS;

function isReturnContext(value: string | null): value is ReturnContextKey {
  return value !== null && value in RETURN_CONTEXTS;
}

function readStoredContext(): ReturnContextKey | null {
  try {
    const value = window.sessionStorage.getItem(STORAGE_KEY);
    return isReturnContext(value) ? value : null;
  } catch {
    return null;
  }
}

function storeContext(context: ReturnContextKey) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, context);
  } catch {
    // The query remains sufficient for this page when storage is unavailable.
  }
}

function clearStoredContext() {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Dismiss and return navigation still work when storage is unavailable.
  }
}

export function ContextReturnBar() {
  const searchParams = useSearchParams();
  const [activeContext, setActiveContext] = useState<ReturnContextKey | null>(null);

  useEffect(() => {
    const queryContext = searchParams.get("context");
    let nextContext: ReturnContextKey | null;

    if (isReturnContext(queryContext)) {
      storeContext(queryContext);
      nextContext = queryContext;
    } else {
      nextContext = readStoredContext();
    }

    queueMicrotask(() => setActiveContext(nextContext));
  }, [searchParams]);

  useEffect(() => {
    if (!activeContext) return;

    document.documentElement.classList.add(ACTIVE_CLASS);
    return () => document.documentElement.classList.remove(ACTIVE_CLASS);
  }, [activeContext]);

  if (!activeContext) return null;

  const context = RETURN_CONTEXTS[activeContext];

  function dismiss() {
    clearStoredContext();

    const url = new URL(window.location.href);
    url.searchParams.delete("context");
    window.history.replaceState(
      window.history.state,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );

    setActiveContext(null);
  }

  function returnToContext() {
    clearStoredContext();
    window.location.assign(context.href);
  }

  return (
    <aside className="context-return-layer" aria-label="Điều hướng quay lại">
      <div className="context-return-bar">
        <button className="context-return-action" type="button" onClick={returnToContext}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19 12H5m6-6-6 6 6 6" />
          </svg>
          <span>{context.label}</span>
        </button>
        <button
          className="context-return-close"
          type="button"
          aria-label="Đóng thanh quay lại thẻ Kai"
          onClick={dismiss}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
